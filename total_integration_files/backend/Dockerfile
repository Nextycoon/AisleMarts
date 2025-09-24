FROM node:20-alpine
WORKDIR /app
COPY package.json package-lock.json* pnpm-lock.yaml* ./
RUN npm i -g pnpm && pnpm i --prod
COPY . .
ENV PORT=3000
EXPOSE 3000
CMD ["node", "src/server.js"]
