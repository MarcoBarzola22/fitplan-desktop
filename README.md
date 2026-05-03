# FitPlan Desktop (MVP v1.0) 🏋️‍♂️
**Gestión inteligente y automatizada de rutinas para entrenadores profesionales.**

FitPlan es una solución de escritorio diseñada para eliminar la fricción en el flujo de trabajo de los entrenadores personales. Permite centralizar bibliotecas de ejercicios, construir rutinas dinámicas y garantizar la persistencia de datos local, todo bajo una interfaz moderna y eficiente.

Desarrollado por Marco Barzola (Villa Mercedes, San Luis).

---

## 🚀 Características Principales

- **Biblioteca de Ejercicios:** Organización avanzada por patrones de movimiento (Empuje, Tracción, Pierna, etc.).
- **Constructor de Rutinas:** Creación de bloques de entrenamiento por días con asignación dinámica de series, repeticiones y cargas.
- **Persistencia Local (Offline-First):** Implementación de base de datos local para garantizar el funcionamiento sin conexión a internet.
- **Interfaz Profesional:** Construida con React y Tailwind CSS para una experiencia de usuario fluida y reactiva.

---

## 🛠️ Stack Tecnológico

- **Frontend:** React.js, TypeScript, Tailwind CSS, Shadcn/UI.
- **Desktop Runtime:** Electron (Vite integration).
- **Base de Datos:** SQLite.
- **ORM:** Prisma (Gestión de esquemas y migraciones).
- **Estado Global:** Zustand / React Query.

---

## 🧠 El Desafío Técnico: Prisma + Electron

Uno de los mayores retos del proyecto fue la **integración de binarios nativos de Prisma dentro del entorno empaquetado de Electron**. 

Para resolver los conflictos de ejecución en producción, se implementó una estrategia de:
1. **Desactivación de ASAR:** Permitir que los motores de consulta de Prisma se ejecuten de forma nativa en Windows.
2. **Mapeo de extraResources:** Configuración del `electron-builder.yml` para inyectar dinámicamente la base de datos y los clientes de Prisma en la carpeta de recursos de la aplicación, asegurando la portabilidad total del sistema.

---

## 🗺️ Roadmap: Hacia la Versión 2.0

Actualmente trabajando en la expansión del ecosistema FitPlan de GEPI Software:

### 🎨 UX & Personalización
- **Modo Oscuro/Claro:** Sistema de temas con Tailwind CSS.
- **Custom Branding:** Carga de logos personalizados para reportes e interfaz.
- **Soporte Multi-Idioma:** Implementación de i18next (Español/Inglés).

### 👥 Gestión y Negocio
- **Módulo de Clientes:** Control de pagos, asistencias y mensualidades.
- **Sistema de Licencias:** Implementación de claves de activación (Trial de 15 días).

### 🤖 Automatización e Inteligencia
- **Integraciones:** Envío automático de rutinas por WhatsApp y sincronización con Google Drive.
- **Análisis de Datos:** Dashboard de métricas con gráficos de volumen total y progresión de cargas.
- **Algoritmo de Progresión:** Sugerencia inteligente de aumentos de carga basada en datos históricos.

---

## 💻 Instalación (Entorno de Desarrollo)

1. **Clonar el repositorio.**

2. **Instalar dependencias:**
```bash
npm install
```

3. **Generar el cliente de Prisma:**
```bash
npx prisma generate
```

4. **Ejecutar en modo desarrollo:**
```bash
npm run dev
```

5. **Generar instalable (.exe):**
```bash
npm run build:win
```

---

## 👤 Equipo y Contacto

 Villa Mercedes, San Luis, Argentina.
- **Marco:** Estudiante de 4to año de Ingeniería en Sistemas (UNVIME).
