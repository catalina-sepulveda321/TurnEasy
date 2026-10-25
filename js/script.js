
/* ==========================================
   TURNEASY - SCRIPT
========================================== */


/* ==========================================
   FUNCIONES GENERALES
========================================== */

// Obtener el usuario que inició sesión
function obtenerUsuarioActual() {
    try {
        const sesion = JSON.parse(
            localStorage.getItem("sesionUsuario")
        );

        if (!sesion || !sesion.correo) {
            return null;
        }

        return sesion;

    } catch (error) {
        console.error("Error al consultar la sesión:", error);
        return null;
    }
}


// Obtener todas las citas guardadas
function obtenerCitasTurnEasy() {
    try {
        const guardadas = localStorage.getItem("citasTurnEasy");

        if (guardadas !== null) {
            const citas = JSON.parse(guardadas);
            return Array.isArray(citas) ? citas : [];
        }

        // Recuperar una cita antigua, si existe.
        // No se le asigna automáticamente un propietario.
        const citaAnterior = localStorage.getItem("citaTurnEasy");

        if (citaAnterior) {
            const cita = JSON.parse(citaAnterior);

            if (cita && cita.fecha && cita.hora) {
                return [cita];
            }
        }

        return [];

    } catch (error) {
        console.error("Error al leer las citas:", error);
        return [];
    }
}


// Guardar la lista completa de citas
function guardarCitasTurnEasy(citas) {
    localStorage.setItem(
        "citasTurnEasy",
        JSON.stringify(citas)
    );
}


// Comprobar si una cita pertenece al usuario actual
function perteneceAlUsuario(cita, usuario) {
    return Boolean(
        cita &&
        usuario &&
        cita.correoUsuario &&
        usuario.correo &&
        String(cita.correoUsuario).toLowerCase() ===
            String(usuario.correo).toLowerCase()
    );
}



/* ==========================================
   REGISTRO 
========================================== */

const formularioRegistro = document.getElementById("registro");

if (formularioRegistro) {

    formularioRegistro.addEventListener("submit", function(event) {
        event.preventDefault();

        const nombre = document.getElementById("nombre").value.trim();
        const apellido = document.getElementById("apellido").value.trim();
        const correo = document.getElementById("correo").value.trim();
        const documento = document.getElementById("documento").value.trim();
        const celular = document.getElementById("celular").value.trim();
        const password = document.getElementById("password").value;
        const confirmar = document.getElementById("confirmar").value;
        const terminos = document.getElementById("terminos").checked;

        if (!nombre || !apellido || !correo || !documento ||
            !celular || !password || !confirmar) {
            alert("Por favor, completa todos los campos.");
            return;
        }

        if (!terminos) {
            alert("Debes aceptar los términos y condiciones.");
            return;
        }

        if (password !== confirmar) {
            alert("Las contraseñas no coinciden.");
            return;
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) {
            alert("Ingresa un correo electrónico válido.");
            return;
        }

        try {
            // Recuperar las cuentas existentes
            let usuarios = JSON.parse(
                localStorage.getItem("usuariosTurnEasy") || "[]"
            );

            if (!Array.isArray(usuarios)) {
                usuarios = [];
            }

            // Recuperar también el usuario antiguo, si existe
            const usuarioAnterior = localStorage.getItem("usuarioTurnEasy");

            if (usuarioAnterior) {
                try {
                    const usuarioAntiguo = JSON.parse(usuarioAnterior);

                    if (
                        usuarioAntiguo &&
                        usuarioAntiguo.correo &&
                        !usuarios.some(u =>
                            String(u.correo).toLowerCase() ===
                            String(usuarioAntiguo.correo).toLowerCase()
                        )
                    ) {
                        usuarios.push(usuarioAntiguo);
                    }
                } catch (error) {
                    console.warn("No se pudo recuperar el usuario anterior.");
                }
            }

            // No permitir correos duplicados
            const correoExiste = usuarios.some(usuario =>
                String(usuario.correo || "").toLowerCase() ===
                correo.toLowerCase()
            );

            if (correoExiste) {
                alert("Ya existe una cuenta registrada con ese correo.");
                return;
            }

            // Crear una nueva cuenta sin borrar las anteriores
            const nuevoUsuario = {
                nombre,
                apellido,
                correo,
                documento,
                celular,
                password
            };

            usuarios.push(nuevoUsuario);

            localStorage.setItem(
                "usuariosTurnEasy",
                JSON.stringify(usuarios)
            );

            // Compatibilidad temporal con las funciones existentes
            localStorage.setItem(
                "usuarioTurnEasy",
                JSON.stringify(nuevoUsuario)
            );

            // El usuario deberá iniciar sesión con su cuenta
            localStorage.removeItem("sesionUsuario");
            localStorage.removeItem("sesionActiva");

            alert("¡Registro exitoso! Ahora puedes iniciar sesión.");
            window.location.href = "./index.html";

        } catch (error) {
            alert("No se pudo guardar el registro.");
            console.error(error);
        }
    });
}




