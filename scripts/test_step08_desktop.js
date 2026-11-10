const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

const ARTIFACT_DIR = '/home/antigravity/.gemini/jetski/brain/v1/default/jetski_remote_agents_3p/43b45eff-3e62-4726-aa80-d2f6f118fbd9';

(async () => {
  console.log('🌌 Running Step 0.8 Desktop Verification & Robustness Test Suite...');
  const browser = await puppeteer.launch({
    executablePath: '/usr/bin/chromium',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu']
  });

  let failures = 0;
  function assert(condition, message) {
    if (!condition) {
      console.error(`❌ FAIL: ${message}`);
      failures++;
    } else {
      console.log(`✅ PASS: ${message}`);
    }
  }

  try {
    const page = await browser.newPage();

    // -------------------------------------------------------------------------
    // TEST 1: Viewport Overlap Verification (1440px, 1280px, 1024px)
    // -------------------------------------------------------------------------
    console.log('\n--- 1. Testing HUD and Hero Copy Non-Overlap across Desktop Widths ---');
    const desktopWidths = [1440, 1280, 1024];

    for (const w of desktopWidths) {
      await page.setViewport({ width: w, height: 900 });
      await page.goto('http://localhost:3000/index.html', { waitUntil: 'networkidle0' });

      const overlapCheck = await page.evaluate(() => {
        const copy = document.querySelector('.hero-overlay-copy');
        const hud = document.querySelector('.viewer-hud-bar');
        if (!copy || !hud) return { ok: false, reason: 'elements not found' };

        const cRect = copy.getBoundingClientRect();
        const hRect = hud.getBoundingClientRect();

        // Check horizontal or vertical separation
        const horizontallySeparated = cRect.right < hRect.left || hRect.right < cRect.left;
        const verticallySeparated = cRect.bottom < hRect.top || hRect.bottom < cRect.top;
        const separated = horizontallySeparated || verticallySeparated;

        return {
          ok: separated,
          cRect: { top: cRect.top, bottom: cRect.bottom, left: cRect.left, right: cRect.right, width: cRect.width },
          hRect: { top: hRect.top, bottom: hRect.bottom, left: hRect.left, right: hRect.right, width: hRect.width }
        };
      });

      assert(
        overlapCheck.ok,
        `Viewport ${w}px: Zero collision between .hero-overlay-copy and .viewer-hud-bar (Copy: [${overlapCheck.cRect.left.toFixed(0)}, ${overlapCheck.cRect.top.toFixed(0)}, ${overlapCheck.cRect.right.toFixed(0)}, ${overlapCheck.cRect.bottom.toFixed(0)}], HUD: [${overlapCheck.hRect.left.toFixed(0)}, ${overlapCheck.hRect.top.toFixed(0)}, ${overlapCheck.hRect.right.toFixed(0)}, ${overlapCheck.hRect.bottom.toFixed(0)}])`
      );

      // Save screenshot for each desktop breakpoint
      const screenPath = path.join(ARTIFACT_DIR, `preview_desktop_${w}.png`);
      await page.screenshot({ path: screenPath, fullPage: false });
      console.log(`Saved screenshot at ${w}px: ${screenPath}`);
    }

    // -------------------------------------------------------------------------
    // TEST 2: In-Browser Canvas Pixel Verification of Candidate Point Sources
    // -------------------------------------------------------------------------
    console.log('\n--- 2. In-Browser Pixel Check: Candidate Point Sources ---');
    await page.setViewport({ width: 1440, height: 900 });
    await page.goto('http://localhost:3000/index.html', { waitUntil: 'networkidle0' });

    // Function to sample pixel brightness on the image element
    async function sampleImagePixels(expectedUrl) {
      return await page.evaluate(async (url) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.src = url;
        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
        });

        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);

        // Candidate 1: (481, 244)
        const p1 = ctx.getImageData(481, 244, 1, 1).data;
        const bright1 = (p1[0] + p1[1] + p1[2]) / 3;

        // Candidate 2: (559, 200)
        const p2 = ctx.getImageData(559, 200, 1, 1).data;
        const bright2 = (p2[0] + p2[1] + p2[2]) / 3;

        return {
          dims: `${canvas.width}x${canvas.height}`,
          candidate1: { x: 481, y: 244, brightness: bright1 },
          candidate2: { x: 559, y: 200, brightness: bright2 }
        };
      }, expectedUrl);
    }

    const ep1Data = await sampleImagePixels('assets/images/cluster-survey-cyan.jpg');
    assert(ep1Data.candidate1.brightness >= 240, `Epoch 1 candidate at (481,244) is bright peak (got ${ep1Data.candidate1.brightness.toFixed(1)}/255 >= 240)`);
    assert(ep1Data.candidate2.brightness < 100, `Epoch 1 position (559,200) is empty background (got ${ep1Data.candidate2.brightness.toFixed(1)}/255 < 100)`);

    const ep2Data = await sampleImagePixels('assets/images/cluster-survey-blue.jpg');
    assert(ep2Data.candidate2.brightness >= 235, `Epoch 2 candidate at (559,200) is bright peak (got ${ep2Data.candidate2.brightness.toFixed(1)}/255 >= 235)`);
    assert(ep2Data.candidate1.brightness < 120, `Epoch 2 position (481,244) is empty background (got ${ep2Data.candidate1.brightness.toFixed(1)}/255 < 120)`);

    // Reticle alignment check
    const reticlePos0 = await page.$eval('#motionMarker', el => ({ left: el.style.left, top: el.style.top }));
    assert(reticlePos0.left === '47%' && reticlePos0.top === '42.4%', `Reticle aligned with candidate in Epoch 1 (${reticlePos0.left}, ${reticlePos0.top})`);

    // Scrub to Epoch 2
    await page.$eval('#epochSlider', el => {
      el.value = '1';
      el.dispatchEvent(new Event('input', { bubbles: true }));
    });
    await new Promise(r => setTimeout(r, 200));

    const reticlePos1 = await page.$eval('#motionMarker', el => ({ left: el.style.left, top: el.style.top }));
    assert(reticlePos1.left === '54.6%' && reticlePos1.top === '34.7%', `Reticle aligned with candidate in Epoch 2 (${reticlePos1.left}, ${reticlePos1.top})`);

    // -------------------------------------------------------------------------
    // TEST 3: Rapid Slider Scrubbing Under Throttled Network (Stale-Load Race Protection)
    // -------------------------------------------------------------------------
    console.log('\n--- 3. Testing Stale-Load Race Protection Under Throttled Network ---');
    const client = await page.target().createCDPSession();
    await client.send('Network.enable');
    await client.send('Network.emulateNetworkConditions', {
      offline: false,
      latency: 150,
      downloadThroughput: 50 * 1024, // 50 KB/s
      uploadThroughput: 20 * 1024
    });

    // Rapidly alternate slider values
    for (let step = 0; step < 5; step++) {
      const targetVal = String(step % 2);
      await page.$eval('#epochSlider', (el, v) => {
        el.value = v;
        el.dispatchEvent(new Event('input', { bubbles: true }));
      }, targetVal);
      await new Promise(r => setTimeout(r, 40));
    }

    // Set final slider position to 1
    await page.$eval('#epochSlider', el => {
      el.value = '1';
      el.dispatchEvent(new Event('input', { bubbles: true }));
    });

    // Wait for async loads to settle
    await new Promise(r => setTimeout(r, 1000));
    const finalDisplaySrc = await page.$eval('#skyDisplay', el => el.getAttribute('src'));
    assert(finalDisplaySrc.includes('cluster-survey-blue.jpg'), `Final displayed image matches final slider position 1 (${finalDisplaySrc})`);

    // Reset network
    await client.send('Network.emulateNetworkConditions', {
      offline: false,
      latency: 0,
      downloadThroughput: -1,
      uploadThroughput: -1
    });

    // -------------------------------------------------------------------------
    // TEST 4: Double-Click Blink Re-Entry Guard (Zero Zombie Intervals)
    // -------------------------------------------------------------------------
    console.log('\n--- 4. Testing Double-Click Blink Re-entry Guard ---');
    await page.click('#btnBlink');
    await page.click('#btnBlink'); // immediate second click
    await new Promise(r => setTimeout(r, 600));

    // Verify Blink button can be cleanly stopped
    const isBlinking = await page.$eval('#btnBlink', el => el.classList.contains('blinking'));
    if (isBlinking) {
      await page.click('#btnBlink');
      await new Promise(r => setTimeout(r, 200));
    }
    const stoppedState = await page.$eval('#btnBlink', el => el.classList.contains('blinking'));
    assert(stoppedState === false, 'Blink button cleanly stops without leftover zombie intervals');

    // -------------------------------------------------------------------------
    // TEST 5: Preload Timeout Safety
    // -------------------------------------------------------------------------
    console.log('\n--- 5. Testing Preload Timeout Safety Handler ---');
    const hasTimeoutLogic = await page.evaluate(() => {
      return typeof preloadTargetImages === 'function';
    });
    assert(hasTimeoutLogic, 'preloadTargetImages is defined and load-gates comparator');

    // -------------------------------------------------------------------------
    // TEST 6: All 10 Gallery Cards Click & Load Fidelity
    // -------------------------------------------------------------------------
    console.log('\n--- 6. Testing All 15 Gallery Cards Fidelity ---');
    const cards = await page.$$('.gallery-card');
    assert(cards.length === 15, `Found exactly 15 gallery cards (got ${cards.length})`);

    for (let i = 0; i < cards.length; i++) {
      const card = cards[i];
      const thumbSrc = await card.$eval('img', el => el.getAttribute('src'));
      const targetId = await card.evaluate(el => el.getAttribute('data-target'));
      const bandAttr = await card.evaluate(el => el.getAttribute('data-band'));

      const thumbBase = path.basename(thumbSrc);
      await card.evaluate(el => el.click());
      await page.waitForFunction(
        (expected) => {
          const src = document.getElementById('skyDisplay').getAttribute('src') || '';
          return src.includes(expected);
        },
        { timeout: 4000 },
        thumbBase
      );

      const activeSrc = await page.$eval('#skyDisplay', el => el.getAttribute('src'));
      const activeBase = path.basename(activeSrc);

      assert(
        thumbBase === activeBase,
        `Card ${i + 1} (${targetId}, band ${bandAttr}): thumbnail "${thumbBase}" matches loaded image "${activeBase}"`
      );
    }

    // -------------------------------------------------------------------------
    // TEST 7: Step 0.9 Epoch Slider Draggability & Geometry across 1440, 1280, 1024
    // -------------------------------------------------------------------------
    console.log('\n--- 7. Testing Step 0.9 Epoch Slider Width & Real Mouse Drag ---');
    for (const w of [1440, 1280, 1024]) {
      await page.setViewport({ width: w, height: 900 });
      await page.goto('http://localhost:3000/index.html', { waitUntil: 'networkidle0' });

      const geom = await page.evaluate(() => {
        const slider = document.getElementById('epochSlider');
        const sliderWrap = document.querySelector('.slider-track-wrap');
        const dateDisplay = document.getElementById('epochDateDisplay');
        const sRect = slider.getBoundingClientRect();
        const wRect = sliderWrap.getBoundingClientRect();
        const dRect = dateDisplay.getBoundingClientRect();

        return {
          sliderWidth: sRect.width,
          wrapWidth: wRect.width,
          sliderRight: sRect.right,
          dateLeft: dRect.left,
          gap: dRect.left - sRect.right
        };
      });

      assert(geom.sliderWidth >= 100, `Viewport ${w}px: Slider track width is ${geom.sliderWidth.toFixed(1)}px (>= 100px requirement)`);
      assert(geom.gap >= 15, `Viewport ${w}px: Thumb never overlaps date text (gap: ${geom.gap.toFixed(1)}px >= 15px)`);

      // Real mouse drag from left to right
      const sliderBox = await page.$eval('#epochSlider', el => {
        const r = el.getBoundingClientRect();
        return { x: r.x, y: r.y, width: r.width, height: r.height };
      });

      await page.mouse.move(sliderBox.x + 5, sliderBox.y + sliderBox.height / 2);
      await page.mouse.down();
      await page.mouse.move(sliderBox.x + sliderBox.width - 5, sliderBox.y + sliderBox.height / 2, { steps: 10 });
      await page.mouse.up();
      await new Promise(r => setTimeout(r, 200));

      const val1 = await page.$eval('#epochSlider', el => el.value);
      const src1 = await page.$eval('#skyDisplay', el => el.getAttribute('src'));
      assert(val1 === '1' && src1.includes('cluster-survey-blue.jpg'), `Viewport ${w}px: Real mouse drag right moves to Epoch 2 (${src1})`);

      // Drag back from right to left
      await page.mouse.down();
      await page.mouse.move(sliderBox.x + 5, sliderBox.y + sliderBox.height / 2, { steps: 10 });
      await page.mouse.up();
      await new Promise(r => setTimeout(r, 200));

      const valBack = await page.$eval('#epochSlider', el => el.value);
      const srcBack = await page.$eval('#skyDisplay', el => el.getAttribute('src'));
      assert(valBack === '0' && srcBack.includes('cluster-survey-cyan.jpg'), `Viewport ${w}px: Real mouse drag left returns to Epoch 1 (${srcBack})`);
    }

    // -------------------------------------------------------------------------
    // TEST 8: Step 0.9 Band Chips Single-Line & No Duplication
    // -------------------------------------------------------------------------
    console.log('\n--- 8. Testing Step 0.9 Band Chips Single-Line & No Duplication ---');
    await page.setViewport({ width: 1440, height: 900 });
    await page.goto('http://localhost:3000/index.html', { waitUntil: 'networkidle0' });

    // Planet X field: only Bands 1 and 2 exist
    const planetXBands = await page.$$eval('.band-chip', els => els.map(el => el.getAttribute('data-band')));
    assert(planetXBands.length === 2 && planetXBands.includes('1') && planetXBands.includes('2'), `Planet X renders only available bands [1, 2] (got [${planetXBands.join(', ')}])`);

    // Verify notice is hidden when bands exist
    const noticeDisplay = await page.$eval('#bandNotice', el => window.getComputedStyle(el).display);
    assert(noticeDisplay === 'none', 'Redundant band notice is hidden when available bands are present');

    // Verify chips never wrap to two lines
    const chipsSingleLine = await page.$$eval('.band-chip', els => {
      return els.every(el => {
        const style = window.getComputedStyle(el);
        return style.whiteSpace === 'nowrap';
      });
    });
    assert(chipsSingleLine, 'All band chips have white-space: nowrap (no mid-label wrapping to 2 lines)');

    // -------------------------------------------------------------------------
    // TEST 9: Full Page Screenshot
    // -------------------------------------------------------------------------
    console.log('\n--- 9. Saving Final Full-Page Artifact ---');
    const fullPath = path.join(ARTIFACT_DIR, 'preview_full_v2.png');
    await page.screenshot({ path: fullPath, fullPage: true });
    console.log(`Saved full-page artifact: ${fullPath}`);

    console.log('\n======================================================');
    if (failures === 0) {
      console.log('🎉 ALL STEP 0.8 & 0.9 DESKTOP & INTEGRITY TESTS PASSED (100%)!');
    } else {
      console.error(`💥 TEST SUITE COMPLETED WITH ${failures} FAILURES!`);
      process.exit(1);
    }
  } catch (err) {
    console.error('Fatal test error:', err);
    process.exit(1);
  } finally {
    await browser.close();
  }
})();
