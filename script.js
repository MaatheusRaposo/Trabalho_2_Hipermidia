const API_URL = "http://localhost:3000/livros";

let livroSelecionadoId = null;
let livrosCache = [];

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

  const livro = {
    nome: form.nome.value.trim(),
    ano: form.ano.value,
    issn: form.issn.value.trim(),
    autor: form.autor.value.trim(),
    imagem_url: form.imagem_url.value.trim(),
    descricao: form.descricao.value.trim()
  };

  try {
    await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(livro)
    });

    form.reset();
    fecharModal("modalOverlay");
    carregarLivros();
  } catch {
    alert("Erro ao cadastrar livro");
  }
});

/* =========================
   DETALHAR LIVRO
========================= */
function abrirDetalhes(livro) {
  livroSelecionadoId = livro.id;

  document.getElementById("detalheNome").innerText = livro.nome;
  document.getElementById("detalheImagem").src = livro.imagem_url;
  document.getElementById("detalheAno").innerText = livro.ano;
  document.getElementById("detalheAutor").innerText = livro.autor;
  document.getElementById("detalheISSN").innerText = livro.issn;
  document.getElementById("detalheDescricao").innerText =
    livro.descricao || "Sem descrição";

  abrirModal("modalDetalhes");
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