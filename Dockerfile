FROM node:20-slim

WORKDIR /app

COPY package.json package-lock.json* ./
COPY patches/ ./patches/
RUN npm install

COPY . .

EXPOSE 3100

CMD ["npx", "remotion", "studio", "--port", "3100", "--host", "0.0.0.0"]