/* ==========================================
   INICIO DE SESION 
========================================== */

const formularioLogin = document.getElementById("login");

if (formularioLogin) {

    formularioLogin.addEventListener("submit", function(event) {
        event.preventDefault();

        const correo = document.getElementById("correo").value.trim();
        const password = document.getElementById("password").value;

        try {
            // Cargar la lista de usuarios
            let usuarios = JSON.parse(
                localStorage.getItem("usuariosTurnEasy") || "[]"
            );

            if (!Array.isArray(usuarios)) {
                usuarios = [];
            }

            // Compatibilidad con el registro antiguo de un solo usuario
            const usuarioAnterior = localStorage.getItem("usuarioTurnEasy");

            if (usuarioAnterior) {
                try {
                    const usuarioAntiguo = JSON.parse(usuarioAnterior);

                    if (
                        usuarioAntiguo &&
                        usuarioAntiguo.correo &&
                        !usuarios.some(u =>
                            String(u.correo).toLowerCase() ===
                            String(usuarioAntiguo.correo).toLowerCase()
                        )
                    ) {
                        usuarios.push(usuarioAntiguo);
                    }
                } catch (error) {
                    console.warn("No se pudo recuperar el usuario anterior.");
                }
            }

            // Buscar la cuenta que coincide con las credenciales
            const usuarioEncontrado = usuarios.find(usuario =>
                String(usuario.correo || "").toLowerCase() ===
                    correo.toLowerCase() &&
                usuario.password === password
            );

            if (!usuarioEncontrado) {
                alert("El correo o la contraseña son incorrectos.");
                return;
            }

            // Guardar la lista, incluyendo las cuentas recuperadas
            localStorage.setItem(
                "usuariosTurnEasy",
                JSON.stringify(usuarios)
            );

            // Mantener compatibilidad con el resto del proyecto
            localStorage.setItem(
                "usuarioTurnEasy",
                JSON.stringify(usuarioEncontrado)
            );

            // Identificar al usuario que inició sesión
            localStorage.setItem(
                "sesionUsuario",
                JSON.stringify({
                    correo: usuarioEncontrado.correo
                })
            );

            localStorage.setItem("sesionActiva", "true");

            alert("¡Inicio de sesión exitoso!");

            window.location.href = "./home.html";

        } catch (error) {
            alert("No se pudo verificar la cuenta. Inténtalo nuevamente.");
            console.error(error);
        }
    });
}



/* ==========================================
   SELECCIONAR SERVICIO
========================================== */

function seleccionarServicio(servicio) {

    localStorage.setItem(
        "servicioSeleccionado",
        servicio
    );

    alert("Has seleccionado: " + servicio);

    window.location.href = "agendar.html";
}


/* ==========================================
   AGENDAR CITA - TURNEASY
========================================== */

const formularioCita =
    document.getElementById("formularioCita");

