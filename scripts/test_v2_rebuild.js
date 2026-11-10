const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

const ARTIFACT_DIR = '/home/antigravity/.gemini/jetski/brain/v1/default/jetski_remote_agents_3p/43b45eff-3e62-4726-aa80-d2f6f118fbd9';

(async () => {
  console.log('🚀 Starting PROJECT SPECTRALx Comprehensive Test Suite (v2 Rebuild)...');
  const browser = await puppeteer.launch({
    executablePath: '/usr/bin/chromium',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu']
  });

  let testFailures = 0;
  function assert(condition, message) {
    if (!condition) {
      console.error(`❌ FAIL: ${message}`);
      testFailures++;
    } else {
      console.log(`✅ PASS: ${message}`);
    }
  }

  try {
    const page = await browser.newPage();
    
    // Check for unexpected native dialogs
    let nativeDialogTriggered = false;
    page.on('dialog', async dialog => {
      nativeDialogTriggered = true;
      console.error(`❌ UNEXPECTED NATIVE DIALOG: [${dialog.type()}] "${dialog.message()}"`);
      await dialog.dismiss();
    });

    await page.setViewport({ width: 1440, height: 900 });
    await page.goto('http://localhost:3000/index.html', { waitUntil: 'networkidle0' });

    console.log('\n--- 1. Testing Full-Bleed Edge-to-Edge Hero Viewer ---');
    const stageWidth = await page.$eval('.viewer-fullbleed-stage', el => el.getBoundingClientRect().width);
    const windowWidth = await page.evaluate(() => window.innerWidth);
    assert(stageWidth === windowWidth, `Viewer stage width is full-bleed edge-to-edge (${stageWidth}px === ${windowWidth}px)`);

    const hasHeroBlockAbove = await page.evaluate(() => {
      const viewer = document.getElementById('viewer');
      const prev = viewer.previousElementSibling;
      return prev && prev.tagName !== 'HEADER';
    });
    assert(!hasHeroBlockAbove, 'Viewer is the hero directly below header (no separate 177px hero block above)');

    const heroCopyOverlaid = await page.evaluate(() => {
      const copy = document.querySelector('.hero-overlay-copy');
      const stage = document.querySelector('.viewer-fullbleed-stage');
      return stage.contains(copy);
    });
    assert(heroCopyOverlaid, 'Hero copy is overlaid directly on the sky stage');

    console.log('\n--- 2. Testing HUD Buttons Real Mouse Clicks (pointer-events) ---');
    const hudActionsPE = await page.$eval('.hud-actions', el => window.getComputedStyle(el).pointerEvents);
    const markerBtnPE = await page.$eval('#toggleMarkerBtn', el => window.getComputedStyle(el).pointerEvents);
    const crosshairBtnPE = await page.$eval('#toggleCrosshairBtn', el => window.getComputedStyle(el).pointerEvents);

    assert(hudActionsPE === 'auto', `.hud-actions pointer-events is "auto" (got "${hudActionsPE}")`);
    assert(markerBtnPE === 'auto', `#toggleMarkerBtn pointer-events is "auto" (got "${markerBtnPE}")`);
    assert(crosshairBtnPE === 'auto', `#toggleCrosshairBtn pointer-events is "auto" (got "${crosshairBtnPE}")`);

    // Click marker button
    assert(await page.$eval('#toggleMarkerBtn', el => el.classList.contains('active')), 'Marker starts active');
    await page.click('#toggleMarkerBtn');
    assert(!(await page.$eval('#toggleMarkerBtn', el => el.classList.contains('active'))), 'Click toggles marker off');
    assert(!(await page.$eval('#motionMarker', el => el.classList.contains('visible'))), 'Motion marker reticle hidden');
    await page.click('#toggleMarkerBtn');
    assert(await page.$eval('#toggleMarkerBtn', el => el.classList.contains('active')), 'Second click toggles marker on');

    // Click crosshair button
    assert(!(await page.$eval('#toggleCrosshairBtn', el => el.classList.contains('active'))), 'Crosshair starts inactive');
    await page.click('#toggleCrosshairBtn');
    assert(await page.$eval('#toggleCrosshairBtn', el => el.classList.contains('active')), 'Click toggles crosshair on');
    assert(await page.$eval('#crosshairGrid', el => el.classList.contains('active')), 'Crosshair reticle displayed');
    await page.click('#toggleCrosshairBtn');
    assert(!(await page.$eval('#toggleCrosshairBtn', el => el.classList.contains('active'))), 'Second click toggles crosshair off');

    console.log('\n--- 3. Testing Distinct Epoch Files (Planet X Field) ---');
    const epoch0Src = await page.$eval('#skyDisplay', el => el.getAttribute('src'));
    assert(epoch0Src.includes('cluster-survey-cyan.jpg'), `Epoch 0 loads cyan observation (${epoch0Src})`);

    // Move slider to epoch 1
    await page.$eval('#epochSlider', el => {
      el.value = '1';
      el.dispatchEvent(new Event('input', { bubbles: true }));
    });
    await new Promise(r => setTimeout(r, 200));

    const epoch1Src = await page.$eval('#skyDisplay', el => el.getAttribute('src'));
    assert(epoch1Src.includes('cluster-survey-blue.jpg'), `Epoch 1 loads distinct blue observation (${epoch1Src})`);
    assert(epoch0Src !== epoch1Src, 'Epoch 0 and Epoch 1 have distinct filenames');

    console.log('\n--- 4. Testing Network Throttling (1.5 Mbps) & Load-Gated Blink Engine ---');
    // Enable Chrome DevTools Protocol Network Throttling (simulate 1.5 Mbps / 187.5 KB/s)
    const client = await page.target().createCDPSession();
    await client.send('Network.enable');
    await client.send('Network.emulateNetworkConditions', {
      offline: false,
      latency: 50,
      downloadThroughput: 187.5 * 1024, // 1.5 Mbps
      uploadThroughput: 50 * 1024
    });

    const blinkStart = Date.now();
    await page.click('#btnBlink');
    await page.waitForFunction(() => document.getElementById('btnBlink').classList.contains('blinking'), { timeout: 8000 });
    const blinkElapsed = Date.now() - blinkStart;
    assert(blinkElapsed < 6000, `Blink started in ${blinkElapsed}ms under 1.5 Mbps throttle (no 10s timeout)`);

    // Sample 5 intervals over 2.5s under network throttling
    let dimmedCount = 0;
    for (let i = 0; i < 5; i++) {
      const opacity = await page.$eval('#skyDisplay', el => window.getComputedStyle(el).opacity);
      if (parseFloat(opacity) < 0.9) dimmedCount++;
      await new Promise(r => setTimeout(r, 500));
    }
    assert(dimmedCount === 0, `No dimmed half-loaded frames displayed under slow network (${dimmedCount} dimmed frames observed)`);

    await page.click('#btnBlink');
    assert(!(await page.$eval('#btnBlink', el => el.classList.contains('blinking'))), 'Clicking blink stops comparator');

    // Reset network throttling to normal
    await client.send('Network.emulateNetworkConditions', {
      offline: false,
      latency: 0,
      downloadThroughput: -1,
      uploadThroughput: -1
    });

    console.log('\n--- 5. Testing Blink Disabled on Single-Epoch Targets ---');
    await page.select('#targetSelect', 'galactic_bulge');
    await new Promise(r => setTimeout(r, 200));

    const blinkDisabled = await page.$eval('#btnBlink', el => el.disabled);
    const blinkTitle = await page.$eval('#btnBlink', el => el.getAttribute('title'));
    const blinkBtnText = await page.$eval('#blinkBtnText', el => el.textContent);
    assert(blinkDisabled === true, 'Blink button is disabled on single-epoch targets');
    assert(blinkTitle.includes('2 or more'), `Blink button title gives clear reason ("${blinkTitle}")`);
    assert(blinkBtnText.includes('Needs 2+ Epochs'), `Blink button text displays "Needs 2+ Epochs" ("${blinkBtnText}")`);

    console.log('\n--- 6. Testing Wavelength Band Switching Strictly on Same Target ---');
    // Test Star Formation Hub (Carina)
    await page.select('#targetSelect', 'star_formation_hub');
    await new Promise(r => setTimeout(r, 200));

    // Band 4 is active by default
    const carinaBand4 = await page.$eval('#skyDisplay', el => el.getAttribute('src'));
    assert(carinaBand4.includes('nebula-red-orange.jpg'), `Carina Band 4 loads nebula-red-orange.jpg (${carinaBand4})`);

    // Only available bands 4 and 5 should be shown on Carina nebula
    const hasBand1 = await page.$('.band-chip[data-band="1"]');
    assert(!hasBand1, 'Band 1 is not shown on Carina nebula (only available bands 4 and 5 are displayed)');

    // Click Band 5 (available)
    await page.click('.band-chip[data-band="5"]');
    await new Promise(r => setTimeout(r, 200));
    const carinaBand5 = await page.$eval('#skyDisplay', el => el.getAttribute('src'));
    assert(carinaBand5.includes('nebula-amber-dust.jpg'), `Carina Band 5 loads nebula-amber-dust.jpg (${carinaBand5})`);
    assert(carinaBand4 !== carinaBand5, 'Band 4 and Band 5 are distinct spectral images of the same Carina nebula');

    console.log('\n--- 7. Testing Gallery Card 10 & Thumbnail Fidelity ---');
    // Click Gallery Card 10 (SPHEREx All-Sky Dust Map)
    await page.click('.gallery-card[data-band="6"][data-target="milkyway_allsky"]');
    await page.waitForFunction(
      () => document.getElementById('skyDisplay').getAttribute('src').includes('spherex-allsky-dust.webp'),
      { timeout: 3000 }
    );

    const card10DisplaySrc = await page.$eval('#skyDisplay', el => el.getAttribute('src'));
    assert(card10DisplaySrc.includes('spherex-allsky-dust.webp'), `Card 10 loads spherex-allsky-dust.webp (${card10DisplaySrc})`);

    // Click Gallery Card 3 (SPHEREx 6-Channel Detector Array)
    await page.click('.gallery-card[data-target="spherex_mosaic"]');
    await page.waitForFunction(
      () => document.getElementById('skyDisplay').getAttribute('src').includes('wavelength-six-bands.webp'),
      { timeout: 3000 }
    );
    const card3DisplaySrc = await page.$eval('#skyDisplay', el => el.getAttribute('src'));
    assert(card3DisplaySrc.includes('wavelength-six-bands.webp'), `Card 3 loads wavelength-six-bands.webp (${card3DisplaySrc})`);

    console.log('\n--- 8. Testing 404 Missing Image Error Handling & Holding Previous Image ---');
    const initialSrc = await page.$eval('#skyDisplay', el => el.getAttribute('src'));

    // Trigger image error by calling error handler or bad src
    await page.evaluate(() => {
      displayImageTile('assets/images/non-existent-tile-404.jpg');
    });
    await new Promise(r => setTimeout(r, 200));

    const errorVisible = await page.$eval('#viewerErrorMessage', el => !el.hidden);
    const errorText = await page.$eval('#errorTileDetails', el => el.textContent);
    const heldSrc = await page.$eval('#skyDisplay', el => el.getAttribute('src'));
    assert(errorVisible === true, 'Visible error state overlay shown when image fails to load');
    assert(errorText.includes('non-existent-tile-404.jpg'), `Error text specifies missing tile ("${errorText}")`);
    assert(heldSrc === initialSrc, `Viewer holds previous image on 404 error (expected "${initialSrc}", got "${heldSrc}")`);

    // Click reload fallback
    await page.click('#btnErrorRetry');
    await page.waitForFunction(
      () => {
        const errorEl = document.getElementById('viewerErrorMessage');
        const targetVal = document.getElementById('targetSelect').value;
        const blinkBtn = document.getElementById('btnBlink');
        return errorEl && errorEl.hidden && targetVal === 'planet_x_field' && blinkBtn && !blinkBtn.disabled;
      },
      { timeout: 4000 }
    );
    const errorHiddenAfterRetry = await page.$eval('#viewerErrorMessage', el => el.hidden);
    assert(errorHiddenAfterRetry === true, 'Clicking reload clears error state and restores sky display');

    console.log('\n--- 9. Testing Team Section (Roles Only, Zero Personal Names) ---');
    const teamCardsCount = await page.$$eval('#team .team-card', els => els.length);
    assert(teamCardsCount === 3, `Exactly 3 team cards rendered (got ${teamCardsCount})`);
    const teamHtml = await page.$eval('#team', el => el.innerHTML);
    assert(!teamHtml.includes('[TEAM_LEAD_NAME]'), 'Zero [TEAM_LEAD_NAME] placeholder');
    assert(!teamHtml.includes('[BACKEND_LEAD_NAME]'), 'Zero [BACKEND_LEAD_NAME] placeholder');
    assert(!teamHtml.includes('Apoorva'), 'Zero mention of Apoorva Hartimath');
    assert(!teamHtml.includes('Ghazanfar'), 'Zero mention of Ghazanfar Kalhoro');
    assert(!teamHtml.includes('Vagif'), 'Zero mention of Vagif Novruzov');
    assert(!teamHtml.includes('Loudjeine'), 'Zero mention of Loudjeine Boussalem');
    assert(teamHtml.includes('Team Lead &amp; Backend Engineer') || teamHtml.includes('Team Lead & Backend Engineer'), 'Contains Team Lead & Backend Engineer');
    assert(teamHtml.includes('Frontend Engineer &amp; Astrometry') || teamHtml.includes('Frontend Engineer & Astrometry'), 'Contains Frontend Engineer & Astrometry');
    assert(teamHtml.includes('UI/UX &amp; Design Systems Lead') || teamHtml.includes('UI/UX & Design Systems Lead'), 'Contains UI/UX & Design Systems Lead');

    console.log('\n--- 10. Testing Step 0.10 Keyboard Focus Visible & Step 0.11 Zero Scaffolding ---');
    assert(await page.$('#sampleInfoDrawer') === null, 'No #sampleInfoDrawer element in DOM');
    assert(await page.$('#dataModeBadge') === null, 'No #dataModeBadge element in DOM');
    assert(await page.$('.about-notice-box') === null, 'No .about-notice-box element in DOM');

    const controlsToFocus = ['#btnBlink', '#btnSlew', '#toggleMarkerBtn', '#toggleCrosshairBtn', '#targetSelect', '#raInput', '#decInput', '#epochSlider'];
    for (const selector of controlsToFocus) {
      await page.focus(selector);
      const focusStyles = await page.$eval(selector, el => {
        const style = window.getComputedStyle(el);
        return {
          outlineStyle: style.outlineStyle,
          boxShadow: style.boxShadow
        };
      });
      assert(focusStyles.outlineStyle !== 'none' || focusStyles.boxShadow !== 'none', `Control ${selector} has visible focus outline or box-shadow`);
    }

    console.log('\n--- 11. Testing Sticky Header Clearance on Navigation Links ---');
    const headerHeight = await page.$eval('.glass-header', el => el.getBoundingClientRect().height);
    for (const linkSelector of ['a[href="#explainer"]', 'a[href="#gallery"]', 'a[href="#about-data"]', 'a[href="#team"]']) {
      await page.click(linkSelector);
      await new Promise(r => setTimeout(r, 400));
      const targetId = await page.$eval(linkSelector, el => el.getAttribute('href').slice(1));
      const sectionTop = await page.$eval(`#${targetId}`, el => el.getBoundingClientRect().top);
      assert(sectionTop >= headerHeight - 5, `Heading #${targetId} is fully visible below sticky header (top: ${sectionTop.toFixed(1)}px >= ${headerHeight}px)`);
    }

    console.log('\n--- 12. Testing Mobile 390px Viewport ---');
    await page.setViewport({ width: 390, height: 844 });
    await page.goto('http://localhost:3000/index.html', { waitUntil: 'networkidle0' });

    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    assert(scrollWidth <= 390, `Zero horizontal overflow at 390px (scrollWidth = ${scrollWidth}px)`);

    const decRight = await page.$eval('#decInput', el => el.getBoundingClientRect().right);
    assert(decRight <= 390, `Dec input fully within viewport (right = ${decRight.toFixed(1)}px)`);

    const markerTouchHeight = await page.$eval('#toggleMarkerBtn', el => el.getBoundingClientRect().height);
    assert(markerTouchHeight >= 40, `Marker touch height is ${markerTouchHeight}px (>=40px)`);

    console.log('\n--- 13. Testing Real SPHEREx Images & 15-Card Gallery ---');
    // 8 targets in dropdown
    const targetOptions = await page.$$eval('#targetSelect option', opts => opts.map(o => o.value));
    assert(targetOptions.length === 8, `Dropdown has 8 targets (got ${targetOptions.length})`);
    assert(targetOptions.includes('ngc_1760'), 'Dropdown includes target ngc_1760');
    assert(targetOptions.includes('cygnus_complex'), 'Dropdown includes target cygnus_complex');

    // 15 gallery cards
    const galleryCount = await page.$$eval('.gallery-card', cards => cards.length);
    assert(galleryCount === 15, `Gallery has 15 cards (got ${galleryCount})`);

    // Select NGC 1760 in dropdown
    await page.select('#targetSelect', 'ngc_1760');
    await new Promise(r => setTimeout(r, 300));

    // Default band is 2 (0.98 um)
    const ngcBand2Src = await page.$eval('#skyDisplay', el => el.getAttribute('src'));
    const ngcHudBand2 = await page.$eval('#hudBand', el => el.textContent.trim());
    assert(ngcBand2Src.includes('ngc1760-098um.webp'), `NGC 1760 default band loads ngc1760-098um.webp (${ngcBand2Src})`);
    assert(ngcHudBand2 === '0.98 µm', `HUD displays 0.98 µm with 2 decimals (got "${ngcHudBand2}")`);

    // Click Band 1 chip (0.96 um)
    await page.click('.band-chip[data-band="1"]');
    await new Promise(r => setTimeout(r, 300));
    const ngcBand1Src = await page.$eval('#skyDisplay', el => el.getAttribute('src'));
    const ngcHudBand1 = await page.$eval('#hudBand', el => el.textContent.trim());
    assert(ngcBand1Src.includes('ngc1760-096um.webp'), `NGC 1760 band 1 loads ngc1760-096um.webp (${ngcBand1Src})`);
    assert(ngcHudBand1 === '0.96 µm', `HUD displays 0.96 µm with 2 decimals (got "${ngcHudBand1}")`);
    assert(ngcHudBand1 !== ngcHudBand2, 'Wavelengths 0.96 µm and 0.98 µm are distinguishable in HUD');

    // Click Band 3 chip (3.29 um)
    await page.click('.band-chip[data-band="3"]');
    await new Promise(r => setTimeout(r, 300));
    const ngcBand3Src = await page.$eval('#skyDisplay', el => el.getAttribute('src'));
    const ngcHudBand3 = await page.$eval('#hudBand', el => el.textContent.trim());
    assert(ngcBand3Src.includes('ngc1760-329um.webp'), `NGC 1760 band 3 loads ngc1760-329um.webp (${ngcBand3Src})`);
    assert(ngcHudBand3 === '3.29 µm', `HUD displays 3.29 µm with 2 decimals (got "${ngcHudBand3}")`);

    console.log('\n--- 14. Testing Step 0.13 Band Chip Visibility & Real Mouse Clicks across Desktop Viewports ---');
    const testTargets = ['planet_x_field', 'star_formation_hub', 'ngc_1760', 'galactic_bulge', 'milkyway_allsky'];
    for (const w of [1440, 1280, 1024]) {
      await page.setViewport({ width: w, height: 900 });
      await page.goto('http://localhost:3000/index.html', { waitUntil: 'networkidle0' });

      for (const targetKey of testTargets) {
        await page.select('#targetSelect', targetKey);
        await new Promise(r => setTimeout(r, 150));

        const chips = await page.$$eval('.band-chip', els => els.map(el => ({
          band: el.getAttribute('data-band'),
          um: el.getAttribute('data-um'),
          text: el.textContent.trim()
        })));

        for (const chipData of chips) {
          const pointCheck = await page.evaluate((b) => {
            const chip = document.querySelector(`.band-chip[data-band="${b}"]`);
            if (!chip) return { found: false };
            const rect = chip.getBoundingClientRect();
            const cx = rect.left + rect.width / 2;
            const cy = rect.top + rect.height / 2;
            const topEl = document.elementFromPoint(cx, cy);
            return {
              found: true,
              cx, cy,
              isSelfOrChild: topEl === chip || chip.contains(topEl),
              topElTag: topEl ? topEl.tagName : null,
              topElId: topEl ? topEl.id : null
            };
          }, chipData.band);

          assert(pointCheck.found && pointCheck.isSelfOrChild, `[${w}px, ${targetKey}, Band ${chipData.band}]: Chip center is chip itself (not Blink/header, got <${pointCheck.topElTag} id="${pointCheck.topElId}">)`);

          await page.mouse.click(pointCheck.cx, pointCheck.cy);
          await new Promise(r => setTimeout(r, 150));

          const activeBand = await page.$eval('.band-chip.active', el => el.getAttribute('data-band'));
          assert(activeBand === chipData.band, `[${w}px, ${targetKey}, Band ${chipData.band}]: Real mouse click activated chip (active is ${activeBand})`);
        }
      }
    }

    console.log('\n--- 15. Testing Hero High-Resolution Sharpness at 1920px in API Mode ---');
    await page.setViewport({ width: 1920, height: 1080 });
    await page.goto('http://localhost:3000/index.html', { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 400));

    // Verify API mode is active
    const isLiveApi = await page.evaluate(() => appState.isLiveApi || appState.isLiveApiConnected);
    assert(isLiveApi === true, 'Viewer is running in live API mode connected to server.py');

    // Verify srcset includes cluster-survey-cyan-hires.jpg
    const skySrcset = await page.$eval('#skyDisplay', el => el.getAttribute('srcset') || '');
    assert(skySrcset.includes('cluster-survey-cyan-hires.jpg'), `Hero sky display includes hires file in srcset ("${skySrcset}")`);

    // Verify currentSrc resolves to hires file at 1920px
    const currentSrc = await page.$eval('#skyDisplay', el => el.currentSrc || el.src);
    assert(currentSrc.includes('cluster-survey-cyan-hires.jpg'), `At 1920px viewport in API mode, browser selects sharp 2K hero image (${currentSrc})`);

    const hiresDesktopPath = path.join(ARTIFACT_DIR, 'preview_desktop_1920.png');
    await page.screenshot({ path: hiresDesktopPath, fullPage: false });
    console.log(`Saved 1920px sharp desktop screenshot: ${hiresDesktopPath}`);

    console.log('\n--- 16. Capturing Final Verification Screenshots ---');
    await page.setViewport({ width: 390, height: 844 });
    await page.goto('http://localhost:3000/index.html', { waitUntil: 'networkidle0' });
    const mobilePath = path.join(ARTIFACT_DIR, 'preview_mobile_390.png');
    await page.screenshot({ path: mobilePath, fullPage: false });
    console.log(`Saved mobile screenshot: ${mobilePath}`);

    await page.setViewport({ width: 1440, height: 900 });
    await page.goto('http://localhost:3000/index.html', { waitUntil: 'networkidle0' });
    const desktopPath = path.join(ARTIFACT_DIR, 'preview_desktop_1280.png');
    await page.screenshot({ path: desktopPath, fullPage: false });
    console.log(`Saved desktop screenshot: ${desktopPath}`);

    const fullPagePath = path.join(ARTIFACT_DIR, 'preview_full_v2.png');
    await page.screenshot({ path: fullPagePath, fullPage: true });
    console.log(`Saved full page screenshot: ${fullPagePath}`);

    console.log('\n======================================================');
    if (testFailures === 0 && !nativeDialogTriggered) {
      console.log('🎉 ALL V2 REBUILD AUTOMATION TESTS PASSED WITH 100% SUCCESS!');
    } else {
      console.error(`💥 TEST SUITE FINISHED WITH ${testFailures} FAILURES`);
      process.exit(1);
    }
  } catch (err) {
    console.error('Fatal test error:', err);
    process.exit(1);
  } finally {
    await browser.close();
  }
})();
