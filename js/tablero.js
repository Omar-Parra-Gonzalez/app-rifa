document.addEventListener("DOMContentLoaded", () => {
    const grid = document.querySelector(".grid");
    const btnAgregar = document.querySelector(".btn-agregar");

    // Elementos del Modal
    const modal = document.getElementById("modal-registro");
    const inputNombre = document.getElementById("modal-nombre");
    const inputTelefono = document.getElementById("modal-telefono");
    const inputAlias = document.getElementById("modal-alias");
    const containerNumeros = document.getElementById("modal-numeros-badge-container");
    const btnCancelar = document.getElementById("btn-modal-cancelar");
    const btnGuardar = document.getElementById("btn-modal-guardar");
    const modalExito = document.getElementById("modal-exito");

    // Guardar referencia temporal de las casillas seleccionadas para el registro posterior
    let casillasSeleccionadas = [];
    let numerosElegidos = [];

    // URLs de la API en Spring Boot
    const API_URL_OCUPADOS = "http://localhost:8080/api/rifas/ocupados";
    const API_URL_REGISTRAR = "http://localhost:8080/api/rifas/registrar";

    // 🆕 FUNCIÓN AUXILIAR PARA PINTAR EL MODAL DE BLOQUEO DE UNA
    const mostrarPantallaBloqueo = () => {
        document.body.innerHTML = `
            <div style="position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: #fff6ec; display: flex; align-items: center; justify-content: center; z-index: 99999; font-family: sans-serif; text-align: center; padding: 20px; box-sizing: border-box;">
                <div style="background: white; padding: 40px; border-radius: 15px; box-shadow: 0 10px 25px rgba(0,0,0,0.1); max-width: 500px;">
                    <h1 style="color: #a47c44; font-size: 2.2rem; margin-bottom: 15px;">🎟️ Plataforma Suspendida</h1>
                    <p style="font-size: 1.1rem; color: #555; line-height: 1.6; margin-bottom: 25px;">
                        El tiempo de alquiler de esta página ha expirado. Si eres el organizador y deseas contratar días adicionales, comunícate con el administrador.
                    </p>
                    <a href="https://wa.me/573184935249?text=Hola,%20deseo%20renovar%20el%20tiempo%20de%20mi%20página" 
                       target="_blank"
                       style="display: inline-block; padding: 14px 30px; background: #25d366; color: white; text-decoration: none; border-radius: 30px; font-weight: bold; font-size: 1.1rem; box-shadow: 0 4px 12px rgba(37, 211, 102, 0.3);">
                       💬 Comunicarse con Soporte
                    </a>
                </div>
            </div>
        `;
    };

    // Bloquear números consultando la Base de Datos mediante Spring Boot
    const todosLosDivs = grid.querySelectorAll("div");
    fetch(API_URL_OCUPADOS)
        .then(response => {
            // 🆕 LUGAR 1: Si Java manda 403 al cargar el tablero, bloqueamos de una
            if (response.status === 403) {
                mostrarPantallaBloqueo();
                throw new Error("Aplicación bloqueada en el servidor.");
            }
            return response.json();
        })
        .then(numerosOcupados => {
            // 'numerosOcupados' es un arreglo de strings enviado por Java: ["05", "14", "82"]
            todosLosDivs.forEach(div => {
                const numeroTexto = div.textContent.trim();
                if (numerosOcupados.includes(numeroTexto)) {
                    div.classList.add("ocupado");
                    div.classList.remove("seleccionado"); // Por seguridad
                }
            });
        })
        .catch(error => {
            console.error("Error al cargar los números ocupados desde el servidor:", error);
        });

    // SELECCIÓN LIBRE, Pintar dorado o desmarcar al instante sin bloquear la pantalla
    grid.addEventListener("click", (e) => {
        // Verificamos que sea un div numérico y que no esté ocupado (gris)
        if (e.target.tagName === "DIV" && !e.target.classList.contains("ocupado")) {
            // toggle pone la clase si no está, y la quita si ya la tiene.
            e.target.classList.toggle("seleccionado");
        }
    });

    // MOSTRAR MODAL, se ejecuta al oprimir el botón de Registrar
    btnAgregar.addEventListener("click", () => {
        // Capturar lo que esté marcado en dorado en ese preciso instante
        casillasSeleccionadas = document.querySelectorAll(".grid div.seleccionado");
        if (casillasSeleccionadas.length === 0) {
            alert("Por favor, selecciona primero los números en el tablero.");
            return;
        }

        // Convertir los divs seleccionados a un arreglo de texto
        numerosElegidos = Array.from(casillasSeleccionadas).map(div => div.textContent.trim());

        // Limpiar el contenido de inputs
        inputNombre.value = "";
        inputTelefono.value = "";

        // Limpiar la casilla del alias para la nueva compra
        if (inputAlias) {
            inputAlias.value = "";
        }

        // Generar cápsulas visuales para los números escogidos en el modal
        containerNumeros.innerHTML = "";
        numerosElegidos.forEach(num => {
            const badge = document.createElement("span");
            badge.classList.add("badge-numero");
            badge.textContent = num;
            containerNumeros.appendChild(badge);
        });

        // Mostrar el modal agregando la clase 'activo'
        modal.classList.add("activo");
        inputNombre.focus();
    });

    // FUNCIONES DE CIERRE DEL MODAL
    const cerrarModal = () => {
        modal.classList.remove("activo");
    };

    // Evitar que se escriban caracteres que no sean números en tiempo real
    inputTelefono.addEventListener("input", (e) => {
        // Reemplaza cualquier carácter que NO sea un dígito (\D) por un texto vacío
        e.target.value = e.target.value.replace(/\D/g, "");
    });
    btnCancelar.addEventListener("click", cerrarModal);

    // Cerrar al hacer clic fuera del contenido del modal
    modal.addEventListener("click", (e) => {
        if (e.target === modal) {
            cerrarModal();
        }
    });

    // Cerrar al hacer clic en el modal de éxito (cualquier parte)
    modalExito.addEventListener("click", () => {
        modalExito.classList.remove("activo");
        if (modalExito.dataset.timerId) {
            clearTimeout(Number(modalExito.dataset.timerId));
            delete modalExito.dataset.timerId;
        }
    });

    // REGISTRAR DATOS, al hacer clic en Guardar dentro del modal (Hacia el Backend)
    btnGuardar.addEventListener("click", () => {
        const nombreVal = inputNombre.value.trim();
        const telefonoVal = inputTelefono.value.trim();
        const aliasVal = inputAlias ? inputAlias.value.trim() : "";

        if (nombreVal === "") {
            alert("Por favor, ingresa el Nombre y Apellido.");
            inputNombre.focus();
            return;
        }

        if (telefonoVal === "") {
            alert("Por favor, ingresa el número de teléfono / WhatsApp.");
            inputTelefono.focus();
            return;
        }
        if (!/^\d+$/.test(telefonoVal)) {
            alert("El número de teléfono solo puede contener dígitos (0-9).");
            inputTelefono.focus();
            return;
        }
        const pagoVal = document.getElementById("modal-pago").value;
        const datosCompra = {
            nombre: nombreVal,
            telefono: telefonoVal,
            numeros: numerosElegidos,
            pago: pagoVal,
            alias: aliasVal
        };

        // Desactiva temporalmente el botón para evitar doble clic accidental
        btnGuardar.disabled = true;

        // Enviar la información a Spring Boot
        fetch(API_URL_REGISTRAR, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(datosCompra)
        })
            .then(response => {
                // Si Java manda 403 al intentar registrar una boleta, bloqueamos
                if (response.status === 403) {
                    mostrarPantallaBloqueo();
                    throw new Error("Aplicación bloqueada en el servidor.");
                }
                if (!response.ok) {
                    throw new Error("Uno de los números seleccionados ya fue comprado.");
                }
                return response.json();
            })
            .then(data => {

                // Cambiamos los números del tablero a estado ocupado permanente (gris)
                casillasSeleccionadas.forEach(div => {
                    div.classList.remove("seleccionado");
                    div.classList.add("ocupado");
                });
                cerrarModal();

                // Mostrar modal de éxito
                modalExito.classList.add("activo");
                const timerExito = setTimeout(() => {
                    modalExito.classList.remove("activo");
                }, 2500);
                modalExito.dataset.timerId = timerExito;
                const textoCodificado = encodeURIComponent(data.textoWhatsApp);
                const urlWhatsApp = `https://api.whatsapp.com/send?phone=57${data.telefono}&text=${textoCodificado}`;
                console.log("URL FINAL CORREGIDA:");
                console.log(urlWhatsApp);
                window.open(urlWhatsApp, '_blank');
            })
            .catch(error => {
                // 🆕 Si el error viene de nuestro bloqueo manual, no saques el alert ordinario
                if (error.message !== "Aplicación bloqueada en el servidor.") {
                    alert("Hubo un error al registrar: " + error.message);
                    casillasSeleccionadas.forEach(div => div.classList.add("seleccionado"));
                }
            })
            .finally(() => {
                btnGuardar.disabled = false;
            });
    });

    // PARA GENERAR Y DESCARGAR EL COMPROBANTE EN JPG
    const botonCaptura = document.getElementById("btn-captura-vendedor");

    if (botonCaptura) {
        botonCaptura.addEventListener("click", () => {
            // Modo compacto en el body
            document.body.classList.add("modo-captura-activo");
            setTimeout(() => {
                const contenedorRifa = document.querySelector(".rifa-container");

                html2canvas(contenedorRifa, {
                    scale: 2,
                    backgroundColor: "#fff6ec",
                    useCORS: true
                }).then(canvas => {
                    // Convierte el lienzo en un archivo JPG de alta calidad (0.9)
                    const urlImagen = canvas.toDataURL("image/jpeg", 0.9);
                    // Crea un enlace invisible para forzar la descarga
                    const enlaceDescarga = document.createElement("a");
                    enlaceDescarga.download = "numeros-disponibles-goipro.jpg";
                    enlaceDescarga.href = urlImagen;
                    enlaceDescarga.click();
                    // Quita el modo captura para que la app vuelva a la normalidad
                    document.body.classList.remove("modo-captura-activo");
                }).catch(error => {
                    console.error("Error al generar el JPG:", error);
                    // Por seguridad, si falla, restablece la pantalla
                    document.body.classList.remove("modo-captura-activo");
                });
            }, 300);
        });
    }
});