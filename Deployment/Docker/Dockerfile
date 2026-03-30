# ETAPA 1: Construcción (Build)
FROM node:22-alpine AS build_stage
WORKDIR /app

# Copiamos archivos de dependencias
COPY package*.json ./
RUN npm install

# Copiamos el resto del código
COPY . .

# Compilar Angular en modo producción
RUN npm run build -- --configuration production

# ETAPA 2: Producción (Runtime)
FROM nginx:1.28-alpine

# Angular 20 genera el build en dist/<project-name>/browser/
COPY --from=build_stage /app/dist/auth-app-angular/browser /usr/share/nginx/html

# Copiamos configuración de nginx para SPA (Angular Router)
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]