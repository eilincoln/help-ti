/*
 HelpTI - Central de Atendimento
 */
const supabase = supabase.createClient(
  SUPABASE_CONFIG.url,
  SUPABASE_CONFIG.apiKey,
);
const formChamado = document.getElementById("form-chamado");

formChamado.addEventListener("submit", async function (event) {
  event.preventDefault();
  const novoChamado = {
    nome: document.getElementById("input-nome").value,
    setor: document.getElementById("select-setor").value,
    categoria: document.getElementById("select-categoria").value,
    descricao: document.getElementById("textarea-descricao").value,
    status: "Pendente",
  };

  try {
    const { data, error } = await supabase
      .from("chamados")
      .insert([novoChamado]);

    if (error) throw error;

    alert(
      `Obrigado, ${novoChamado.nome}! Seu chamado foi registrado com sucesso em nossa nuvem de TI.`,
    );

    formChamado.reset();
  } catch (error) {
    console.error("Erro crítico na comunicação com o banco de dados:", error);
    alert(
      "Ocorreu um erro ao enviar seu chamado para o servidor. Por favor, tente novamente.",
    );
  }
});
