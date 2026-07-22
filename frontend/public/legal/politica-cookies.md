# POLÍTICA DE COOKIES Y ALMACENAMIENTO LOCAL

**Última actualización: 22 de julio de 2026**

En **ConciliaFácil** valoramos tu privacidad y mantenemos una política de total transparencia sobre las tecnologías que utilizamos para que la aplicación web funcione correctamente en tu navegador. Esta política describe cómo y por qué utilizamos cookies, almacenamiento local y otras tecnologías similares.

---

## 1. ¿Qué es el Almacenamiento en el Navegador?
Para proporcionarte una experiencia fluida, la Plataforma utiliza tecnologías de almacenamiento local provistas por tu propio navegador:
* **Cookies:** Pequeños archivos de texto que los sitios web almacenan en tu computadora o dispositivo móvil mientras navegas.
* **LocalStorage y SessionStorage:** Mecanismos de almacenamiento de datos web integrados de forma nativa en los navegadores que permiten guardar datos directamente en el dispositivo del usuario de forma persistente (incluso después de cerrar el navegador) o temporal (durante la pestaña activa).

---

## 2. Almacenamiento Estrictamente Necesario (Técnicas)
ConciliaFácil utiliza almacenamiento local únicamente para fines técnicos y operativos indispensables para el funcionamiento y seguridad de la Plataforma. Estas tecnologías no requieren consentimiento previo del usuario, ya que el servicio no puede funcionar sin ellas:

### A. Autenticación y Control de Sesión (Supabase Auth)
Utilizamos el almacenamiento local (LocalStorage) gestionado automáticamente por la librería cliente de Supabase para almacenar la información de sesión JWT (JSON Web Tokens). Esto incluye:
* **Token de acceso (Access Token):** Para validar de forma segura tus peticiones frente al servidor de backend.
* **Token de actualización (Refresh Token):** Para renovar tu sesión activa de manera segura y automática sin que tengas que ingresar tu contraseña constantemente.
* **Datos del usuario autenticado:** Información mínima de sesión (ID único del usuario) necesaria para mantener tu estado en la aplicación.

### B. Preferencias de Interfaz
* Utilizamos almacenamiento local para recordar tus preferencias visuales básicas de la plataforma, específicamente el modo de visualización del tema seleccionado (tema claro o tema oscuro), asegurando que se aplique correctamente antes de que la página se renderice por completo.

---

## 3. Ausencia de Rastreo de Terceros y Cookies de Marketing
* **Sin Cookies Publicitarias o de Marketing:** ConciliaFácil **no utiliza cookies o tecnologías de rastreo para crear perfiles de usuario**, mostrar publicidad personalizada ni registrar tu comportamiento en otros sitios web.
* **Sin Compartición con Terceros:** Toda la información técnica persistida localmente se almacena bajo el dominio exclusivo de la aplicación y no es compartida con redes publicitarias ni intermediarios de datos.

---

## 4. Gestión del Almacenamiento Local
Puedes ver, gestionar y eliminar el almacenamiento local y las cookies directamente en la configuración de tu navegador en cualquier momento:
* Ten en cuenta que si desactivas por completo el almacenamiento local o bloqueas las cookies técnicas estrictamente necesarias, la plataforma no podrá verificar tu identidad, por lo que **no podrás iniciar sesión ni utilizar las funciones de conciliación**.
* Para limpiar tu sesión de forma segura y borrar tus tokens de acceso, te recomendamos utilizar siempre el botón de **Cerrar Sesión** en la interfaz de la aplicación, el cual limpia automáticamente tus credenciales guardadas en el LocalStorage de tu navegador.
