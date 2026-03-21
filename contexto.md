# 📄 CONTEXTO Y REFERENCIA DEL PROYECTO: CatastroEmergenciaCL

## 1. Visión General del Proyecto
**CatastroEmergenciaCL** es una plataforma web diseñada para la gestión digital del catastro de residentes en condominios y edificios en Chile. Su objetivo principal es facilitar la respuesta ante emergencias, permitiendo a las administraciones y comités mantener un registro actualizado de los habitantes, con especial énfasis en identificar a personas que requieran asistencia (movilidad reducida, tercera edad, infantes).

El proyecto nace como una solución tecnológica para dar cumplimiento a las exigencias establecidas en la **Ley de Copropiedad Inmobiliaria N° 21.442**.

## 2. Marco Legal y Normativo (Contexto de Negocio)
Toda la lógica de negocio y las restricciones de seguridad del sistema están fundamentadas en la siguiente normativa chilena:
* **Ley N° 21.442 de Copropiedad Inmobiliaria:** Exige a las comunidades contar con un Plan de Emergencia y Evacuación actualizado, el cual debe incluir un registro detallado de los ocupantes.
* **Reglamento de la Ley 21.442:** Establece los lineamientos específicos sobre cómo deben gestionarse y actualizarse estos planes.
* **Ley N° 19.628 sobre Protección de la Vida Privada:** Regula el tratamiento de datos personales. Dado que el sistema almacena información sobre la salud o condición física de los residentes (datos sensibles), es **obligatorio** por ley aplicar medidas de seguridad estrictas (cifrado de datos) y garantizar que solo personal autorizado tenga acceso a esta información.

## 3. Arquitectura y Stack Tecnológico
El proyecto utiliza una arquitectura desacoplada para garantizar escalabilidad y facilitar futuras integraciones.

* **Backend (API REST):** Python con Django y Django REST Framework (DRF) o Django Ninja.
* **Base de Datos:** PostgreSQL (SQL).
* **Frontend:** React.js (o Next.js) estilizado con Tailwind CSS (enfoque Mobile-First).
* **Automatización (Background Tasks):** Celery + Redis (o django-crontab) para