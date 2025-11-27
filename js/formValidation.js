const form = document.getElementById("form-inscripcion");
const inputs = document.querySelectorAll("#form-inscripcion input");
const selects = document.querySelectorAll("#form-inscripcion select");

const expresiones = {
  nombre: /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ\s']{3,40}$/, // Nombre de 3-40 caracteres, sin signos especiales (a excepción algunos)
  dni: /^[0-9]{8}[A-Za-z]$/, // Expresión regular para DNI
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  telefono: /^[0-9]{9}$/, // Solo dígitos (9)
  direccion: /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ\s.]{3,60},?\s[0-9]{1,5}[A-Za-z0-9-]*$/,
  ciudad: /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ\s.-]{2,60}$/,
  cp: /^[0-9]{5}$/,
};

const campos = {
  // 1) Datos Personales
  nombre: false,
  apellidos: false,
  dni: false,
  fecha_nacimiento: false,
  sexo: true, // Select, no obligatorio
  estado_civil: true, // Select, no obligatorio
  // 2) Contacto y Dirección
  email: false,
  telefono: false,
  contacto_pref: true, // Input Radio, No obligatorio"""
  direccion: false,
  ciudad: false,
  cp: false,
  // 3) Datos Médicos y objetivos
};

// const control = input.closest(".control") || input.parentElement;

// SHOW ERROR
function showError(input, errorId, message) {
  // Señales para accesibilidad y CSS
  input.setAttribute("aria-invalid", "true"); // borde rojo
  input.removeAttribute("data-valid"); // si estaba marcado como válido, lo quitamos

  // Contenedor visual donde insertaremos el mensaje
  const control = input.closest(".control") || input.parentElement;

  // Crear o actualizar el <p class="error-msg" role="alert">
  let p = control.querySelector("#" + errorId);
  if (!p) {
    p = document.createElement("p");
    p.id = errorId;
    p.className = "error-msg";
    p.setAttribute("role", "alert");
    control.appendChild(p);

    // Vincular input ↔ mensaje (accesibilidad)
    const describedby = (input.getAttribute("aria-describedby") || "")
      .split(" ")
      .filter(Boolean);
    if (!describedby.includes(errorId)) {
      describedby.push(errorId);
      input.setAttribute("aria-describedby", describedby.join(" "));
    }
  }
  p.textContent = message;
}

// CLEAR ERROR
function clearError(input, errorId) {
  input.removeAttribute("aria-invalid");
  input.setAttribute("data-valid", "true");

  const control = input.closest(".control") || input.parentElement;
  const p = control.querySelector("#" + errorId);
  if (p) p.remove();

  // Sanea aria-describedby si ya no quedan mensajes asociados
  const rest = (input.getAttribute("aria-describedby") || "")
    .split(" ")
    .filter((id) => id && id !== errorId);
  if (rest.length) input.setAttribute("aria-describedby", rest.join(" "));
  else input.removeAttribute("aria-describedby");
}

// PASO 3 - Validacion de todos los inputs
const validarFormulario = (e) => {
  switch (e.target.name) {
    // 1) Datos Personales
    case "nombre":
      validarCampo(expresiones.nombre, e.target, "nombre");
      break;
    case "apellidos":
      validarCampo(expresiones.nombre, e.target, "apellidos");
      break;
    case "dni":
      validarCampo(expresiones.dni, e.target, "dni");
      break;
    case "fecha_nacimiento":
      validarFechaNacimiento(e.target, "fecha_nacimiento");
      break;
    case "sexo":
      validarSelect(e.target, "sexo", false);
      break;
    case "estado_civil":
      validarSelect(e.target, "estado_civil", false);
      break;
    // 2) Dirección y contacto
    case "email":
      validarCampo(expresiones.email, e.target, "email");
      break;
    case "telefono":
      validarCampo(expresiones.telefono, e.target, "telefono");
      break;
    case "contacto_pref": // Revisar que son "radio" x3
      validarCampo(expresiones.nombre, e.target, "contacto_pref");
      break;
    case "direccion":
      validarCampo(expresiones.direccion, e.target, "direccion");
      break;
    case "ciudad":
      validarCampo(expresiones.ciudad, e.target, "ciudad");
      break;
    case "cp":
      validarCampo(expresiones.cp, e.target, "cp");
      break;
    // 3) Datos Médicos
    case "altura":
      break;
    case "peso":
      break;
    case "condiciones": // Revisar que son checkbox x5
      break;
    case "dias": // Checkboxes x6
      break;
    case "referido":
      break;
    case "nif_factura":
      break;
    case "dir_factura":
      break;
    case "iban_ultimos":
      break;
    case "tos":
      break;
    case "rpgd":
      break;
    case "promo":
      break;
  }
};

