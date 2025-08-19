FROM node:20-slim
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci || npm i
COPY src ./src
COPY index.html ./
EXPOSE 5173
ENV VITE_API_BASE_URL=http://localhost:8000
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
