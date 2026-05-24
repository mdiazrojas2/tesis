# Sistema Digital de Catastro para Emergencias
🏢 Gestión Comunitaria → 📋 Catastro → 🚨 Planes de Emergencia → 💻 Plataforma Digital → ✅ Ley N° 21.442

![Version](https://img.shields.io/badge/Versión-v1.0.0-blue)
![Stack](https://img.shields.io/badge/Stack-React%20%7C%20Django%20REST-success)
![License](https://img.shields.io/badge/Licencia-Uso%20Académico-orange)

## 📋 Tabla de Contenidos
- [🎯 ¿Qué es el Sistema Digital de Catastro?](#-qué-es-el-sistema-digital-de-catastro)
- [✨ Características Principales](#-características-principales)
- [🏗️ Arquitectura y Stack Tecnológico](#️-arquitectura-y-stack-tecnológico)
- [🗂️ Estructura del Proyecto](#️-estructura-del-proyecto)
- [⚙️ Requisitos Previos](#️-requisitos-previos)
- [📚 Guía de Instalación Paso a Paso](#-guía-de-instalación-paso-a-paso)
- [💡 Pruebas y Validación](#-pruebas-y-validación)
- [❓ Preguntas Frecuentes](#-preguntas-frecuentes)
- [🔧 Solución de Problemas](#-solución-de-problemas)
- [📖 Glosario de Términos](#-glosario-de-términos)

---

## 🎯 ¿Qué es el Sistema Digital de Catastro?

El **Sistema Digital de Catastro para Emergencias** es una plataforma tecnológica integral diseñada para resolver de manera automatizada e informática las exigencias operacionales establecidas en el **Artículo 40 de la Ley N° 21.442 sobre Copropiedad Inmobiliaria** en Chile. 

Este software está diseñado para:
- 📖 **Centralizar** el registro de residentes de un condominio.
- 🎯 **Identificar** preventivamente a personas con movilidad reducida y condiciones médicas.
- 🎫 **Resguardar** datos sensibles bajo la Ley N° 19.628 de Protección de la Vida Privada.
- 🤝 **Automatizar** notificaciones de vencimientos de datos y planes de emergencia.

---

## ✨ Características Principales

- 🏢 **Módulo Administrador**: Carga masiva por lotes desde Excel (.xlsx), control maestro de habitantes y bitácora analítica.
- 🏠 **Módulo Residente**: Ficha demográfica autogestionable con formularios dinámicos condicionales para capturar datos de movilidad y asistencia médica.
- 🔄 **Módulo de Eventos**: Sistema de notificaciones automáticas y alertas operando 60 días antes de los plazos normativos (renovación semestral de datos).
- 🔐 **Control Perimetral**: Arquitectura protegida mediante autenticación JWT y control de acceso basado en roles (RBAC).
- 🎓 **Adopción Digital**: Guías interactivas (Tours) nativas para facilitar el autoaprendizaje del usuario.

---

## 🏗️ Arquitectura y Stack Tecnológico

> 🚀 El proyecto emplea una arquitectura desacoplada basada en **Servicios API RESTful**, asegurando alta disponibilidad y clara separación de responsabilidades.

### ⚙️ El Backend (El Motor Lógico)
- **Lenguaje**: Python 3
- **Framework**: Django REST Framework (DRF)
- **Persistencia**: SQLite3 (Desarrollo) / PostgreSQL (Producción, bajo principios ACID)
- **Seguridad**: SimpleJWT (JSON Web Tokens)
- **Automatización**: Django Signals (Eventos reactivos `post_save`, `post_delete`)
- **Procesos Asíncronos**: Hilos (Threading) y protocolo SMTP para correos.

### 🎨 El Frontend (La Capa de Presentación)
- **Librería Core**: React.js
- **Empaquetador**: Vite (Alta velocidad de desarrollo)
- **Estilos**: Tailwind CSS (Diseño "Glassmorphism" limpio y responsivo)
- **Conectividad**: Axios (Cliente HTTP)
- **Didáctica**: React-Joyride (Tours interactivos)

### 🗺️ Diagrama de Arquitectura

```text
+-------------------+      JSON HTTP       +-------------------+
|  CLIENTE (REACT)  |  <---------------->  | SERVIDOR (DJANGO) |
| - Tailwind CSS    |      (Axios)         | - DRF ViewSets    |
| - React-Joyride   |                      | - Middleware JWT  |
+-------------------+                      +---------+---------+
                                                     |
                                                     v
                                           +-------------------+
                                           | ORM & BASE DATOS  |
                                           | - SQLite/Postgres |
                                           | - Django Signals  |
                                           +---------+---------+
                                                     |
                                                     v
                                           +-------------------+
                                           | TAREAS ASÍNCRONAS |
                                           | - Correos SMTP    |
                                           +-------------------+
```

---

## 🗂️ Estructura del Proyecto

```
Tesis/
├── 📁 backend/              # Lógica de servidor y API
│   ├── catastro/            # Aplicación principal Django (Modelos, Vistas, Signals)
│   ├── core/                # Configuración global del proyecto
│   ├── tests.py             # Pruebas unitarias y de integración (Pytest)
│   └── requirements.txt     # Dependencias de Python
├── 📁 frontend/             # Interfaz de usuario React
│   ├── src/
│   │   ├── components/      # Componentes UI (Tours, Sidebar, Tablas)
│   │   ├── pages/           # Vistas principales (Admin/Residente)
│   │   └── utils/           # Validaciones (RUT, API config)
│   └── package.json         # Dependencias de Node.js
└── README.md                # Esta guía
```

---

## ⚙️ Requisitos Previos

> 🚨 **IMPORTANTE**: Asegúrate de tener las siguientes herramientas instaladas en tu sistema antes de comenzar.

- Python 3.10 o superior
- Node.js (v18+)
- Git
- Terminal compatible (PowerShell o Git Bash)

---

## 📚 Guía de Instalación Paso a Paso

### Paso 1: Clonación y Preparación 📋
```bash
git clone <URL_DEL_REPOSITORIO>
cd tesis
```

### Paso 2: Despliegue del Backend ⚙️

1. **Navega al directorio e inicializa el entorno virtual:**
   ```bash
   cd backend
   python -m venv venv
   ```

2. **Activa el entorno (PowerShell):**
   ```powershell
   .\venv\Scripts\Activate.ps1
   ```

3. **Instala dependencias y prepara la base de datos:**
   ```bash
   pip install -r requirements.txt
   python manage.py makemigrations
   python manage.py migrate
   ```

4. **Inicia el servidor API:**
   ```bash
   python manage.py runserver
   ```
   *(El backend correrá en http://localhost:8000)*

### Paso 3: Despliegue del Frontend 🎨

Abre una **nueva terminal**, ingresa a la carpeta del proyecto y ejecuta:
```bash
cd frontend
npm install
npm run dev
```
*(La plataforma estará disponible en http://localhost:5173)*

---

## 💡 Pruebas y Validación

El sistema ha sido rigurosamente validado en entornos de desarrollo mediante metodologías controladas:

- 🧪 **Pruebas Unitarias de Consistencia**: Verificación de bloqueo de datos corruptos mediante validación matemática de RUTs y formatos, devolviendo errores `HTTP 400` en los serializadores.
- 🔄 **Pruebas de Regresión en Signals**: Control de persistencia y mitigación de bucles infinitos en el motor de alertas operacionales (mediante el parámetro `created`).
- 🛡️ **Tests de Penetración Perimetral**: Validación estricta de bloqueos `HTTP 403 Forbidden` y `401 Unauthorized` simulando peticiones con tokens JWT inválidos o roles cruzados.

---

## ❓ Preguntas Frecuentes

**P: ¿Por qué los datos médicos son obligatorios si se marca "Movilidad Reducida"?**
R: Bajo la Ley N° 21.442, esta información es crítica para planificar rescates efectivos por parte de Bomberos durante emergencias en edificios de altura.

**P: ¿Qué pasa cuando caduca el token JWT?**
R: El sistema cerrará la sesión de forma segura por políticas de protección de la vida privada (Ley N° 19.628). El usuario deberá iniciar sesión nuevamente.

**P: ¿Cómo evita el sistema duplicar departamentos al subir Excel?**
R: El algoritmo de validación del backend busca coincidencias de "Número" y "Torre". Si existe, actualiza a los residentes; si no, arroja un aviso previniendo bases de datos sucias.

---

## 🔧 Solución de Problemas

### Problema: No se envían los correos automáticos
**Solución**: Verifica que hayas configurado las variables de entorno (`EMAIL_HOST_USER`, `EMAIL_HOST_PASSWORD`) en el archivo `.env` del backend.

### Problema: El frontend muestra "Network Error"
**Solución**: Asegúrate de que el servidor de Django (`runserver`) esté ejecutándose en otra terminal antes de levantar Vite.

### Problema: Pytest no se reconoce en Windows
**Solución**: Asegúrate de que el entorno virtual `venv` esté activo o ejecuta las pruebas usando el comando seguro: `python -m pytest -v`.

---

## 📖 Glosario de Términos

### 🔤 **Términos Técnicos**

**DRF (Django REST Framework)**
> Herramienta robusta de Python para construir Web APIs rápidamente.

**JWT (JSON Web Token)**
> Estándar seguro para transmitir información autenticada como un objeto JSON cifrado.

**RBAC (Role-Based Access Control)**
> Sistema de seguridad que restringe el acceso a la red basándose en los roles de los usuarios (Ej: Admin vs Residente).

**Signals**
> Despachadores de eventos en Django que permiten reaccionar automáticamente cuando ocurren acciones en la base de datos (como guardar o borrar un archivo).

### ⚖️ **Marco Normativo**

**Ley N° 21.442**
> Ley de Copropiedad Inmobiliaria chilena que regula la convivencia, administración y medidas de emergencia en condominios.

**Ley N° 19.628**
> Ley de Protección de la Vida Privada que salvaguarda el tratamiento de datos personales, especialmente los sensibles (salud).

---
