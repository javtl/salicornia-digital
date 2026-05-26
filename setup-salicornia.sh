#!/bin/bash

# =========================================================================
# SETUP SALICORNIA DIGITAL: Crea estructura completa
# =========================================================================
# Uso: bash setup-salicornia.sh
# Resultado: Estructura de carpetas lista para codificar
# =========================================================================

echo "🚀 Inicializando Salicornia Digital..."

# Crear estructura BACKEND
echo "📁 Creando estructura backend..."
mkdir -p salicornia-api/src/{config,models,routes,controllers,middleware,services,utils}
mkdir -p salicornia-api/tests
mkdir -p salicornia-api/docs

# Crear estructura FRONTEND
echo "📁 Creando estructura frontend..."
mkdir -p salicornia-web/src/{api,assets,components,hooks,pages,services,store,utils}
mkdir -p salicornia-web/src/components/{Layout,UI,QR}
mkdir -p salicornia-web/src/pages/{Home,Infra,FieldBook,Issues,Environment,Harvest,Traceability,Settings}
mkdir -p salicornia-web/public

# Crear carpeta de documentación
echo "📁 Creando carpeta /docs..."
mkdir -p docs

echo ""
echo "✅ Estructura creada. Ahora generando archivos iniciales..."
echo ""

# =========================================================================
# BACKEND: package.json
# =========================================================================
cat > salicornia-api/package.json << 'EOF'
{
  "name": "salicornia-api",
  "version": "1.0.0",
  "description": "Backend API para Salicornia Digital - Gestión de cultivo",
  "main": "src/app.js",
  "type": "module",
  "scripts": {
    "start": "node src/app.js",
    "dev": "nodemon src/app.js",
    "test": "jest",
    "lint": "eslint src/",
    "db:setup": "psql -U salicornia_dev -d salicornia_db -f init-db.sql"
  },
  "dependencies": {
    "express": "^4.18.2",
    "pg": "^8.10.0",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1",
    "qrcode": "^1.5.3",
    "axios": "^1.6.0",
    "joi": "^17.10.0"
  },
  "devDependencies": {
    "nodemon": "^3.0.1",
    "jest": "^29.7.0",
    "eslint": "^8.50.0"
  },
  "keywords": ["salicornia", "agricultura", "cultivo", "api"],
  "author": "Marismas Biomed",
  "license": "ISC"
}
EOF

echo "✓ Backend package.json creado"

# =========================================================================
# BACKEND: .env.example
# =========================================================================
cat > salicornia-api/.env.example << 'EOF'
# Base de datos
DB_HOST=localhost
DB_PORT=5432
DB_NAME=salicornia_db
DB_USER=salicornia_dev
DB_PASSWORD=tu_password_aqui

# Node
NODE_ENV=development
PORT=3000

# AEMET API (registrarse en www.aemet.es)
AEMET_API_KEY=tu_clave_aqui
AEMET_LATITUDE=36.5271
AEMET_LONGITUDE=-6.2886

# Almacenamiento
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=5242880

# CORS
CORS_ORIGIN=http://localhost:5173
EOF

echo "✓ Backend .env.example creado"

# =========================================================================
# BACKEND: app.js (punto de entrada)
# =========================================================================
cat > salicornia-api/src/app.js << 'EOF'
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173'
}));
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'API funcionando ✅' });
});

// Routes (cuando existan)
// app.use('/api/sections', require('./routes/sections.js'));
// app.use('/api/planchas', require('./routes/planchas.js'));
// ... más rutas

// Error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Error interno del servidor' });
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
  console.log(`📡 URL: http://localhost:${PORT}`);
});

export default app;
EOF

echo "✓ Backend app.js creado"

# =========================================================================
# BACKEND: config/database.js
# =========================================================================
cat > salicornia-api/src/config/database.js << 'EOF'
import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
});

pool.on('error', (err) => {
  console.error('Error no esperado en el pool', err);
});

export default pool;
EOF

echo "✓ Backend config/database.js creado"

# =========================================================================
# FRONTEND: package.json
# =========================================================================
cat > salicornia-web/package.json << 'EOF'
{
  "name": "salicornia-web",
  "version": "1.0.0",
  "description": "Frontend React para Salicornia Digital",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "lint": "eslint src/"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.16.0",
    "axios": "^1.6.0",
    "zustand": "^4.4.0",
    "qrcode.react": "^1.0.1",
    "jsqr": "^1.4.0",
    "recharts": "^2.10.0",
    "tailwindcss": "^3.3.0"
  },
  "devDependencies": {
    "vite": "^5.0.0",
    "@vitejs/plugin-react": "^4.2.0",
    "eslint": "^8.50.0"
  },
  "keywords": ["salicornia", "react", "agricultura"],
  "author": "Marismas Biomed",
  "license": "ISC"
}
EOF

echo "✓ Frontend package.json creado"

# =========================================================================
# FRONTEND: .env.example
# =========================================================================
cat > salicornia-web/.env.example << 'EOF'
VITE_API_URL=http://localhost:3000
VITE_APP_NAME=Salicornia Digital
EOF

