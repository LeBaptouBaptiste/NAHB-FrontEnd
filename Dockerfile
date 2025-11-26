FROM node:20-alpine

WORKDIR /app

# Permet d'utiliser PORT passé par docker-compose
ARG PORT
ENV PORT=${PORT}

COPY package*.json ./
RUN npm install

COPY . .

# Build production
RUN npm run build

# Expose dynamique (Docker ignore EXPOSE, mais c'est cosmétique)
EXPOSE ${PORT}

CMD ["sh", "-c", "npm run preview -- --host --port $PORT"]
