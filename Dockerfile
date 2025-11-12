FROM node:21-bullseye-slim

# Create app directory
WORKDIR /app

# Install dependencies first (leverage Docker cache)
COPY package.json package-lock.json* ./
# update OS packages to pick up security patches (reduces image vulnerabilities)
RUN apt-get update && apt-get upgrade -y \
	&& npm ci --silent \
	&& apt-get clean && rm -rf /var/lib/apt/lists/*

# Copy source
COPY . .

# Create non-root user and set ownership (reduce attack surface)
RUN chown -R node:node /app
USER node

# Expose default Next.js port
ENV PORT=3000
EXPOSE 3000

# Use environment suitable for development by default
ENV NODE_ENV=development

# Default command starts the Next.js dev server (binds to 0.0.0.0 when using Next 13+)
# Docker Compose 사용: "docker compose up"
CMD ["npm", "run", "dev"]