if (formularioCita) {

    const campoServicio =
        document.getElementById("servicio");

    const campoEstablecimiento =
        document.getElementById("establecimiento");

    const campoFecha =
        document.getElementById("fechaCita");

    const campoHora =
        document.getElementById("horaCita");


    // Recuperar el servicio seleccionado
    const servicioSeleccionado =
        localStorage.getItem("servicioSeleccionado") || "";

    if (campoServicio) {
        campoServicio.value = servicioSeleccionado;
    }
    
    
    // Recuperar el establecimiento seleccionado
    const establecimientoSeleccionado =
        localStorage.getItem("establecimientoSeleccionado") || "";

    if (campoEstablecimiento && establecimientoSeleccionado) {

        // Buscar el establecimiento entre las opciones del formulario
        const opcionEstablecimiento = Array.from(
            campoEstablecimiento.options
        ).find(opcion =>
            opcion.value === establecimientoSeleccionado ||
            opcion.textContent.trim() === establecimientoSeleccionado
        );

        if (opcionEstablecimiento) {
            campoEstablecimiento.value =
                opcionEstablecimiento.value;
        } else {
            console.warn(
                "El establecimiento seleccionado no existe " +
                "entre las opciones del formulario:",
                establecimientoSeleccionado
            );
        }
    }



    // Obtener la fecha local
    function obtenerFechaLocal() {
        const hoy = new Date();

        const anio = hoy.getFullYear();
        const mes = String(hoy.getMonth() + 1).padStart(2, "0");
        const dia = String(hoy.getDate()).padStart(2, "0");

        return `${anio}-${mes}-${dia}`;
    }


    if (campoFecha) {
        campoFecha.min = obtenerFechaLocal();
    }


    // Generar horarios cada 30 minutos
    function generarHorarios() {
        const horarios = [];

        for (
            let minutos = 8 * 60;
            minutos <= 19 * 60;
            minutos += 30
        ) {
            const horas = String(
                Math.floor(minutos / 60)
            ).padStart(2, "0");

            const minutosRestantes = String(
                minutos % 60
            ).padStart(2, "0");

            horarios.push(
                `${horas}:${minutosRestantes}`
            );
        }

        return horarios;
    }


    // Actualizar los horarios disponibles
    function actualizarHorarios() {

        if (
            !campoFecha ||
            !campoHora ||
            !campoEstablecimiento
        ) {
            return;
        }

        const fecha = campoFecha.value;
        const establecimiento = campoEstablecimiento.value;
        const horaAnterior = campoHora.value;

        const citas = obtenerCitasTurnEasy();


        // Un horario reservado por cualquier usuario
        // no debe ofrecerse nuevamente.
        const horariosOcupados = citas
            .filter(cita =>
                cita.fecha === fecha &&
                cita.establecimiento === establecimiento &&
                cita.estado !== "Cancelada"
            )
            .map(cita => cita.hora);


        campoHora.replaceChildren();

        const opcionInicial = document.createElement("option");
        opcionInicial.value = "";


        if (!fecha || !establecimiento) {
            opcionInicial.textContent =
                "Selecciona una fecha y un establecimiento";

            campoHora.appendChild(opcionInicial);
            return;
        }


        opcionInicial.textContent = "Selecciona una hora";
        campoHora.appendChild(opcionInicial);


        const horariosDisponibles = generarHorarios().filter(
            hora => !horariosOcupados.includes(hora)
        );


        horariosDisponibles.forEach(hora => {
            const opcion = document.createElement("option");

            opcion.value = hora;
            opcion.textContent = hora;

            campoHora.appendChild(opcion);
        });


        if (horariosDisponibles.length === 0) {
            opcionInicial.textContent =
                "No hay horarios disponibles";
        }


        if (horariosDisponibles.includes(horaAnterior)) {
            campoHora.value = horaAnterior;
        }
    }


    // Actualizar cuando cambia la fecha
    if (campoFecha) {
        campoFecha.addEventListener(
            "change",
            actualizarHorarios
        );
    }


    // Actualizar cuando cambia el establecimiento
    if (campoEstablecimiento) {
        campoEstablecimiento.addEventListener(
            "change",
            actualizarHorarios
        );
    }


    // Mostrar horarios iniciales
    actualizarHorarios();


    // Procesar la reserva
    formularioCita.addEventListener("submit", function(event) {

        event.preventDefault();

        const usuarioActual = obtenerUsuarioActual();


        // Verificar que exista una sesión
        if (!usuarioActual) {
            alert(
                "Debes iniciar sesión antes de reservar una cita."
            );

            window.location.href = "./index.html";
            return;
        }


        const establecimiento =
            campoEstablecimiento?.value || "";

        const fecha = campoFecha?.value || "";
        const hora = campoHora?.value || "";


        if (!establecimiento || !fecha || !hora) {
            alert(
                "Por favor, completa todos los datos de la cita."
            );
            return;
        }


        // Validar fecha
        if (fecha < obtenerFechaLocal()) {
            alert("No puedes reservar una fecha pasada.");

            if (campoFecha) {
                campoFecha.min = obtenerFechaLocal();
            }

            return;
        }


        // Validar horario
        if (!generarHorarios().includes(hora)) {
            alert("Selecciona un horario válido.");
            actualizarHorarios();
            return;
        }


        // Consultar todas las citas antes de guardar
        const citas = obtenerCitasTurnEasy();


        // Evitar duplicar reservas del mismo horario
        const horarioOcupado = citas.some(cita =>
            cita.fecha === fecha &&
            cita.hora === hora &&
            cita.establecimiento === establecimiento &&
            cita.estado !== "Cancelada"
        );


        if (horarioOcupado) {
            alert(
                "Ese horario ya está reservado. Selecciona otro."
            );

            actualizarHorarios();
            return;
        }


        // Crear una nueva cita asociada al usuario
        const nuevaCita = {
            id:
                Date.now().toString() + "-" +
                Math.random().toString(36).slice(2, 8),

            correoUsuario: usuarioActual.correo,

            servicio:
                campoServicio?.value || servicioSeleccionado,

            establecimiento: establecimiento,
            fecha: fecha,
            hora: hora,
            estado: "Confirmada"
        };


        // Agregar la nueva cita sin reemplazar las anteriores
        citas.push(nuevaCita);


        try {
            guardarCitasTurnEasy(citas);

        } catch (error) {
            alert(
                "No se pudo guardar la cita. Inténtalo nuevamente."
            );

            console.error(
                "Error al guardar la cita:",
                error
            );

            return;
        }


        alert("¡Tu cita fue reservada correctamente!");

        window.location.href = "./home.html";

    });

}


