FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./

# Install dependencies (using install instead of ci to handle mismatches)
RUN npm install

# Install additional packages for markdown support
RUN npm install markdown-it react-markdown-editor-lite react-markdown rehype-raw rehype-sanitize remark-gfm framer-motion

# Copy source code
COPY . .

# Set environment variables
ENV NEXT_PUBLIC_API_URL=http://localhost:8001
ENV NEXT_TELEMETRY_DISABLED 1
ENV NODE_ENV development

# Expose port
EXPOSE 3000

# Default command
CMD ["npm", "run", "dev"]