echo "✓ Frontend .env.example creado"

# =========================================================================
# FRONTEND: vite.config.js
# =========================================================================
cat > salicornia-web/vite.config.js << 'EOF'
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    open: true
  },
  build: {
    outDir: 'dist'
  }
});
EOF

echo "✓ Frontend vite.config.js creado"

# =========================================================================
# FRONTEND: App.jsx
# =========================================================================
cat > salicornia-web/src/App.jsx << 'EOF'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';

// Pages (cuando existan)
// import Home from './pages/Home';
// import Infra from './pages/Infra';
// ... más pages

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<h1>Dashboard - En construcción</h1>} />
          {/* Más rutas aquí */}
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
EOF

echo "✓ Frontend App.jsx creado"

# =========================================================================
# FRONTEND: main.jsx
# =========================================================================
cat > salicornia-web/src/main.jsx << 'EOF'
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
EOF

echo "✓ Frontend main.jsx creado"

# =========================================================================
# FRONTEND: index.html
# =========================================================================
cat > salicornia-web/index.html << 'EOF'
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Salicornia Digital - Gestión de Cultivo</title>
</head>
<body>
  <div id="root"></div>
  <script type="module" src="/src/main.jsx"></script>
</body>
</html>
EOF

echo "✓ Frontend index.html creado"

# =========================================================================
# FRONTEND: index.css
# =========================================================================
cat > salicornia-web/src/index.css << 'EOF'
@tailwind base;
@tailwind components;
@tailwind utilities;

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica',
    'Arial', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
EOF

echo "✓ Frontend index.css creado"

# =========================================================================
# ROOT: .gitignore
# =========================================================================
cat > .gitignore << 'EOF'
# Dependencies
node_modules/
.npm
package-lock.json
yarn.lock

# Environment
.env
.env.local
.env.*.local

# Build
dist/
build/
*.tgz

# IDE
.vscode/
.idea/
*.swp
*.swo
*~

# OS
.DS_Store
Thumbs.db

# Logs
logs/
*.log
npm-debug.log*
yarn-debug.log*

# Uploads
uploads/
temp/
EOF

echo "✓ .gitignore creado"

# =========================================================================
# ROOT: README.md
# =========================================================================
cat > README.md << 'EOF'
# 🌿 Salicornia Digital

Aplicación completa de gestión de cultivo de salicornia (30 días, 7 devs).

## 📁 Estructura

```
salicornia-digital/
├── salicornia-api/       # Backend (Node.js + Express)
├── salicornia-web/       # Frontend (React)
└── docs/                 # Documentación del proyecto
```

## 🚀 Inicio rápido

### Backend
```bash
cd salicornia-api
npm install
cp .env.example .env
# Editar .env con tus datos
npm run dev
```

### Frontend
```bash
cd salicornia-web
npm install
cp .env.example .env
npm run dev
```

## 📚 Documentación

Ver carpeta `/docs/` para:
- Arquitectura completa
- Plan de 30 días
- Checklist de tareas
- Estructura de código

## 👥 Equipo

- **David**: Backend + Dashboard
- **Alejandro**: AEMET + Datos ambientales
- **Gonzalo**: Sensores IoT
- **Javi**: Frontend Infraestructura
- **Jesús**: Cuaderno de campo
- **Guille**: Fotos e incidencias
- **Aníbal**: Cosechas y trazabilidad

## 📞 Contacto

Marismas Biomed
EOF

echo "✓ README.md creado"

# =========================================================================
# ROOT: SETUP SUMMARY
# =========================================================================
echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║  ✅ ESTRUCTURA CREADA CON ÉXITO                            ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""
echo "📁 Carpetas creadas:"
echo "   • salicornia-api/        (Backend)"
echo "   • salicornia-web/        (Frontend)"
echo "   • docs/                  (Documentación)"
echo ""
echo "📄 Archivos iniciales:"
echo "   ✓ package.json (backend y frontend)"
echo "   ✓ .env.example (backend y frontend)"
echo "   ✓ app.js (backend)"
echo "   ✓ App.jsx (frontend)"
echo "   ✓ Configuraciones iniciales"
echo ""
echo "🚀 Próximos pasos:"
echo ""
echo "1. Backend:"
echo "   cd salicornia-api"
echo "   npm install"
echo "   cp .env.example .env"
echo "   # Editar .env con credenciales PostgreSQL"
echo "   npm run dev"
echo ""
echo "2. Frontend:"
echo "   cd salicornia-web"
echo "   npm install"
echo "   cp .env.example .env"
echo "   npm run dev"
echo ""
echo "3. Base de datos:"
echo "   # Ejecutar script SQL (cuando esté listo)"
echo "   psql -U salicornia_dev -d salicornia_db -f init-db.sql"
echo ""
echo "📚 Documentación disponible en /docs/"
echo ""
echo "¡Éxito! 🎉"
EOF

echo "✓ README.md creado"

echo ""
echo "✅ SETUP COMPLETADO"
echo ""