/* ==========================================
   MOSTRAR MIS TURNOS
========================================== */

const tablaTurnos =
    document.getElementById("tablaTurnos");

if (tablaTurnos) {
    mostrarMisTurnos();
}


function mostrarMisTurnos() {

    const tabla = document.getElementById("tablaTurnos");

    if (!tabla) {
        return;
    }


    const usuarioActual = obtenerUsuarioActual();


    if (!usuarioActual) {
        tabla.innerHTML = `
            <tr>
                <td colspan="5">
                    Inicia sesión para consultar tus turnos.
                </td>
            </tr>
        `;
        return;
    }


    const citas = obtenerCitasTurnEasy();


    // Conservar el índice de cada cita en la lista original
    const misCitas = citas
        .map((cita, indice) => ({
            cita: cita,
            indice: indice
        }))
        .filter(item =>
            perteneceAlUsuario(item.cita, usuarioActual)
        );


    if (misCitas.length === 0) {
        tabla.innerHTML = `
            <tr>
                <td colspan="5">
                    Aún no has agendado ninguna cita.
                </td>
            </tr>
        `;
        return;
    }


    tabla.innerHTML = misCitas.map(item => {

        const cita = item.cita;
        const indice = item.indice;

        return `
            <tr>
                <td>${cita.servicio || "No especificado"}</td>

                <td>${cita.fecha || ""}</td>

                <td>${cita.hora || ""}</td>

                <td>
                    <strong>${cita.estado || "Confirmada"}</strong>
                </td>

                <td>
                    <button
                        type="button"
                        onclick="verCita(${indice})">
                        Ver
                    </button>

                    <button
                        type="button"
                        onclick="cancelarCita(${indice})">
                        Cancelar
                    </button>
                </td>
            </tr>
        `;

    }).join("");
}


/* ==========================================
   VER CITA
========================================== */

function verCita(indice) {

    const usuarioActual = obtenerUsuarioActual();
    const citas = obtenerCitasTurnEasy();
    const cita = citas[indice];


    if (!perteneceAlUsuario(cita, usuarioActual)) {
        alert("No se encontró tu cita.");
        return;
    }


    alert(
        "DETALLES DE TU CITA\n\n" +
        "Servicio: " + cita.servicio + "\n" +
        "Establecimiento: " + cita.establecimiento + "\n" +
        "Fecha: " + cita.fecha + "\n" +
        "Hora: " + cita.hora + "\n" +
        "Estado: " + cita.estado
    );
}


