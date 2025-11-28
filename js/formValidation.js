const form = document.getElementById("form-inscripcion");
const inputs = document.querySelectorAll("#form-inscripcion input");
const selects = document.querySelectorAll("#form-inscripcion select");
const textarea = document.querySelector("#form-inscripcion textarea");

const expresiones = {
  sin_expresion: "",
  nombre: /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ\s']{3,40}$/, // Nombre de 3-40 caracteres, sin signos especiales (a excepción algunos)
  dni: /^[0-9]{8}[A-Za-z]$/, // Expresión regular para DNI
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  telefono: /^[0-9]{9}$/, // Solo dígitos (9)
  direccion: /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ\s.]{3,60},?\s[0-9]{1,5}[A-Za-z0-9-]*$/,
  ciudad: /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ\s.-]{2,60}$/,
  cp: /^[0-9]{5}$/,
  altura: /^\d+$/, // Sólo dígitos
  peso: /^[0-9]{1,3}(\.[0-9]{1,2})?$/, // Dígitos, punto
  nif_factura: /^[A-Za-z]\d{7}[A-Za-z]$/,
  iban_ultimos: /^\d{4}$/,
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
  altura: false,
  peso: false,
  nivel: true, // Select, No obligatorio
  objetivos: true, // Máximo 3 palabras o nada
  condiciones: true, // Checkbox
  // 4) Plan y horarios
  plan: false, // Select, Obligatorio
  dias: true, // Checkbox
  hora: false,
  clases: false,
  referido: true, // No obligatorio
  // 5) Facturacion
  nif_factura: true, // No Obligatorio
  dir_factura: true,
  iban_ultimos: false,
  // 6) Consentimientos
  tos: false,
  rgpd: false,
  promo: true,
};

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
      validarCampo(expresiones.nombre, e.target, "nombre", true);
      break;
    case "apellidos":
      validarCampo(expresiones.nombre, e.target, "apellidos", true);
      break;
    case "dni":
      validarCampo(expresiones.dni, e.target, "dni", true);
      break;
    case "fecha_nacimiento":
      validarFechaNacimiento(e.target, "fecha_nacimiento", true);
      break;
    case "sexo":
      validarSelect(e.target, "sexo", false);
      break;
    case "estado_civil":
      validarSelect(e.target, "estado_civil", false);
      break;
    // 2) Dirección y contacto
    case "email":
      validarCampo(expresiones.email, e.target, "email", true);
      break;
    case "telefono":
      validarCampo(expresiones.telefono, e.target, "telefono", true);
      break;
    case "contacto_pref": // Revisar que son "radio" x3
      validarCampo(expresiones.nombre, e.target, "contacto_pref");
      break;
    case "direccion":
      validarCampo(expresiones.direccion, e.target, "direccion", true);
      break;
    case "ciudad":
      validarCampo(expresiones.ciudad, e.target, "ciudad", true);
      break;
    case "cp":
      validarCampo(expresiones.cp, e.target, "cp", true);
      break;
    // 3) Datos Médicos
    case "altura":
      validarCampo(expresiones.altura, e.target, "altura", true);
      break;
    case "peso":
      validarCampo(expresiones.peso, e.target, "peso", true);
      break;
    case "nivel":
      validarSelect(e.target, "nivel", false);
      break;
    case "objetivos":
      validarTextarea(e.target, "objetivos", false);
      break;
    case "condiciones[]": // Revisar que son checkbox x5
      validarGrupoCheckbox("condiciones", false);
      break;
    // 4) Plan y horarios
    case "plan":
      validarSelect(e.target, "plan", true);
      break;
    case "dias[]": // Checkboxes x6
      validarGrupoCheckbox("dias", false);
      break;
    case "hora":
      validarSelect(e.target, "hora", false);
      break;
    case "clases":
      validarSelect(e.target, "clases", false);
      break;
    case "referido":
      validarCampo(expresiones.nombre, e.target, "referido");
      break;
    // 5) Facturacion
    case "nif_factura":
      validarCampo(expresiones.nif_factura, e.target, "nif_facturacion");
      break;
    case "dir_factura":
      validarCampo(expresiones.direccion, e.target, "dir_factura");
      break;
    case "iban_ultimos":
      validarCampo(expresiones.iban_ultimos, e.target, "iban_ultimos", true);
      break;
    // 6) Consentimientos
    case "tos":
      validarCheckbox(e.target, "tos", true);
      break;
    case "rgpd":
      validarCheckbox(e.target, "rgpd", true);
      break;
    case "promo":
      validarCheckbox(e.target, "promo", false);
      break;
  }
};

