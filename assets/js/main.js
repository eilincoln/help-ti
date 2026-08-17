const formChamado = document.getElementById("form-chamado");

formChamado.addEventListener("submit", function (event) {
  event.preventDefault();

  const novoChamado = {
    id: Date.now(),
    nome: document.getElementById("input-nome").value,
    setor: document.getElementById("select-setor").value,
    categoria: document.getElementById("select-categoria").value,
    descricao: document.getElementById("textarea-descricao").value,
    status: "Pendente",
  };

  let listaDeChamados = JSON.parse(localStorage.getItem("banco_help_ti")) || [];

  listaDeChamados.push(novoChamado);

  localStorage.setItem("banco_help_ti", JSON.stringify(listaDeChamados));

  alert(`Sucesso! Chamado de ${novoChamado.nome} foi salvo localmente.`);
  formChamado.reset();
});
