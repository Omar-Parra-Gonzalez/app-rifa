Sistema Automatizado de Rifas en Línea 

Aplicación comercial Full Stack diseñada para la digitalización, venta y control automatizado de sorteos y rifas comunitarias en tiempo real. El sistema elimina por completo las listas en papel, permitiendo una gestión de ventas ágil, visual y con un control estricto desde el servidor para proteger el negocio.

Para garantizar la máxima velocidad, estabilidad y un despliegue profesional en un entorno de producción real, toda la infraestructura de la aplicación (Frontend, Backend y Base de Datos) se encuentra centralizada y desplegada en Railway.

Características y Módulos del Sistema
•	Tablero Numérico Interactivo (Frontend Dinámico): Interfaz limpia y responsiva que permite al comprador o vendedor seleccionar múltiples números con un solo toque, cambiando de estado visual (Disponible/Dorado) al instante sin recargar la página.
•	Control de Tiempos de Alquiler (Filtro de Seguridad Java): El sistema cuenta con un middleware interno en Spring Boot que valida en cada milisegundo la fecha límite de uso. Si el plazo expira, bloquea la plataforma inmediatamente con un estado 403 Forbidden, desplegando una pantalla de suspensión con redirección a soporte.
•	Persistencia Blindada (MySQL en Producción): Control estricto de concurrencia en la base de datos que impide que dos personas compren el mismo número al mismo tiempo. Si un número ya fue adquirido, el sistema lo bloquea en gris permanentemente.
•	Módulo de Captura y Comprobantes (html2canvas): Opción integrada para el administrador o vendedor que genera y descarga una imagen de alta calidad (.jpg) con el estado actual del tablero, ideal para compartir en redes sociales o estados de WhatsApp.
•	Pasarela de Confirmación vía WhatsApp: Al registrarse la compra de forma exitosa en el backend, el sistema genera automáticamente un enlace con el código de país configurado (+57) y el texto completamente codificado, abriendo un chat directo con el cliente para enviarle el comprobante de su boleta sin agregar el contacto. 

Arquitectura Tecnológica y Despliegue
•	Frontend: HTML5, CSS3 (Diseño compacto y responsivo) y JavaScript Moderno (ES6, Fetch API).
•	Backend: Java 17 y Spring Boot (Arquitectura REST basada en DTOs y controladores desacoplados).
•	Base de Datos: MySQL (Motor relacional para la gestión limpia de participantes y números).
•	Infraestructura de Servidores: Railway (Monitoreo de logs en tiempo real, variables de entorno seguras y despliegue continuo de base de datos y backend).

