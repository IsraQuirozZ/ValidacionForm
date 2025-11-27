const validarCampo = (expresion, input, campo) => {
  if (expresion.test(input.value.trim())) {
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
