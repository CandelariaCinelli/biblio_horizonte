<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Biblioteca Horizonte — Gestión de recursos tecnológicos

This contains everything you need to run your app locally.

## Run Locally

**Prerequisites:**  Node.js


1. Instalar dependencias del frontend:
   `npm install`
2. Configurar las variables de [.env.example](.env.example) en `.env`.
3. Ejecutar la interfaz:
   `npm run dev`

La interfaz se abre en `http://localhost:3000`.

Para ejecutar también el backend Spring Boot con PostgreSQL:

```powershell
cd backend
mvn spring-boot:run
```

El backend queda disponible en `http://localhost:8787/api/v1`.