// PASO 4: Validación de cada campo (inputs)
// nombre, apellidos, dni, email, telefono
const validarCampo = (expresion, input, campo) => {
  // Validación de contaact_pref
  if (input.type === "radio") {
    const valoresValidos = {
      contacto_pref: ["email", "tel", "whatsapp"],
    };

    // Comprobar valor dentro de opciones
    if (input.value && !valoresValidos[campo].includes(input.value)) {
      showError(input, `${campo}-error`, "Seleccione una valor válido.");
      campos[campo] = false;
      return;
    }

    if (input.value === "") {
      showError(input, `${campo}-error`, `Selecciona un valor.`);
      campos[campo] = false;
    } else {
      clearError(input, `${campo}-error`);
      campos[campo] = true;
    }
  } else if (expresion.test(input.value.trim())) {
    clearError(input, `${campo}-error`);
    campos[campo] = true;
  } else {
    showError(
      input,
      `${campo}-error`,
      `Verifique que "${campo}" tenga el formato correcto.`
    );
    campos[campo] = false;
  }
};

// fecha_nacimiento
const validarFechaNacimiento = (input, campo) => {
  const val = input.value; // "YYYY-MM--DD" o ""

  // Campo vacío - error
  if (!val) {
    showError(
      input,
      `${campo}-error`,
      "Por favor ingrese su fecha de nacimiento."
    );
    campos[campo] = false;
    return;
  }

  // Convertir de "YYYY-MM-DD" (String) a Date
  const fecha = new Date(val + "T00:00:00");
  if (isNaN(fecha.getTime())) {
    showError(input, `${campo}-error`, `La fecha ingresada no es válida.`);
    campos[campo] = false;
    return;
  }

  // Fechas futuras no válidas
  const hoy = new Date();
  const hoyDate = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
  if (fecha > hoyDate) {
    showError(
      input,
      `${campo}-error`,
      `La fecha no puede ser posterior a hoy.`
    );
    campos[campo] = false;
    return;
  }

  clearError(input, `${campo}-error`);
  campos[campo] = true;
};

// PASO 4: Validacion campos select (solo select, no todos son obligatorios)
// sexo, estado_civil,
const validarSelect = (select, campo, obligatorio) => {
  // Array de opciones (podemos meterlas manual, para que no se alteren desde el navegador)
  const valoresValidos = {
    sexo: ["f", "m", "x"],
    estado_civil: ["s", "c", "ph", "d", "v"],
  };

  // Comprobar valor dentro de opciones
  if (select.value && !valoresValidos[campo].includes(select.value)) {
    showError(select, `${campo}-error`, "Seleccione una valor válido.");
    campos[campo] = false;
    return;
  }

  if (obligatorio && select.value === "") {
    showError(select, `${campo}-error`, `Selecciona un valor.`);
    campos[campo] = false;
  } else {
    clearError(select, `${campo}-error`);
    campos[campo] = true;
  }
};

// PASO 4: Validación campos inputs type radio, no obligatorios
// contacto_pref

// PASO 2 - Accceder a los inputs (solo inputs) para darles event listeners
inputs.forEach((input) => {
  input.addEventListener("keyup", validarFormulario);
  input.addEventListener("blur", validarFormulario);
  input.addEventListener("change", validarFormulario);
});

// PASO 2 - Acceder a los select...
selects.forEach((select) => {
  select.addEventListener("change", validarFormulario);
});

// PASO 1 - Acceder al form
form.addEventListener("submit", (e) => {
  if (
    campos["nombre"] &&
    campos["apellidos"] &&
    campos["dni"] &&
    campos["fecha_nacimiento"] &&
    campos["sexo"] &&
    campos["estado_civil"] &&
    campos["email"] &&
    campos["telefono"] &&
    campos["contacto_pref"] &&
    campos["direccion"] &&
    campos["ciudad"] &&
    campos["cp"]
  ) {
    alert("Enviado!");
    form.submit();
    form.reset();
  } else {
    alert("Nope");
    e.preventDefault();
  }
});
