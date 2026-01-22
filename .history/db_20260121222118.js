const { Client } = require("pg");

const DB_NAME = "booknest_db";

const adminConfig = {
  user: "postgres",
  host: "localhost",
  password: "admin",
  port: 5432,
  database: "postgres"
};

const dbConfig = {
  ...adminConfig,
  database: DB_NAME
};

async function createDatabase() {
  const client = new Client(adminConfig);
  try {
    await client.connect();
    const res = await client.query(
      "SELECT 1 FROM pg_database WHERE datname = $1",
      [DB_NAME]
    );
    if (res.rowCount === 0) {
      await client.query(`CREATE DATABASE "${DB_NAME}"`);
      console.log(`✅ Banco de dados '${DB_NAME}' criado.`);
    } else {
      console.log(`ℹ️ Banco de dados '${DB_NAME}' já existe.`);
    }
  } catch (error) {
    console.error("✖ Erro ao criar/verificar banco de dados:", error.message);
  } finally {
    await client.end();
  }
}

async function createTable() {
  const client = new Client(dbConfig);
  try {
    await client.connect();

    // Tabela 'livros' conforme server.js
    await client.query(`
      CREATE TABLE IF NOT EXISTS livros (
        id SERIAL PRIMARY KEY,
        nome TEXT NOT NULL,
        ano INT,
        issn TEXT UNIQUE,
        autor TEXT,
        imagem_url TEXT,
        descricao TEXT
      );
    `);
    console.log("✅ Tabela 'livros' verificada/criada.");

  } catch (error) {
    console.error("✖ Erro ao criar tabela:", error.message);
  } finally {
    await client.end();
  }
}

(async () => {
  await createDatabase();
  await createTable();
})();