// PASO 4: Validación de cada campo (inputs)
// nombre, apellidos, dni, email, telefono
const validarCampo = (expresion, input, campo, obligatorio = false) => {
  // Validación de contacto_pref
  if (input.type === "radio") {
    const valoresValidos = {
      contacto_pref: ["email", "tel", "whatsapp"],
    };

    // Comprobar valor dentro de opciones
    if (!valoresValidos[campo].includes(input.value)) {
      showError(input, `${campo}-error`, "Seleccione una valor válido.");
      campos[campo] = false;
    } else {
      clearError(input, `${campo}-error`);
      campos[campo] = true;
    }
    return;
  }

  if (!obligatorio && input.value === "") {
    clearError(input, `${campo}-error`);
    campos[campo] = true;
    return;
  }

  if (expresion.test(input.value.trim())) {
    // Validación Altura
    if (input.name === "altura") {
      const altura = parseInt(input.value);

      if (altura < 120 || altura > 230) {
        showError(
          input,
          `${campo}-error`,
          `Verifique ${campo} (120cm - 230cm)`
        );
        campos[campo] = false;
        return;
      }
    }

    // Validación Peso
    if (input.name === "peso") {
      const peso = parseFloat(input.value);
      if (peso < 35 || peso > 250) {
        showError(
          input,
          `${campo}-error`,
          `Verifique "${campo}" (35kg - 250kg, máximo 2 decimales)`
        );
        campos[campo] = false;
        return;
      }
    }

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

//  PASO 4: Validación de textarea -> Objetivos
const validarTextarea = (textarea, campo, obligatorio) => {
  const texto = textarea.value.trim();

  if (!obligatorio && texto === "") {
    clearError(textarea, `${campo}-error`);
    campos[campo] = true;
    return;
  }

  const regexObjetivos = /^[\wÁÉÍÓÚÜÑáéíóúüñ.,\s]+$/;

  if (!regexObjetivos.test(texto)) {
    showError(
      textarea,
      `${campo}-error`,
      `Debe estar vacío o tener 3 palabras mínimo.`
    );
    campos[campo] = false;
    return;
  }

  const palabrasValidas = texto
    .split(/\s+/)
    .filter((p) => p.replace(/[.,]/g, "").length >= 2);

  if (palabrasValidas.length < 3) {
    showError(
      textarea,
      `${campo}-error`,
      `Debe estar vacío o tener 3 palabras mínimo.`
    );
    campos[campo] = false;
    return;
  }

  clearError(textarea, `${campo}-error`);
  campos[campo] = true;
};

// PASO 4: Validacion campos select (solo select, no todos son obligatorios)
// sexo, estado_civil, nivel, plan
const validarSelect = (select, campo, obligatorio) => {
  // Array de opciones (podemos meterlas manual, para que no se alteren desde el navegador)
  const valoresValidos = {
    sexo: ["f", "m", "x"],
    estado_civil: ["s", "c", "ph", "d", "v"],
    nivel: ["s", "l", "m", "i", "a"],
    plan: ["mensual", "trimestral", "anual", "premium"],
    hora: ["mañana_a", "mañana_b", "tarde_a", "tarde_b", "noche"],
    clases: ["spinning", "crossfit", "yoga", "pilates", "boxeo"],
  };

  // SELECT MÚLTIPLE
  if (select.multiple) {
    const seleccionadas = [...select.selectedOptions].map((o) => o.value);

    // No obligatorio -> vacío válido
    if (seleccionadas.length === 0) {
      clearError(select, `${campo}-error`);
      campos[campo] = true;
      return;
    }
    // Validar cada valor
    const todasValidas = seleccionadas.every((v) =>
      valoresValidos[campo].includes(v)
    );

    if (!todasValidas) {
      showError(select, `${campo}-error`, "Seleccione opciones válidas.");
      campos[campo] = false;
      return;
    }

    clearError(select, `${campo}-error`);
    campos[campo] = true;
    return;
  }

  // SELECT NORMAL
  if (select.value && !valoresValidos[campo].includes(select.value)) {
    showError(select, `${campo}-error`, "Seleccione una valor válido.");
    campos[campo] = false;
    return;
  }

  if (obligatorio && select.value === "") {
    showError(select, `${campo}-error`, `Selecciona un valor.`);
    campos[campo] = false;
    return;
  }

  clearError(select, `${campo}-error`);
  campos[campo] = true;
};

// PASO 4: Validación de checkboxes
const validarGrupoCheckbox = (nombreGrupo, obligatorio) => {
  const checkboxes = document.querySelectorAll(
    `input[name="${nombreGrupo}[]"]`
  );

  let seleccionados = [];
  checkboxes.forEach((cb) => {
    if (cb.checked) seleccionados.push(cb.value);
  });

  // "ninguna" vs otros del grupo
  if (seleccionados.includes("ninguna") && seleccionados.length > 1) {
    // Solo debe quedar marcada "ninguna"
    checkboxes.forEach((cb) => {
      if (cb.value !== "ninguna") cb.checked = false;
    });
    seleccionados = ["ninguna"];
  }

  if (!seleccionados.includes("ninguna")) {
    // Si selecciona opcion, desmarcamos "ninguna"
    checkboxes.forEach((cb) => {
      if (cb.value === "ninguna") cb.checked = false;
    });
  }

  // Obligatorio?
  if (seleccionados.length === 0 && obligatorio) {
    showError(
      checkboxes[0],
      `${nombreGrupo}-error`,
      `Seleccione al menos una opción.`
    );
    campos[nombreGrupo] = false;
  } else {
    clearError(checkboxes[0], `${nombreGrupo}-error`);
    campos[nombreGrupo] = true;
  }

  checkboxes.forEach((checkbox) => {
    const esNinguna = checkbox.value === "ninguna"; // Deberá ser true o false
    if (checkbox.checked && esNinguna) {
      checkboxes.forEach((cb) => {
        if (cb.value != "ninguna") cb.checked = false;
      });
    } else if (checkbox.checked && !esNinguna) {
      checkboxes.forEach((cb) => {
        if (cb.value === "ninguna") cb.checked = false;
      });
    }
  });
};

// PASO 4: Validacion checkbox individual
const validarCheckbox = (input, campo, obligatorio) => {
  if (obligatorio && !input.checked) {
    showError(input, `${campo}-error`, `Debe aceptar para continuar.`);
    campos[campo] = false;
  } else {
    clearError(input, `${campo}-error`);
    campos[campo] = true;
  }
};

// PASO 2 - Accceder a los inputs (solo inputs) para darles event listeners
inputs.forEach((input) => {
  if (input.type !== "checkbox" && input.type !== "radio") {
    input.addEventListener("keyup", validarFormulario);
    input.addEventListener("blur", validarFormulario);
  } else {
    input.addEventListener("change", validarFormulario);
  }
});

// PASO 2 - Acceder a los select...
selects.forEach((select) => {
  select.addEventListener("change", validarFormulario);
});

// PASO 2 - Acceder textarea...
textarea.addEventListener("keyup", validarFormulario);
textarea.addEventListener("blur", validarFormulario);

// PASO 1 - Acceder al form
form.addEventListener("submit", (e) => {
  const checkboxesObligatorios = ["tos", "rgpd"];
  checkboxesObligatorios.forEach((campo) => {
    const input = document.querySelector(`input[name="${campo}"]`);
    validarCheckbox(input, campo, true);
  });

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
    campos["cp"] &&
    campos["altura"] &&
    campos["peso"] &&
    campos["objetivos"] &&
    campos["condiciones"] &&
    campos["plan"] &&
    campos["dias"] &&
    campos["hora"] &&
    campos["clases"] &&
    campos["referido"] &&
    campos["nif_factura"] &&
    campos["dir_factura"] &&
    campos["iban_ultimos"] &&
    campos["tos"] &&
    campos["rgpd"] &&
    campos["promo"]
  ) {
    alert("Enviado!");
    // form.submit();
    // form.reset();
  } else {
    alert("Nope");
    e.preventDefault();
  }
});
