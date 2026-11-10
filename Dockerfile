FROM python:3.11-slim
WORKDIR /app
COPY . .
EXPOSE 3000
CMD ["sh", "-c", "python3 server.py --port ${PORT:-3000}"]
