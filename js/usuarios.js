document.addEventListener("DOMContentLoaded", () => {

    const tbody = document.getElementById("usuarios-body");
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

    const renderizarTabla = () => {
        tbody.innerHTML = "";
        if (usuariosRegistrados.length === 0) {
            tbody.innerHTML = `<tr><td colspan="3" class="text-center text-muted">No hay usuarios registrados todavía.</td></tr>`;
            return;
        }

        usuariosRegistrados.forEach((usuario, index) => {
            const fila = document.createElement("tr");
            const pagoEstado = (usuario.pago || "debe").toLowerCase();
            const btnClase = (pagoEstado === "pagado" || pagoEstado === "pago") ? "btn-success" : "btn-danger";

            fila.innerHTML = `
                <td>${usuario.nombre}</td>
                <td>${usuario.telefono}</td>
                <td>
                    <button class="btn ${btnClase} btn-sm w-100 fw-bold ver-numeros-btn" data-index="${index}">
                        Ver
                    </button>
                </td>
            `;
            tbody.appendChild(fila);
        });
    };

    // Carga de participantes apuntando a Localhost con Token de Seguridad
    const cargarParticipantes = () => {
        fetch("http://localhost:8080/api/rifas/participantes", {
            method: "GET",
            headers: {
                "Authorization": "Bearer " + localStorage.getItem("token_seguridad_rifa")
            }
        })
            .then(response => {
                if (!response.ok) throw new Error("No se pudieron cargar los participantes.");
                return response.json();
            })
            .then(data => {
                usuariosRegistrados = data;
                renderizarTabla();
            })
            .catch(error => {
                console.error(error);
                tbody.innerHTML = `<tr><td colspan="3" class="text-center text-danger">Error cargando participantes.</td></tr>`;
            });
    };

    cargarParticipantes();

    tbody.addEventListener("click", (e) => {
        const botonVer = e.target.closest(".ver-numeros-btn");
        if (!botonVer) return;

        const index = botonVer.dataset.index;
        const usuario = usuariosRegistrados[index];
        if (!usuario) return;

        usuarioSeleccionadoIndex = index;
        modalTitulo.textContent = `Boletos de ${usuario.nombre}`;

        if (inputVerAlias) {
            inputVerAlias.value = usuario.alias || "Ninguno";
        }

        containerNumeros.innerHTML = "";
        usuario.numeros.forEach(numero => {
            const badge = document.createElement("span");
            badge.classList.add("badge-numero");
            badge.textContent = numero;
            badge.style.cursor = "pointer";
            badge.addEventListener("click", () => {
                window.open(`http://localhost:8080/api/boletas/${numero}`, "_blank");
            });
            containerNumeros.appendChild(badge);
        });

        const pagoEstado = (usuario.pago || "debe").toLowerCase();
        selectPago.value = pagoEstado;

        // 🟢 Si el cliente ya pagó, ocultamos botones de acción y bloqueamos el select
        if (pagoEstado === "pagado" || pagoEstado === "pago") {
            if (btnGuardarVer) btnGuardarVer.style.display = "none";
            if (btnRecordatorio) btnRecordatorio.style.display = "none";
            if (selectPago) selectPago.disabled = true;
        } else {
            // 🔴 Si debe, nos aseguramos de que todo esté visible y editable de nuevo
            if (btnGuardarVer) btnGuardarVer.style.display = "block";
            if (btnRecordatorio) btnRecordatorio.style.display = "block";
            if (selectPago) selectPago.disabled = false;

            // 🕒 Control del temporizador de 1 hora para el recordatorio
            if (btnRecordatorio) {
                const ultimoEnvio = localStorage.getItem(`recordatorio_${usuario.telefono}`);
                const ahora = Date.now();
                const unaHora = 60 * 60 * 1000; // 3.600.000 milisegundos

                if (ultimoEnvio && (ahora - ultimoEnvio < unaHora)) {
                    // Si no ha pasado la hora, calculamos cuántos minutos quedan para mostrar en el botón
                    const minutosRestantes = Math.ceil((unaHora - (ahora - ultimoEnvio)) / (60 * 1000));
                    btnRecordatorio.disabled = true;
                    btnRecordatorio.textContent = `Esperar ${minutosRestantes} min`;
                } else {
                    // Si ya pasó el tiempo o es primera vez, se habilita con su texto original
                    btnRecordatorio.disabled = false;
                    btnRecordatorio.textContent = "Enviar Recordatorio";
                }
            }
        }

        modalVer.style.display = "flex";
        setTimeout(() => {
            modalVer.classList.add("activo");
        }, 10);
    });

    const cerrarModalVer = () => {
        modalVer.classList.remove("activo");
        setTimeout(() => {
            modalVer.style.display = "none";
            usuarioSeleccionadoIndex = null;
        }, 300);
    };

    btnCerrarVer.addEventListener("click", cerrarModalVer);

    // Actualización de estado de pago en Localhost con Token de Seguridad
    btnGuardarVer.addEventListener("click", () => {
        if (usuarioSeleccionadoIndex === null) return;

        const usuario = usuariosRegistrados[usuarioSeleccionadoIndex];

        fetch(`http://localhost:8080/api/rifas/actualizar-pago/${usuario.telefono}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + localStorage.getItem("token_seguridad_rifa")
            }
        })
            .then(response => {
                if (!response.ok) throw new Error("No se pudo actualizar el estado de pago.");
                return response.json();
            })
            .then(data => {
                const textoCodificado = encodeURIComponent(data.textoWhatsApp);
                const urlWhatsApp = `https://api.whatsapp.com/send?phone=57${data.telefono}&text=${textoCodificado}`;
                window.open(urlWhatsApp, "_blank");
                cargarParticipantes();
                cerrarModalVer();
            })
            .catch(error => {
                console.error(error);
                alert("Error actualizando el pago.");
            });
    });

    // Envío de Recordatorio desde Localhost con Token de Seguridad
    if (btnRecordatorio) {
        btnRecordatorio.addEventListener("click", () => {
            if (usuarioSeleccionadoIndex === null) return;
            const usuario = usuariosRegistrados[usuarioSeleccionadoIndex];

            fetch(`http://localhost:8080/api/rifas/recordatorio/${usuario.telefono}`, {
                method: "GET",
                headers: {
                    "Authorization": "Bearer " + localStorage.getItem("token_seguridad_rifa")
                }
            })
                .then(response => {
                    if (!response.ok) throw new Error("No se pudo generar el recordatorio.");
                    return response.json();
                })
                .then(data => {
                    // 🕒 Guardamos el momento exacto en el que se procesó con éxito
                    localStorage.setItem(`recordatorio_${usuario.telefono}`, Date.now());

                    // Deshabilitamos el botón inmediatamente
                    btnRecordatorio.disabled = true;
                    btnRecordatorio.textContent = "Esperar 60 min";

                    const textoCodificado = encodeURIComponent(data.textoWhatsApp);
                    const urlWhatsApp = `https://api.whatsapp.com/send?phone=57${data.telefono}&text=${textoCodificado}`;
                    window.open(urlWhatsApp, "_blank");
                })
                .catch(error => {
                    console.error(error);
                    alert("Error al enviar el recordatorio.");
                });
        });
    }
});