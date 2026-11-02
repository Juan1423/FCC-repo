FROM node:18-alpine

# M-06: el contenedor no se ejecuta como root. La app corre con el usuario
# no privilegiado que ya trae la imagen oficial de Node.
ENV NODE_ENV=production
WORKDIR /app

COPY package*.json ./
# npm ci usa el lockfile (reproducible). Si no existe, se cae a npm install.
RUN if [ -f package-lock.json ]; then npm ci --omit=dev; else npm install --omit=dev; fi

COPY . .

RUN mkdir -p logs src/uploads \
    && chown -R node:node /app

USER node

EXPOSE 5000

CMD ["node", "app.js"]
