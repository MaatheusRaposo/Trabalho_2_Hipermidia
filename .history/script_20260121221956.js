const API_URL = "http://localhost:3000/livros";

let livroSelecionadoId = null;
let livrosCache = [];
let livroParaEditar = null;

/* =========================
   LISTAR LIVROS
========================= */
async function carregarLivros() {
  try {
    const res = await fetch(API_URL);
    livrosCache = await res.json();

    renderizarLivros(livrosCache);
  } catch (err) {
    alert("Erro ao carregar livros");
  }
}

function renderizarLivros(livros) {
  const container = document.getElementById("listaLivros");
  container.innerHTML = "";

  livros.forEach(livro => {
    const card = document.createElement("div");
    card.className = "livro-card";

    card.innerHTML = `
      <img src="${livro.imagem_url}" alt="${livro.nome}">
      <h3>${livro.nome}</h3>
      <p>${livro.autor}</p>
    `;

    card.addEventListener("click", () => abrirDetalhes(livro));
    container.appendChild(card);
  });
}

/* =========================
   INSERIR LIVRO
========================= */
document.getElementById("formCriar").addEventListener("submit", async (e) => {
  e.preventDefault();
  const form = e.target;

  const dadosLivro = {
    nome: form.nome.value,
    ano: form.ano.value,
    issn: form.issn.value,
    autor: form.autor.value,
    imagem_url: form.imagem_url.value,
    descricao: form.descricao.value
  };

  try {
    let url = API_URL;
    let metodo = "POST";

    // Se tiver ID selecionado, é EDIÇÃO
    if (livroSelecionadoId) {
      url = `${API_URL}/${livroSelecionadoId}`;
      metodo = "PUT";
    }

    const res = await fetch(url, {
      method: metodo,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dadosLivro)
    });

    if (res.ok) {
      fecharModal("modalOverlay");
      carregarLivros(); // Recarrega a lista
      alert(livroSelecionadoId ? "Livro atualizado!" : "Livro cadastrado!");
      livroSelecionadoId = null; // Reseta após salvar
    } else {
      alert("Erro ao salvar livro.");
    }
  } catch (error) {
    console.error(error);
    alert("Erro de conexão.");
  }
});

/* =========================
   DETALHAR LIVRO
========================= */
function abrirDetalhes(livro) {
  console.log("Guardando livro para edição:", livro); // Debug no console

  livroSelecionadoId = livro.id;
  livroParaEditar = livro; // <--- IMPORTANTE: Isso salva o livro na memória!

  // Preenche o modal de visualização (Detalhes)
  document.getElementById("detalheNome").innerText = livro.nome;
  document.getElementById("detalheImagem").src = livro.imagem_url;
  document.getElementById("detalheAno").innerText = livro.ano;
  document.getElementById("detalheAutor").innerText = livro.autor;
  document.getElementById("detalheISSN").innerText = livro.issn;
  document.getElementById("detalheDescricao").innerText = livro.descricao || "Sem descrição";

  abrirModal("modalDetalhes");
}

// Lógica do botão Editar
document.getElementById("btnEditar").onclick = () => {
  fecharModal("modalDetalhes"); // Fecha o visualizador
  prepararEdicao(livroParaEditar); // Abre o formulário preenchido
};

function prepararEdicao(livro) {
  // Proteção contra o erro "livro is null"
  if (!livro) {
    console.error("Erro: O livro para edição está vazio!");
    alert("Houve um erro ao selecionar o livro. Tente recarregar a página.");
    return;
  }

  const form = document.getElementById("formCriar");
  
  // Preenche os campos
  form.nome.value = livro.nome;
  form.ano.value = livro.ano;
  form.issn.value = livro.issn;
  form.autor.value = livro.autor;
  form.imagem_url.value = livro.imagem_url;
  form.descricao.value = livro.descricao;

  document.getElementById("tituloModal").innerText = "Editar Livro";
  document.querySelector("#formCriar button").innerText = "Salvar Alterações";
  
  abrirModal("modalOverlay");
}

/* =========================
   REMOVER LIVRO
========================= */
document.getElementById("btnExcluir").addEventListener("click", async () => {
  if (!livroSelecionadoId) return;

  if (!confirm("Deseja realmente excluir este livro?")) return;

  try {
    await fetch(`${API_URL}/${livroSelecionadoId}`, {
      method: "DELETE"
    });

    fecharModal("modalDetalhes");
    carregarLivros();
  } catch {
    alert("Erro ao excluir livro");
  }
});

/* =========================
   BUSCAR LIVRO
========================= */
document.getElementById("search-input").addEventListener("input", (e) => {
  const termo = e.target.value.toLowerCase();

  const filtrados = livrosCache.filter(livro =>
    livro.nome.toLowerCase().includes(termo) ||
    livro.autor.toLowerCase().includes(termo) ||
    livro.issn.includes(termo)
  );

  renderizarLivros(filtrados);
});

document.getElementById("btn_cadastro").onclick = () => {
  livroSelecionadoId = null; // Garante que não é edição
  livroParaEditar = null;
  document.getElementById("formCriar").reset(); // Limpa o formulário
  document.getElementById("tituloModal").innerText = "Novo Livro"; // Muda título
  document.querySelector("#formCriar button").innerText = "Cadastrar Livro"; // Muda botão
  abrirModal("modalOverlay");
};

/* =========================
   MODAIS
========================= */
function abrirModal(id) {
  document.getElementById(id).style.display = "flex";
}

function fecharModal(id) {
  document.getElementById(id).style.display = "none";
}

document.getElementById("btn_cadastro").onclick = () =>
  abrirModal("modalOverlay");

document.getElementById("fecharModal").onclick = () =>
  fecharModal("modalOverlay");

document.getElementById("fecharDetalhes").onclick = () =>
  fecharModal("modalDetalhes");

/* =========================
   INICIALIZAÇÃO
========================= */
document.addEventListener("DOMContentLoaded", carregarLivros);