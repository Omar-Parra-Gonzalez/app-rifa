document.addEventListener("DOMContentLoaded", () => {

    // FUNCIÓN PARA BLOQUEAR EL BOTÓN EN LOCALSTORAGE
    const bloquearRecordatorioPorUnaHora = (telefono) => {
        const tiempoDesbloqueo = Date.now() + (60 * 60 * 1000); // Hora actual + 1 hora 
        localStorage.setItem(`bloqueo_recordatorio_${telefono}`, tiempoDesbloqueo);
    };

    // FUNCIÓN PARA VERIFICAR EL ESTADO DEL BOTÓN
    const verificarEstadoRecordatorio = (telefono) => {
        const tiempoDesbloqueo = localStorage.getItem(`bloqueo_recordatorio_${telefono}`);
        if (!tiempoDesbloqueo) return true; // Si no hay registro, se puede enviar
        if (Date.now() > parseInt(tiempoDesbloqueo)) {
            // Si ya pasó la hora, borramos el registro y permitimos enviar
            localStorage.removeItem(`bloqueo_recordatorio_${telefono}`);
            return true;
        }
        return false; // Sigue bloqueado
    };
    const tbody = document.getElementById("usuarios-body");

    // Elementos del Modal
    const modalVer = document.getElementById("modal-ver-numeros");
    const modalTitulo = document.getElementById("modal-titulo-usuario");
    const containerNumeros = document.getElementById("modal-ver-numeros-container");
    const selectPago = document.getElementById("modal-ver-pago");
    const btnCerrarVer = document.getElementById("btn-modal-ver-cerrar");
    const btnGuardarVer = document.getElementById("btn-modal-ver-guardar");
    const btnRecordatorio = document.getElementById("btn-recordatorio");
    const inputVerAlias = document.getElementById("modal-ver-alias");

    let usuariosRegistrados = [];
    let usuarioSeleccionadoIndex = null;

    // RENDERIZAR TABLA
    const renderizarTabla = () => {
        tbody.innerHTML = "";
        if (usuariosRegistrados.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="3" class="text-center text-muted">No hay usuarios registrados todavía.</td>
                </tr>
            `;
            return;
        }

        usuariosRegistrados.forEach((usuario, index) => {
            const fila = document.createElement("tr");
            const pagoEstado = (usuario.pago || "debe").toLowerCase();
            const btnClase =
                pagoEstado === "pagado" || pagoEstado === "pago"
                    ? "btn-success"
                    : "btn-danger";
            fila.innerHTML = `
                <td>${usuario.nombre}</td>
                <td>${usuario.telefono}</td>
                <td>
                    <button
                        class="btn ${btnClase} btn-sm w-100 fw-bold ver-numeros-btn"
                        data-index="${index}">
                        Ver
                    </button>
                </td>
            `;
            tbody.appendChild(fila);
        });
    };

    // CARGAR PARTICIPANTES DESDE MYSQL
    const cargarParticipantes = () => {
        fetch("http://localhost:8080/api/rifas/participantes")
            .then(response => {
                if (!response.ok) {
                    throw new Error("No se pudieron cargar los participantes.");
                }
                return response.json();
            })
            .then(data => {
                usuariosRegistrados = data;
                renderizarTabla();
            })
            .catch(error => {
                console.error(error);
                tbody.innerHTML = `
                <tr>
                    <td colspan="3" class="text-center text-danger">Error cargando participantes.</td>
                </tr>
            `;
            });
    };
    cargarParticipantes();

    // ABRIR MODAL
    tbody.addEventListener("click", (e) => {
        const botonVer = e.target.closest(".ver-numeros-btn");

        if (!botonVer) return;
        const index = botonVer.dataset.index;
        const usuario = usuariosRegistrados[index];

        if (!usuario) return;
        usuarioSeleccionadoIndex = index;
        modalTitulo.textContent = `Boletos de ${usuario.nombre}`;

        const elementoAlias = document.getElementById("modal-alias-usuario");
        if (elementoAlias) {
            elementoAlias.textContent = usuario.alias ? `(Alias: ${usuario.alias})` : "";
        }
        if (inputVerAlias) {
            inputVerAlias.value = usuario.alias || "Ninguno";
        }

        containerNumeros.innerHTML = "";
        usuario.numeros.forEach(numero => {
            const badge = document.createElement("span");
            badge.classList.add("badge-numero");
            badge.textContent = numero;
            badge.style.cursor = "pointer";
            badge.title = "Descargar boleta";
            badge.addEventListener("click", () => {
                window.open(`http://localhost:8080/api/boletas/${numero}`, "_blank");
            });
            containerNumeros.appendChild(badge);
        });

        selectPago.value = usuario.pago || "debe";

        // Ocultar o mostrar el botón según el estado de pago del usuario
        const estadoPago = (usuario.pago || "debe").toLowerCase();
        if (estadoPago === "pagado") {
            btnRecordatorio.style.display = "none";
            btnGuardarVer.style.display = "none";
            selectPago.disabled = true;
        } else {
            btnRecordatorio.style.display = "block";
            btnGuardarVer.style.display = "block";
            selectPago.disabled = false;

            if (verificarEstadoRecordatorio(usuario.telefono)) {
                // ESTADO NORMAL: Habilitado y Amarillo
                btnRecordatorio.disabled = false;
                btnRecordatorio.style.backgroundColor = "#ffc107";
                btnRecordatorio.style.color = "#000";
                btnRecordatorio.textContent = "Recordatorio";
            } else {
                // ESTADO BLOQUEADO: Gris y deshabilitado
                btnRecordatorio.disabled = true;
                btnRecordatorio.style.backgroundColor = "#6c757d"; // Gris de espera
                btnRecordatorio.style.color = "#fff";
                btnRecordatorio.textContent = "Mensaje enviado (Espera 1h)";
            }
        }
        modalVer.style.display = "flex";
        setTimeout(() => {
            modalVer.classList.add("activo");
        }, 10);
    });

    // CERRAR MODAL
    const cerrarModalVer = () => {
        modalVer.classList.remove("activo");
        setTimeout(() => {
            modalVer.style.display = "none";
            usuarioSeleccionadoIndex = null;
        }, 300);
    };

    btnCerrarVer.addEventListener("click", cerrarModalVer);
    modalVer.addEventListener("click", (e) => {
        if (e.target === modalVer) {
            cerrarModalVer();
        }
    });

    // GUARDAR CAMBIOS DE PAGO
    btnGuardarVer.addEventListener("click", () => {

        if (usuarioSeleccionadoIndex === null) return;
        const usuario = usuariosRegistrados[usuarioSeleccionadoIndex];
        const estadoAnterior = (usuario.pago || "debe").toLowerCase();
        const nuevoEstadoPago = selectPago.value.toLowerCase();
        usuario.pago = nuevoEstadoPago;
        renderizarTabla();

        // Cambio DEBE -> PAGADO
        if (
            estadoAnterior === "debe" &&
            (nuevoEstadoPago === "pagado" || nuevoEstadoPago === "pago")
        ) {
            fetch(`http://localhost:8080/api/rifas/actualizar-pago/${usuario.telefono}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                }
            }
            )
                .then(response => {
                    if (!response.ok) {
                        throw new Error("No se pudo actualizar el estado.");
                    }
                    return response.json();
                })
                .then(data => {
                    console.log(data.textoWhatsApp);
                    const textoCodificado = encodeURIComponent(data.textoWhatsApp);
                    const urlWhatsApp = `https://api.whatsapp.com/send?phone=57${data.telefono}&text=${textoCodificado}`;
                    console.log(urlWhatsApp);
                    window.open(urlWhatsApp, "_blank");
                    cargarParticipantes();
                    cerrarModalVer();
                })
                .catch(error => {
                    console.error(error);
                    alert("Error actualizando el estado de pago.");
                });
        } else {
            cerrarModalVer();
        }
    });

    // ENVIAR RECORDATORIO
    btnRecordatorio.addEventListener("click", () => {
        if (usuarioSeleccionadoIndex === null) return;

        const usuario = usuariosRegistrados[usuarioSeleccionadoIndex];
        fetch(`http://localhost:8080/api/rifas/recordatorio/${usuario.telefono}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error("No se pudo generar el recordatorio.");
                }
                return response.json();
            })
            .then(data => {
                const textoCodificado = encodeURIComponent(data.textoWhatsApp);
                const urlWhatsApp = `https://api.whatsapp.com/send?phone=57${data.telefono}&text=${textoCodificado}`;
                window.open(urlWhatsApp, "_blank");
                bloquearRecordatorioPorUnaHora(usuario.telefono);
                btnRecordatorio.disabled = true;
                btnRecordatorio.style.backgroundColor = "#6c757d";
                btnRecordatorio.style.color = "#fff";
                btnRecordatorio.textContent = "Mensaje enviado (Espera 1h)";
            })
            .catch(error => {
                console.error(error);
                alert("Error enviando el recordatorio.");
            });
    });
});