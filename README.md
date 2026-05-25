# Crear un entorno virual y Descargar requirements

python -m venv .venv #Crear venv
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass #En caso de error al activar el venv
.venv\Scripts\activate #Activar
pip install -r requirements.txt #Instalar requirements.txt

deactivate #Desactivar
pip freeze > requirements.txt #Crear requirements.txt

# Crear proyecto de React con Tailwind y Vite

# Crear proyecto de React con Vite

npm create vite@latest mi-proyecto -- --template react-tailwind
Config:

> React
> JavaScript + React Compiler (El React Compiler integra varias ventajas: Fast Refresh, Optimizacion Automática, Compatibilidad con Tailwind)
> Use Vite 8 beta (Experimental)?: No
> Install with npm and start now?: Yes
> en package.json: "dev": "vite --host" -> Sino al usar Docker da error

# Integracion con Tailwind

Una vez este el proyecto creado con React y Vite:
npm install -D tailwindcss
npm install -D @tailwindcss/vite
Modificar vite.config.js para integrar tailwind
Añadir "@import "tailwindcss";" en index.css

# Integracion Supabase (Supabase Auth)

## Archivos necesarios:

- Vistas: Auth.jsx, ForgotPassword.tsx, UpdatePassword.jsx
- Instalar 'supabase' en backend y '@supabase/supabase-js' en frontend
- server/.env.local: Contiene las keys de Supabase
  - Frontend: VITE_SUPABASE_PUBLIC_URL y VITE_SUPABASE_PUBLIC_KEY
  - Backend: SUPABASE_PUBLIC_URL y SUPABASE_SECRET_KEY
- lib/supabaseClient.js: Cliente de Supabase que usa la VITE_SUPABASE_PUBLIC_KEY y VITE_SUPABASE_PUBLIC_URL
- hooks/useAppProvider.js: Añadir funciones de Auth (signUp, signIn, signInWithGoogle, forgotPassword ,updatePassword, signOut) y funcion aux para errores (parseError)

## Configuraciones de Supabase

1. Desde el portal de Supabase > Authentication > SignIn/Providers: Activar correo y Google. Para google necesitaremos unas credenciales:
   - Ir a Google Cloud Console: https://console.cloud.google.com/
   - Crea un proyecto (si no lo tienes ya)
   - Activa la API de "Google Identity Services / OAuth consent screen" (Si la app es para el publico puede que haya que verificarla)
   - Ve a APIs & Services → Credentials
   - Crea una nueva credencial de tipo OAuth 2.0 Client ID
   - Copia el Client IDs y Client Secret en Supabase, (En el Google Provider)
   - Copiar el Callback URL y pegarlo en Google Cloud Console > APIs y servicios > Credenciales > IDs de clientes de OAuth 2.0 > URIs de redireccionamiento autorizados
2. Desde el portal de Supabase > Authentication > URL Configuration: Configurar URLs públicas en las que se puede usar el OAuth

# Integracion del pipeline de IA

Problemas encontrados:

1. Recursos limitados de Docker
   - Docker por defecto te limita recursos y tienes que ampliarlos creando un nuevo archivo en C:\Users\sergi\.wslconfig

2. Habilitar GPUs en Docker
   - Instalar los drivers WSL (https://www.nvidia.com/Download/index.aspx)
   - Instalar distro de Ubutno en caso de no tenerla: "wsl --install -d Ubuntu-22.04"
   - Entrar al Ubuntu de WSL: "wsl -d Ubuntu-22.04"
   - Agregar repositorio de NVIDIA e instlar "sudo apt-get install -y nvidia-docker2"
   - Modificar Dockerfile para usar una imagen base de CUDA
   - Modificar docker-compose (opcional): deploy.resources.reservations.devices.capabilities: [gpu]

# Subir contenedores a Artifact Registry

(Hay que tener el sdk gcloud instalado y previamente haber hecho un gcloud auth login)

1. Settear proyecto: gcloud config set project kinesislab
2. Validar paso anterior: gcloud config get-value project
3. Es posible que tengas que activar APIs si el proyecto es neuvo (Tambien se pueden activar desde la UI de GCP)
    gcloud services enable cloudbuild.googleapis.com
    gcloud services enable artifactregistry.googleapis.com
3. gcloud builds submit ./CARPETA_DEL_SERVICIO --tag europe-southwest1-docker.pkg.dev/kinesislab/kinesis-lab/NOMBRE:latest

Ejemplo:
gcloud builds submit ./frontend --tag europe-west1-docker.pkg.dev/kinesislab/kinesis-lab/frontend:latest
gcloud builds submit ./api --tag europe-west1-docker.pkg.dev/kinesislab/kinesis-lab/api:latest
gcloud builds submit ./worker --tag europe-west1-docker.pkg.dev/kinesislab/kinesis-lab/worker:latest


Esto buildea la imagen, le asigna un tag y lo sube a Artifact Registry, todo con el mismo comando

Es posible que necesites autenticas Docker con Artifact Registry
gcloud auth configure-docker europe-southwest1-docker.pkg.dev

# Ejecutar

## 1. Levantar backend

cd server
.venv\Scripts\activate #Activar
python app.py

## 2. Levantar frontend

### Local

cd client
npm run dev

## 1. Levantar Docker

docker compose up
docker compose up --build
docker compose down

### Ejecutar con GPU

Si se ha indicado el uso de GPU en docker-compose basta con: docker compose up
Si solo hay Dockerfile: docker run --gpus all -p 5000:5000 server_container

## URL pública (ngrok)

ngrok http [puerto]
