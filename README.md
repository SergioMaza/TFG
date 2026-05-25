# TFG

Sistema de visión por computador para analizar ejercicios de fuerza, detectar errores de ejecución y ofrecer feedback técnico orientado a mejorar el rendimiento y prevenir lesiones.

## Stack

### Frontend
- React  
- Tailwind CSS  
- Vite  
- JavaScript (ES6+)  

### Librerías UI/UX
- AOS  
- Framer Motion  
- Lucide React  

### Backend
- Python 3.10-slim  
- Flask  
- MediaPipe Pose  
- OpenCV  

### Backend-as-a-Service
- Supabase  
  - Supabase Auth  
  - Supabase Database (PostgreSQL)  
  - Supabase Storage  

### Contenedorización
- Docker  
  - Dockerfile  
  - Docker Compose  

### Cloud
- Google Cloud Platform (GCP)  
  - Artifact Registry  
  - Secret Manager  
  - Cloud Run  

### Herramientas de desarrollo
- Git y GitHub  
- Trello  
- Figma  

## Estructura del proyecto
```
TFG/
├── api/                         # Backend - API REST en Python (Flask)
│   ├── app.py                   # Aplicación principal
│   ├── appSteam.py              # Módulo adicional
│   ├── auxiliar.py              # Funciones auxiliares
│   ├── db.py                    # Gestión de base de datos
│   ├── requirements.txt         # Dependencias Python
│   ├── Dockerfile               # Imagen Docker producción
│   ├── Dockerfile.dev           # Imagen Docker desarrollo
│   └── .dockerignore
│
├── frontend/                    # Frontend - Aplicación web (React/Vite)
│   ├── src/
│   │   ├── components/          # Componentes reutilizables
│   │   ├── pages/               # Páginas principales
│   │   ├── hooks/               # Custom hooks
│   │   ├── config/              # Configuración
│   │   ├── lib/                 # Utilidades
│   │   ├── styles/              # Estilos
│   │   └── main.jsx             # Entry point
│   │
│   ├── public/                 # Archivos estáticos
│   ├── package.json
│   ├── package-lock.json
│   ├── index.html
│   ├── vite.config.js
│   ├── eslint.config.js
│   ├── nginx.conf
│   ├── Dockerfile
│   ├── Dockerfile.dev
│   └── .dockerignore
│
├── worker/                      # Worker - Procesamiento IA
│   ├── app.py
│   ├── worker.py
│   ├── requirements.txt
│   ├── low_videos.sh
│   │
│   ├── ejercicios/              # Módulo de ejercicios
│   │   ├── __init__.py
│   │   ├── exercise_interface.py
│   │   ├── biceps_curl.py
│   │   ├── lateral_rises.py
│   │   ├── squat.py
│   │   └── registry.py
│   │
│   ├── model/                   # Modelos ML
│   │   └── pose_landmarker.task
│   │
│   ├── my_libs/                 # Librerías personalizadas
│   │   ├── biomechanics.py
│   │   ├── draw.py
│   │   ├── rep_tracker.py
│   │   └── report.py
│   │
│   ├── Dockerfile
│   ├── Dockerfile.dev
│   └── .dockerignore
│
├── sql/                         # Base de datos
│   ├── init.sql
│   └── exercise_catalog.sql
│
├── docker-compose.yml           # Orquestación
└── README.md                    # Documentación
```

## Disclaimer

El sistema se encuentra desplegado en Google Cloud Platform (GCP) y dispone de una URL pública de acceso. No obstante, dicha URL no se incluye en este repositorio por motivos de seguridad y control de uso.

Dado que la plataforma permite la subida y procesamiento de vídeos, un uso no controlado podría afectar a los límites del plan gratuito de Supabase, generando consumos inesperados y costes no previstos.
