# Sistema Digital de Catastro para la Gestión de Planes de Emergencia en Condominios

![Version](https://img.shields.io/badge/Versión-v1.0.0-blue)
![Stack](https://img.shields.io/badge/Stack-React%20%7C%20Django%20REST-success)
![License](https://img.shields.io/badge/Licencia-Uso%20Académico-orange)

## 1. Descripción del Proyecto y Justificación Legal

El **Sistema Digital de Catastro para Emergencias** es una plataforma tecnológica integral diseñada para resolver de manera automatizada e informática las exigencias operacionales establecidas en el **Artículo 40 de la Ley N° 21.442 sobre Copropiedad Inmobiliaria** en Chile y su respectivo Reglamento. Dicho marco normativo exige a las administraciones mantener un registro exhaustivo y permanentemente actualizado de los residentes de un condominio, haciendo especial énfasis en la identificación de personas con movilidad reducida y condiciones médicas críticas para asegurar una evacuación eficiente ante emergencias.

De manera complementaria, este sistema ha sido desarrollado bajo estrictos estándares de seguridad y confidencialidad para cumplir a cabalidad con la **Ley N° 19.628 sobre Protección de la Vida Privada**. El acceso a los datos de salud se gestiona mediante control perimetral estricto (RBAC) y cifrado de autenticación, asegurando que los datos sensibles sean accedidos única y exclusivamente por los usuarios autorizados bajo el principio de finalidad.

## 2. Características Principales (Módulos Base)

### 🔹 Módulo Administrador
Diseñado como el centro de mando (Dashboard) para la administración del condominio. Permite la **carga masiva por lotes de departamentos** y residentes a través de la importación directa de planillas estructuradas de Excel (`.xlsx`). Ofrece un control maestro de habitantes mediante filtros avanzados, permitiendo exportar listados de emergencia y visualizar estadísticas demográficas en tiempo real a través de su bitácora analítica.

### 🔹 Módulo Residente
Proporciona a cada titular una interfaz privada para mantener su ficha demográfica autogestionada. Utiliza **formularios dinámicos condicionales**: si el usuario activa la casilla de *movilidad reducida*, el sistema fuerza automáticamente la captura de datos de asistencia médica, condiciones específicas de salud y contactos de tutores de urgencia, garantizando la integridad de los datos críticos para bomberos y servicios de rescate.

### 🔹 Módulo de Eventos (Señales y Notificaciones)
Motor reactivo en el backend que despliega notificaciones automáticas y alertas operacionales. El sistema realiza un escrutinio cronológico y notifica con **60 días de anticipación** al cumplimiento de los plazos normativos:
- Los datos y fichas de salud de los residentes requieren confirmación/renovación cada **6 meses**.
- Los planes documentales de emergencia tienen vencimiento **anual**.

## 3. Diagrama de Arquitectura de Software

La plataforma emplea una arquitectura desacoplada basada en Servicios API RESTful, asegurando alta disponibilidad, escalabilidad y una clara separación de responsabilidades entre la capa de presentación y la lógica de negocio.

```text
+-------------------------------------------------------------------------------+
|                             CLIENTE (FRONTEND)                                |
|                                                                               |
|   +-------------------+    +-------------------+    +---------------------+   |
|   |  React.js UI      |    | React-Joyride     |    | Cliente HTTP        |   |
|   |  (Tailwind CSS,   +--->| (Tours Didácticos +--->| (Axios)             |   |
|   |   Vite)           |    |  nativos)         |    |                     |   |
|   +-------------------+    +-------------------+    +---------+-----------+   |
+---------------------------------------------------------------|---------------+
                                                                | (Peticiones JSON)
                                                                v
+---------------------------------------------------------------|---------------+
|                             SERVIDOR (BACKEND)                |               |
|                                                               v               |
|   +-----------------------------------------------------------+-----------+   |
|   | MIDDLEWARE DE SEGURIDAD (SimpleJWT)                                   |   |
|   | (Validación de Token, Control Perimetral HTTP 401/403, RBAC)          |   |
|   +-----------------------------------+-----------------------------------+   |
|                                       |                                       |
|                                       v                                       |
|   +-----------------------------------+-----------------------------------+   |
|   | ENRUTAMIENTO Y LÓGICA (Django REST Framework)                         |   |
|   |                                                                       |   |
|   |    +---------------+        +---------------+                         |   |
|   |    | ViewSets      +------->| Serializers   |                         |   |
|   |    | (Controlador) |<-------+ (Sanitización)|                         |   |
|   |    +-------+-------+        +-------+-------+                         |   |
|   +------------|------------------------|---------------------------------+   |
|                v                        v                                     |
|   +------------+------------------------+---------------------------------+   |
|   | CAPA DE PERSISTENCIA Y EVENTOS (Django ORM & Signals)                 |   |
|   |                                                                       |   |
|   |    +------------------------+      +------------------------------+   |   |
|   |    | Modelos Relacionales   +----->| Django Signals               |   |   |
|   |    | (Condominio, Residente)|      | (post_save, post_delete)     |   |   |
|   |    +----------+-------------+      +--------------+---------------+   |   |
|   |               |                                   | (Despacho asíncrono)  |
|   +---------------|-----------------------------------|---------------+   |
|                   |                                   |               |   |
|                   v                                   v               |   |
|       +-----------+-----------+          +------------+-----------+   |   |
|       | Base de Datos         |          | Hilo en Segundo Plano  |   |   |
|       | SQLite3 / PostgreSQL  |          | (Threading / SMTP)     |   |   |
|       | (Principios ACID)     |          | Notificaciones E-mail  |   |   |
|       +-----------------------+          +------------------------+   |   |
+-------------------------------------------------------------------------------+
```

## 4. Requisitos Previos e Instructivo de Instalación

El siguiente instructivo está diseñado para el despliegue del ecosistema en entornos de desarrollo local sobre sistemas operativos Windows (utilizando **PowerShell** o **Git Bash**).

### 4.1. Clonación de Repositorio
```bash
git clone <URL_DEL_REPOSITORIO>
cd <DIRECTORIO_DEL_PROYECTO>
```
La estructura base contendrá los directorios `/backend` y `/frontend`.

### 4.2. Instalación y Configuración del Backend (Django)
Abre una terminal y dirígete al directorio del servidor:
```bash
cd backend
```
1. **Creación del Entorno Virtual (venv):**
   ```bash
   python -m venv venv
   ```
2. **Activación del Entorno Virtual:**
   - En PowerShell: `.\venv\Scripts\Activate.ps1`
   - En Git Bash: `source venv/Scripts/activate`
3. **Instalación de Dependencias:**
   ```bash
   pip install -r requirements.txt
   ```
4. **Configuración de Variables de Entorno (`.env`):**
   Crea un archivo `.env` en la raíz de `/backend` y configura los parámetros de seguridad, base de datos y SMTP para el despacho de correos (ej. `EMAIL_HOST_USER`, `SECRET_KEY`).
5. **Migraciones de Base de Datos:**
   ```bash
   python manage.py makemigrations
   python manage.py migrate
   ```
6. **Ejecución del Servidor:**
   ```bash
   python manage.py runserver
   ```
   El backend estará escuchando en `http://localhost:8000`.

### 4.3. Instalación y Configuración del Frontend (React.js)
Abre una segunda terminal y dirígete al directorio del cliente:
```bash
cd frontend
```
1. **Instalación de Dependencias de Node:**
   ```bash
   npm install
   ```
2. **Ejecución del Servidor de Desarrollo (Vite):**
   ```bash
   npm run dev
   ```
   La aplicación web estará disponible en `http://localhost:5173`.

## 5. Estrategia de Pruebas y Validación (Entorno Controlado)

Al tratarse de un prototipo funcional (MVP) de etapa temprana, el sistema no fue implementado en un entorno de producción real o cloud público. No obstante, el ecosistema fue validado directamente y de manera rigurosa en el entorno de desarrollo mediante los siguientes vectores de calidad:

- **Pruebas Unitarias de Consistencia:** Validación a nivel de Serializadores (DRF) comprobando que las peticiones con estructuras corruptas, campos críticos omitidos o rut inválidos fueran rechazadas nativamente con códigos de error `HTTP 400 Bad Request`.
- **Pruebas de Regresión en Signals:** Control de la inyección y persistencia de alertas automatizadas en la base de datos relacional. Se testeó exhaustivamente la mitigación de bucles de recursividad infinita (asegurando el uso condicional del parámetro `created` dentro de las funciones receptoras de la señal).
- **Tests de Penetración Perimetral (API):** Validación de los bloqueos de seguridad de SimpleJWT. Se simularon peticiones no autorizadas cruzadas entre inquilinos y accesos anónimos, constatando el rechazo eficiente por parte del servidor mediante códigos `HTTP 401 Unauthorized` y `HTTP 403 Forbidden`, asegurando el blindaje del módulo documental.