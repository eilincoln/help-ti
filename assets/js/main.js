/*
    Lógica central do fluxo do formulário
*/

const formChamado = document.getElementById("form-chamado");

formChamado.addEventListener("submit", function (event) {
  event.preventDefault();

  const dadosChamado = {
    nome: document.getElementById("input-nome").value,
    setor: document.getElementById("select-setor").value,
    categoria: document.getElementById("select-categoria").value,
    descricao: document.getElementById("textarea-descricao").value,
    status: "Pendendente",
    dataAbertura: new Date().toLocaleDateString("pt-br"),
  };

  // Apenas para teste, caso precise
  console.log("Objeto foi para o banco de dados: ", dadosChamado);

  alert(
    `Obrigado, ${dadosChamado.nome}! Seu chamado para a categoria de "${dadosChamado.categoria}" foi aberto`,
  );

  formChamado.reset();
});
