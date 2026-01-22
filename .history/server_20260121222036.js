const express = require("express");
const { Pool } = require("pg");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "booknest_db",
  password: "admin",
  port: 5432
});

// Buscar todos os livros
app.get("/livros", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM livros ORDER BY id");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ erro: "Erro ao buscar livros" });
  }
});

// Inserir livro
app.post("/livros", async (req, res) => {
  const { nome, ano, issn, autor, imagem_url, descricao } = req.body;

  try {
    await pool.query(
      `
      INSERT INTO livros (nome, ano, issn, autor, imagem_url, descricao)
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (issn) DO NOTHING
      `,
      [nome, ano, issn, autor, imagem_url, descricao]
    );

    res.status(201).json({ mensagem: "Livro cadastrado" });
  } catch (err) {
    res.status(500).json({ erro: "Erro ao inserir livro" });
  }
});

// ATUALIZAR LIVRO (PUT)
app.put("/livros/:id", async (req, res) => {
  const { id } = req.params;
  const { nome, ano, issn, autor, imagem_url, descricao } = req.body;

  try {
    const query = `
      UPDATE livros 
      SET nome=$1, ano=$2, issn=$3, autor=$4, imagem_url=$5, descricao=$6
      WHERE id=$7
    `;
    await pool.query(query, [nome, ano, issn, autor, imagem_url, descricao, id]);
    
    res.json({ mensagem: "Livro atualizado com sucesso!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: "Erro ao atualizar livro" });
  }
});

app.listen(3000, () => {
  console.log("🚀 API rodando em http://localhost:3000");
});

app.delete("/livros/:id", async (req, res) => {
  try {
    await pool.query("DELETE FROM livros WHERE id = $1", [req.params.id]);
    res.json({ mensagem: "Livro removido" });
  } catch {
    res.status(500).json({ erro: "Erro ao remover" });
  }
});