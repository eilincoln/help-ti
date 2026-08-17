const formChamado = document.getElementById("form-chamado");

formChamado.addEventListener("submit", function (event) {
  event.preventDefault();

  const nomeFuncionario = document.getElementById("input-nome").value;

  console.log("Nome capturado: " + nomeFuncionario);
});
