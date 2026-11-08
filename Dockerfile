# Image de production d'Atlas. Fonctionne chez tout hébergeur qui accepte Docker
# (Clever Cloud, Scaleway Serverless Containers, OVHcloud…).
#   docker build -t atlas .
#   docker run -p 8080:8080 --env-file .env atlas

# 1. Construction du site
FROM node:22.23.4-bookworm-slim AS construction
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
# Adresse publique des photos libres, inscrite dans les pages au moment de la construction.
ARG PUBLIC_MEDIA_URL
ENV PUBLIC_MEDIA_URL=$PUBLIC_MEDIA_URL
ARG SITE_URL=https://aodermatologie.org
ENV SITE_URL=$SITE_URL
RUN npm run build && npm test

# 2. Image finale : uniquement ce qui sert à faire tourner le site
FROM node:22.23.4-bookworm-slim
ENV NODE_ENV=production PORT=8080 HOST=0.0.0.0
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force
COPY --from=construction /app/dist ./dist
COPY --from=construction /app/server.mjs ./server.mjs
COPY --from=construction /app/src/lib ./src/lib
USER node
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=3s CMD node -e "fetch('http://127.0.0.1:'+process.env.PORT+'/api/sante').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
CMD ["node", "server.mjs"]
