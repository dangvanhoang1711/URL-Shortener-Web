FROM node:20
WORKDIR /app
COPY package*.json ./
RUN npm install --include=dev
COPY prisma ./prisma/
RUN npx prisma generate
COPY . .
CMD ["npm", "run", "dev"]