/* ==========================================
   CANCELAR CITA
========================================== */

function cancelarCita(indice) {

    const usuarioActual = obtenerUsuarioActual();
    const citas = obtenerCitasTurnEasy();
    const cita = citas[indice];


    if (!perteneceAlUsuario(cita, usuarioActual)) {
        alert("No se encontró tu cita.");
        return;
    }


    const confirmar = confirm(
        "¿Estás segura de que deseas cancelar esta cita?"
    );

    if (!confirmar) {
        return;
    }


    // Eliminar únicamente la cita seleccionada
    citas.splice(indice, 1);


    try {
        guardarCitasTurnEasy(citas);

    } catch (error) {
        alert("No se pudo cancelar la cita.");
        console.error(error);
        return;
    }


    alert("Tu cita ha sido cancelada correctamente.");

    mostrarMisTurnos();
}


/* ==========================================
   MOSTRAR PERFIL
========================================== */

const perfilNombre =
    document.getElementById("perfilNombre");

if (perfilNombre) {

    const usuarioGuardado =
        localStorage.getItem("usuarioTurnEasy");

    if (usuarioGuardado) {

        try {
            const usuario = JSON.parse(usuarioGuardado);

            perfilNombre.textContent =
                `${usuario.nombre || ""} ${usuario.apellido || ""}`.trim();

            const perfilNombreDetalle = document.getElementById("perfilNombreDetalle");

            if (perfilNombreDetalle) {

                perfilNombreDetalle.textContent = `${usuario.nombre || ""} ${usuario.apellido || ""}`.trim();
}    

            const perfilCorreo =
                document.getElementById("perfilCorreo");

            const perfilDocumento =
                document.getElementById("perfilDocumento");

            const perfilCelular =
                document.getElementById("perfilCelular");


            if (perfilCorreo) {
                perfilCorreo.textContent = usuario.correo || "";
            }

            if (perfilDocumento) {
                perfilDocumento.textContent = usuario.documento || "";
            }

            if (perfilCelular) {
                perfilCelular.textContent = usuario.celular || "";
            }

        } catch (error) {
            console.error("Error al mostrar el perfil:", error);
        }
    }
}


/* ==========================================
   CONFIGURACIÓN
========================================== */

const formularioConfiguracion =
    document.getElementById("formularioConfiguracion");

if (formularioConfiguracion) {

    const usuarioGuardado =
        localStorage.getItem("usuarioTurnEasy");


    if (usuarioGuardado) {

        try {
            const usuario = JSON.parse(usuarioGuardado);

            document.getElementById("configNombre").value =
                usuario.nombre || "";

            document.getElementById("configApellido").value =
                usuario.apellido || "";

            document.getElementById("configCorreo").value =
                usuario.correo || "";

            document.getElementById("configCelular").value =
                usuario.celular || "";

        } catch (error) {
            console.error(
                "Error al cargar la configuración:",
                error
            );
        }
    }


    formularioConfiguracion.addEventListener(
        "submit",
        function(event) {

            event.preventDefault();


            let usuarioActual;

            try {
                usuarioActual = JSON.parse(
                    localStorage.getItem("usuarioTurnEasy")
                );
            } catch (error) {
                usuarioActual = null;
            }


            if (!usuarioActual) {
                alert("No se encontró el usuario registrado.");
                return;
            }


            const nombre =
                document.getElementById("configNombre")
                    .value.trim();

            const apellido =
                document.getElementById("configApellido")
                    .value.trim();

            const correo =
                document.getElementById("configCorreo")
                    .value.trim();

            const celular =
                document.getElementById("configCelular")
                    .value.trim();


            if (!nombre || !apellido || !correo || !celular) {
                alert("Completa todos los campos de configuración.");
                return;
            }


            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) {
                alert("Ingresa un correo electrónico válido.");
                return;
            }


            const correoAnterior = usuarioActual.correo;


            // Conservar documento, celular y contraseña
            const usuarioActualizado = {
                ...usuarioActual,
                nombre: nombre,
                apellido: apellido,
                correo: correo,
                celular: celular
            };


            try {

                // Si cambia el correo, actualizar también las citas
                // asociadas al correo anterior.
                const citas = obtenerCitasTurnEasy();

                const correoCambio =
                    String(correoAnterior).toLowerCase() !==
                    correo.toLowerCase();

                if (correoCambio) {

                    const citasActualizadas = citas.map(cita => {

                        if (
                            cita.correoUsuario &&
                            String(cita.correoUsuario).toLowerCase() ===
                                String(correoAnterior).toLowerCase()
                        ) {
                            return {
                                ...cita,
                                correoUsuario: correo
                            };
                        }

                        return cita;
                    });

                    guardarCitasTurnEasy(citasActualizadas);
                }


                localStorage.setItem(
                    "usuarioTurnEasy",
                    JSON.stringify(usuarioActualizado)
                );


                // Mantener sincronizada la sesión actual
                const sesion = obtenerUsuarioActual();

                if (
                    sesion &&
                    String(sesion.correo).toLowerCase() ===
                        String(correoAnterior).toLowerCase()
                ) {
                    localStorage.setItem(
                        "sesionUsuario",
                        JSON.stringify({
                            correo: correo
                        })
                    );
                }

            } catch (error) {
                alert("No se pudieron guardar los cambios.");
                console.error(error);
                return;
            }


            alert(
                "¡Tus datos fueron actualizados correctamente!"
            );

            window.location.reload();

        }
    );

}


