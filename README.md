Aplicación comercial Full Stack 

Diseñada para la digitalización, venta y control automatizado de sorteos y rifas en tiempo real. El sistema elimina por completo las listas en papel, permitiendo una gestión de ventas ágil, visual y con un control estricto desde el servidor para proteger el negocio.
Para garantizar la máxima velocidad, estabilidad y un despliegue profesional en un entorno de producción real, toda la infraestructura de la aplicación (Frontend, Backend y Base de Datos) se encuentra centralizada y desplegada en Railway.

Características y Módulos del Sistema.

-	Tablero Numérico Interactivo (Frontend Dinámico): Interfaz limpia y responsiva que permite al comprador o vendedor seleccionar múltiples números con un solo toque, cambiando de estado visual (Disponible/Dorado) al instante sin recargar la página.
-	Control de Tiempos de Alquiler (Filtro de Seguridad Java): El sistema cuenta con un middleware interno en Spring Boot que valida en cada milisegundo la fecha límite de uso. Si el plazo expira, bloquea la plataforma inmediatamente con un estado 403 Forbidden, desplegando una pantalla de suspensión con redirección a soporte.
-	Persistencia Blindada (MySQL en Producción): Control estricto de concurrencia en la base de datos que impide que dos personas compren el mismo número al mismo tiempo. Si un número ya fue adquirido, el sistema lo bloquea en gris permanentemente.
-	Módulo de Captura y Comprobantes (html2canvas): Opción integrada para el administrador o vendedor que genera y descarga una imagen de alta calidad (.jpg) con el estado actual del tablero, ideal para compartir en redes sociales o estados de WhatsApp.
-	Pasarela de Confirmación vía WhatsApp: Al registrarse la compra de forma exitosa en el backend, el sistema genera automáticamente un enlace con el código de país configurado (+57) y el texto completamente codificado, abriendo un chat directo con el cliente para enviarle el comprobante de su boleta sin agregar el contacto.
-	Módulo de Autenticación por Tokens y Control de Acceso Individual El sistema implementa un filtro de seguridad interceptor (Filter) en el Backend que protege las rutas críticas de la API. Tras una validación exitosa de credenciales, el servidor expide un token único que se almacena de forma aislada en el localStorage del dispositivo en uso. Esto restringe el acceso al tablero únicamente a terminales autorizadas y bloquea de manera inmediata cualquier intento de inyección de datos externa o peticiones maliciosas de terceros (p. ej., a través de Postman).
-	Monitoreo Asíncrono en Tiempo Real. JavaScript ejecuta una revisión en segundo plano (Background Worker) que consulta cíclicamente el estado del servidor cada 60 segundos. Este mecanismo garantiza que si el administrador revoca los permisos, altera las credenciales o suspende el servicio desde el panel de control, la sesión activa en el navegador del usuario se destruye de forma automática y transparente en menos de un minuto, forzando un bloqueo de pantalla inmediato sin necesidad de recargar la interfaz.

Arquitectura Tecnológica y Despliegue

-	Frontend: HTML, CSS (Diseño compacto y responsivo) y JavaScript (ES6, Fetch API).
-	Backend: Java 17 y Spring Boot (Arquitectura REST basada en DTOs y controladores desacoplados).
-	Base de Datos: MySQL (Motor relacional para la gestión limpia de participantes y números).
-	Infraestructura de Servidores: Railway (Monitoreo de logs en tiempo real, variables de entorno seguras y despliegue continuo de base de datos y backend).


