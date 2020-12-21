FROM gigafyde/image-gen-baseimage
WORKDIR /app

COPY package.json package.json
COPY package-lock.json package-lock.json
RUN npm ci

COPY assets/images assets/images
COPY assets/fonts /usr/local/share/fonts/

COPY app.js app.js

EXPOSE 3003
CMD [ "node", "app.js" ]