/* ==========================================
   CERRAR SESIÓN
========================================== */

function cerrarSesion() {

    const confirmar = confirm(
        "¿Estás segura de que deseas cerrar sesión?"
    );

    if (!confirmar) {
        return;
    }


    // Eliminar los datos de sesión, no las citas
    localStorage.removeItem("sesionUsuario");
    localStorage.removeItem("sesionActiva");


    window.location.href = "./index.html";
}


/* ==========================================
   MOSTRAR / OCULTAR CONTRASEÑA
========================================== */

const campoPassword =
    document.getElementById("password");

const mostrarPassword =
    document.getElementById("mostrarPassword");

if (campoPassword && mostrarPassword) {

    mostrarPassword.addEventListener("change", function() {

        campoPassword.type =
            this.checked ? "text" : "password";

    });

}


/* ==========================================
   VALIDAR FECHA MÍNIMA
========================================== */

const fechaCita =
    document.getElementById("fechaCita");

if (fechaCita) {

    const hoy = new Date();

    const anio = hoy.getFullYear();

    const mes = String(
        hoy.getMonth() + 1
    ).padStart(2, "0");

    const dia = String(
        hoy.getDate()
    ).padStart(2, "0");


    fechaCita.min = `${anio}-${mes}-${dia}`;
}

/* ==========================================
   BIENVENIDA PERSONALIZADA
========================================== */

const nombreUsuario = document.getElementById("nombreUsuario");

if (nombreUsuario) {
    const usuarioGuardado = localStorage.getItem("usuarioTurnEasy");
    const sesionActiva = localStorage.getItem("sesionUsuario");

    if (usuarioGuardado && sesionActiva) {
        try {
            const usuario = JSON.parse(usuarioGuardado);

            nombreUsuario.textContent =
                `¡Bienvenido, ${usuario.nombre}!`;

        } catch (error) {
            console.error("Error al cargar el nombre:", error);
            nombreUsuario.textContent = "Bienvenido";
        }
    } else {
        nombreUsuario.textContent = "Bienvenido";
    }
}



/* ==========================================
   SELECCIONAR ESTABLECIMIENTO
========================================== */

function seleccionarEstablecimiento(nombre, categoria) {

    // Relacionar cada establecimiento del catálogo
    // con uno de los establecimientos del formulario.
    const equivalencias = {
        "Barbería El Estilo": "TurnEasy Centro",
        "Barbería Central": "TurnEasy Centro",
        "Salón Bella Imagen": "Belleza y Estilo",
        "Studio de Uñas": "Belleza y Estilo",
        "Spa Bienestar": "Zona Premium",
        "Sonrisa Saludable": "Zona Premium"
    };

    const establecimientoFormulario =
        equivalencias[nombre] || nombre;

    // Guardar el establecimiento correspondiente
    localStorage.setItem(
        "establecimientoSeleccionado",
        establecimientoFormulario
    );

    // Guardar la categoría como servicio inicial
    seleccionarServicio(categoria);
}


