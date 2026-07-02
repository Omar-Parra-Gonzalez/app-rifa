// CONTROL DE ACCESO Y LOGIN (Se ejecuta primero al cargar la página)

document.addEventListener("DOMContentLoaded", () => {
    const sesionActiva = localStorage.getItem("acceso_rifa_valido");

    if (!sesionActiva) {
        mostrarModalLogin();
    } else {
        inicializarAplicacion();
    }
});

// Función para dibujar el modal oscuro en pantalla completa
function mostrarModalLogin() {
    const modalHTML = `
        <div id="modal-login-overlay" style="
            position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
            background: #0f141c; display: flex; align-items: center; justify-content: center;
            z-index: 100000; font-family: sans-serif; padding: 20px; box-sizing: border-box;
        ">
            <div style="
                background: #1e2530; padding: 30px; border-radius: 12px;
                box-shadow: 0 8px 24px rgba(0,0,0,0.5); width: 100%; max-width: 400px;
                text-align: center; border: 1px solid #3a4659;
            ">
                <h2 style="color: #e6b055; margin-bottom: 10px; font-size: 1.8rem;">🎟️ Acceso al Sistema</h2>
                <p style="color: #98a6b8; font-size: 0.9rem; margin-bottom: 25px;">Ingrese las credenciales aprovadas por el administrador para activar su sesión.</p>
                <div style="margin-bottom: 15px; text-align: left;">
                    <label style="color: #cbd5e1; display: block; margin-bottom: 5px; font-size: 0.85rem;">Usuario</label>
                    <input type="text" id="login-user" placeholder="Ej: Acceso rifa" style="
                        width: 100%; padding: 12px; border-radius: 6px; border: 1px solid #3a4659;
                        background: #0f141c; color: #fff; box-sizing: border-box; outline: none;
                    ">
                </div>
                <div style="margin-bottom: 25px; text-align: left;">
                    <label style="color: #cbd5e1; display: block; margin-bottom: 5px; font-size: 0.85rem;">Contraseña</label>
                    <input type="password" id="login-pass" placeholder="••••••••" style="
                        width: 100%; padding: 12px; border-radius: 6px; border: 1px solid #3a4659;
                        background: #0f141c; color: #fff; box-sizing: border-box; outline: none;
                    ">
                </div>
                <button id="btn-ingresar-rifa" style="
                    width: 100%; padding: 12px; background: #e6b055; color: #0f141c;
                    border: none; border-radius: 6px; font-weight: bold; font-size: 1rem;
                    cursor: pointer; transition: background 0.3s;
                ">Iniciar Sesión</button>
                
                <p id="login-error-msg" style="color: #ff6b6b; font-size: 0.85rem; margin-top: 15px; display: none;"></p>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);
    document.getElementById("btn-ingresar-rifa").addEventListener("click", procesarLogin);
}

async function procesarLogin() {
    const usuario = document.getElementById("login-user").value;
    const password = document.getElementById("login-pass").value;
    const errorMsg = document.getElementById("login-error-msg");

    // Ajustado a Localhost
    const URL_BAKEND = "http://localhost:8080/api/auth/login";

    try {
        const respuesta = await fetch(URL_BAKEND, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ usuario: usuario, password: password })
        });

        const resultado = await respuesta.json();

        if (respuesta.ok && (resultado.autorizado === undefined || resultado.autorizado)) {
            localStorage.setItem("acceso_rifa_valido", "true");
            localStorage.setItem("token_seguridad_rifa", resultado.token);

            // Se remueve el modal de la pantalla para que pueda usar la app
            document.getElementById("modal-login-overlay").remove();

            // ACTIVA LA APLICACIÓN DE UNA VEZ TRAS EL LOGIN EXITOSO
            inicializarAplicacion();
        } else {
            errorMsg.innerText = resultado.mensaje || "Credenciales inválidas";
            errorMsg.style.display = "block";
        }
    } catch (error) {
        errorMsg.innerText = "Error de conexión con el servidor de seguridad.";
        errorMsg.style.display = "block";
    }
}


// =========================================================================
// LÓGICA PRINCIPAL DE LA APLICACIÓN (Protegida por el inicio de sesión)
// =========================================================================

function inicializarAplicacion() {
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

    // URLs de la API ajustadas a Localhost
    const API_URL_OCUPADOS = "http://localhost:8080/api/rifas/ocupados";
    const API_URL_REGISTRAR = "http://localhost:8080/api/rifas/registrar";

    // FUNCIÓN AUXILIAR PARA PINTAR EL MODAL DE BLOQUEO 
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

    // Bloquear números consultando la Base de Datos mediante Spring Boot (Con Token)
    const todosLosDivs = grid.querySelectorAll("div");
    fetch(API_URL_OCUPADOS, {
        method: "GET",
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token_seguridad_rifa")
        }
    })
        .then(response => {
            if (response.status === 403) {
                // Si el tiempo expiró, destruimos el token para obligarlo a loguearse de nuevo en la reactivación
                localStorage.removeItem("acceso_rifa_valido");
                localStorage.removeItem("token_seguridad_rifa");
                mostrarPantallaBloqueo();
                throw new Error("Aplicación bloqueada en el servidor.");
            }
            return response.json();
        })
        .then(numerosOcupados => {
            todosLosDivs.forEach(div => {
                const numeroTexto = div.textContent.trim();
                if (numerosOcupados.includes(numeroTexto)) {
                    div.classList.add("ocupado");
                    div.classList.remove("seleccionado");
                }
            });
        })
        .catch(error => {
            console.error("Error al cargar los números ocupados desde el servidor:", error);
        });

    // SELECCIÓN LIBRE
    grid.addEventListener("click", (e) => {
        if (e.target.tagName === "DIV" && !e.target.classList.contains("ocupado")) {
            e.target.classList.toggle("seleccionado");
        }
    });

    // MOSTRAR MODAL REGISTRO
    btnAgregar.addEventListener("click", () => {
        casillasSeleccionadas = document.querySelectorAll(".grid div.seleccionado");
        if (casillasSeleccionadas.length === 0) {
            alert("Por favor, selecciona primero los números en el tablero.");
            return;
        }

        numerosElegidos = Array.from(casillasSeleccionadas).map(div => div.textContent.trim());

        inputNombre.value = "";
        inputTelefono.value = "";

        if (inputAlias) {
            inputAlias.value = "";
        }

        containerNumeros.innerHTML = "";
        numerosElegidos.forEach(num => {
            const badge = document.createElement("span");
            badge.classList.add("badge-numero");
            badge.textContent = num;
            containerNumeros.appendChild(badge);
        });

        modal.classList.add("activo");
        inputNombre.focus();
    });

    const cerrarModal = () => {
        modal.classList.remove("activo");
    };

    inputTelefono.addEventListener("input", (e) => {
        e.target.value = e.target.value.replace(/\D/g, "");
    });

    btnCancelar.addEventListener("click", cerrarModal);

    modal.addEventListener("click", (e) => {
        if (e.target === modal) {
            cerrarModal();
        }
    });

    modalExito.addEventListener("click", () => {
        modalExito.classList.remove("activo");
        if (modalExito.dataset.timerId) {
            clearTimeout(Number(modalExito.dataset.timerId));
            delete modalExito.dataset.timerId;
        }
    });

    // REGISTRAR DATOS (Con Token)
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

        btnGuardar.disabled = true;

        fetch(API_URL_REGISTRAR, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + localStorage.getItem("token_seguridad_rifa")
            },
            body: JSON.stringify(datosCompra)
        })
            .then(response => {
                if (response.status === 403) {
                    localStorage.removeItem("acceso_rifa_valido");
                    mostrarPantallaBloqueo();
                    throw new Error("Aplicación bloqueada en el servidor.");
                }
                if (!response.ok) {
                    throw new Error("Uno de los números seleccionados ya fue comprado.");
                }
                return response.json();
            })
            .then(data => {
                casillasSeleccionadas.forEach(div => {
                    div.classList.remove("seleccionado");
                    div.classList.add("ocupado");
                });
                cerrarModal();

                modalExito.classList.add("activo");
                const timerExito = setTimeout(() => {
                    modalExito.classList.remove("activo");
                }, 2500);
                modalExito.dataset.timerId = timerExito;

                const textoCodificado = encodeURIComponent(data.textoWhatsApp);
                const urlWhatsApp = `https://api.whatsapp.com/send?phone=57${data.telefono}&text=${textoCodificado}`;
                window.open(urlWhatsApp, '_blank');
            })
            .catch(error => {
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
            document.body.classList.add("modo-captura-activo");
            setTimeout(() => {
                const contenedorRifa = document.querySelector(".rifa-container");

                html2canvas(contenedorRifa, {
                    scale: 2,
                    backgroundColor: "#fff6ec",
                    useCORS: true
                }).then(canvas => {
                    const urlImagen = canvas.toDataURL("image/jpeg", 0.9);
                    const enlaceDescarga = document.createElement("a");
                    enlaceDescarga.download = "numeros-disponibles-goipro.jpg";
                    enlaceDescarga.href = urlImagen;
                    enlaceDescarga.click();
                    document.body.classList.remove("modo-captura-activo");
                }).catch(error => {
                    console.error("Error al generar el JPG:", error);
                    document.body.classList.remove("modo-captura-activo");
                });
            }, 100);
        });
    }

    // REVISIÓN AUTOMÁTICA EN TIEMPO REAL
    setInterval(() => {
        fetch(API_URL_OCUPADOS, {
            method: "GET",
            headers: {
                "Authorization": "Bearer " + localStorage.getItem("token_seguridad_rifa")
            }
        })
            .then(response => {
                if (response.status === 403) {
                    localStorage.removeItem("acceso_rifa_valido");
                    mostrarPantallaBloqueo();
                }
            })
            .catch(error => {
                console.error("Error en la validación en segundo plano:", error);
            });
    }, 60000);
}