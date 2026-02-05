# ============================================
# Dockerfile para Keepa MCP + n8n (supergateway)
# ============================================

# --- Stage 1: Build ---
FROM node:20-alpine AS build

# Instalar dependencias de compilación
RUN apk add --no-cache git

WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar TODAS las dependencias (incluyendo dev para build)
RUN npm ci --include=dev

# Copiar código fuente
COPY tsconfig.json ./
COPY src/ ./src/

# Compilar TypeScript
RUN npm run build

# Eliminar devDependencies para producción
RUN npm prune --omit=dev

# --- Stage 2: Production ---
FROM node:20-alpine

ENV NODE_ENV=production
ENV PORT=8080

WORKDIR /app

# Copiar solo lo necesario desde build
COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package*.json ./

# Instalar supergateway globalmente
RUN npm install -g supergateway

# Exponer puerto
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:${PORT}/health || exit 1

# Comando de inicio con supergateway
CMD ["sh", "-c", "exec supergateway --stdio \"node /app/dist/index.js\" --outputTransport streamableHttp --stateful --sessionTimeout 600000 --port ${PORT} --streamableHttpPath /mcp --healthEndpoint /health"]
