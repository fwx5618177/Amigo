FROM node:18.0.0 as build-stage

WORKDIR /app
COPY . ./
COPY package.json ./
COPY pnpm-lock.yaml ./

RUN ls
RUN npm install -g pnpm
RUN pnpm install
RUN pnpm run build
RUN ls

# 生产阶段
FROM nginx:stable-alpine as production-stage

COPY ./default.conf /etc/nginx/conf.d/
COPY --from=build-stage /app/build /usr/share/nginx/html
EXPOSE 80

ENTRYPOINT ["nginx", "-g", "daemon off;"]
