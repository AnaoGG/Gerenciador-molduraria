const express = require('express');
const { Pool } = require('pg'); // MUDANÇA: Importa o 'Pool' da biblioteca 'pg'
const cors = require('cors');
require('dotenv').config();
const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// MUDANÇA: Configuração da conexão com o PostgreSQL
// A URL de conexão virá de uma variável de ambiente, nunca direto no código!
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

console.log('✅ Backend configurado para conectar ao PostgreSQL');

// MUDANÇA: Removemos a criação de tabelas daqui. Elas já foram criadas no Passo 2.

// --------- CLIENTES ---------
app.post('/api/clientes', async (req, res) => {
  const { nome, email, telefone } = req.body;
  const sql = `INSERT INTO clientes (nome, email, telefone) VALUES ($1, $2, $3) RETURNING id`;
  try {
    const result = await pool.query(sql, [nome, email, telefone]);
    res.json({ id: result.rows[0].id }); // MUDANÇA: Pega o ID do resultado
  } catch (err) {
    console.error('ERRO AO INSERIR CLIENTE NO BANCO DE DADOS:', err); 
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/clientes', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM clientes ORDER BY nome');
    res.json(result.rows); // MUDANÇA: Os dados vêm em 'result.rows'
  } catch (err) {
    console.error('ERRO AO BUSCAR CLIENTES NO BANCO DE DADOS:', err);
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/clientes/:id', async (req, res) => {
    const { id } = req.params;
    const { nome, email, telefone } = req.body;
    const sql = `UPDATE clientes SET nome = $1, email = $2, telefone = $3 WHERE id = $4`;
    try {
        const result = await pool.query(sql, [nome, email, telefone, id]);
        // MUDANÇA: 'rowCount' informa quantas linhas foram afetadas
        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Cliente não encontrado' });
        }
        res.json({ message: 'Cliente atualizado com sucesso', id: id });
    } catch (err) {
        console.error('ERRO AO ATUALIZAR CLIENTE NO BANCO DE DADOS:', err);
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/clientes/:id', async (req, res) => {
    const { id } = req.params;
    const sql = `DELETE FROM clientes WHERE id = $1`;
    try {
        const result = await pool.query(sql, [id]);
        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Cliente não encontrado' });
        }
        res.status(200).json({ message: 'Cliente deletado com sucesso' });
    } catch (err) {
        console.error('ERRO AO DELETAR CLIENTE NO BANCO DE DADOS:', err);
        res.status(500).json({ error: err.message });
    }
});


// --------- MATERIAIS --------- (Aplicando as mesmas mudanças)
app.post('/api/materiais', async (req, res) => {
    const { codigo, nome, categoria, unidade, descricao, estoque } = req.body;
    const sql = `INSERT INTO materiais (codigo, nome, categoria, unidade, descricao, estoque) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`;
    try {
        const result = await pool.query(sql, [codigo, nome, categoria, unidade, descricao, estoque]);
        res.json({ id: result.rows[0].id });
    } catch (err) {
        console.error('ERRO AO INSERIR MATERIAL NO BANCO DE DADOS:', err);
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/materiais', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM materiais ORDER BY nome');
        res.json(result.rows);
    } catch (err) {
        console.error('ERRO AO BUSCAR MATERIAIS NO BANCO DE DADOS:', err);
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/materiais/:id', async (req, res) => {
    const { id } = req.params;
    const { codigo, nome, categoria, unidade, descricao, estoque } = req.body;
    const sql = `UPDATE materiais SET codigo = $1, nome = $2, categoria = $3, unidade = $4, descricao = $5, estoque = $6 WHERE id = $7`;
    try {
        const result = await pool.query(sql, [codigo, nome, categoria, unidade, descricao, estoque, id]);
        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Material não encontrado' });
        }
        res.json({ message: 'Material atualizado com sucesso', id: id });
    } catch (err) {
        console.error('ERRO AO ATUALIZAR MATERIAL NO BANCO DE DADOS:', err);
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/materiais/:id', async (req, res) => {
    const { id } = req.params;
    const sql = `DELETE FROM materiais WHERE id = $1`;
    try {
        const result = await pool.query(sql, [id]);
        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Material não encontrado' });
        }
        res.status(200).json({ message: 'Material deletado com sucesso' });
    } catch (err) {
        console.error('ERRO AO DELETAR MATERIAL NO BANCO DE DADOS:', err);
        res.status(500).json({ error: err.message });
    }
});

// --------- PEDIDOS ---------
app.post('/api/pedidos', async (req, res) => {
    const { cliente_id, materiais, data, status, previsao_entrega, desconto, valor_total, parcelas, valor_parcela } = req.body;
    const sql = `INSERT INTO pedidos (cliente_id, materiais, data, status, previsao_entrega, desconto, valor_total, parcelas, valor_parcela) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id`;
    try {
        const result = await pool.query(sql, [cliente_id, materiais, data, status, previsao_entrega, desconto, valor_total, parcelas, valor_parcela]);
        res.json({ id: result.rows[0].id });
    } catch (err) {
        console.error('ERRO AO INSERIR PEDIDO NO BANCO DE DADOS:', err);
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/pedidos', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM pedidos ORDER BY data DESC');
        res.json(result.rows);
    } catch (err) {
        console.error('ERRO AO BUSCAR PEDIDOS NO BANCO DE DADOS:', err);
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/pedidos/:id', async (req, res) => {
    const { id } = req.params;
    const { cliente_id, materiais, data, status, previsao_entrega, desconto, valor_total, parcelas, valor_parcela, observacoes } = req.body;
    const sql = `UPDATE pedidos SET cliente_id = $1, materiais = $2, data = $3, status = $4, previsao_entrega = $5, desconto = $6, valor_total = $7, parcelas = $8, valor_parcela = $9, observacoes = $10 WHERE id = $11`;
    try {
        const result = await pool.query(sql, [cliente_id, materiais, data, status, previsao_entrega, desconto, valor_total, parcelas, valor_parcela, observacoes, id]);
        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Pedido não encontrado' });
        }
        res.json({ message: 'Pedido atualizado com sucesso', id: id });
    } catch (err) {
        console.error('ERRO AO ATUALIZAR PEDIDO NO BANCO DE DADOS:', err);
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/pedidos/:id', async (req, res) => {
    const { id } = req.params;
    const sql = `DELETE FROM pedidos WHERE id = $1`;
    try {
        const result = await pool.query(sql, [id]);
        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Pedido não encontrado' });
        }
        res.status(200).json({ message: 'Pedido deletado com sucesso' });
    } catch (err) {
        console.error('ERRO AO DELETAR PEDIDO NO BANCO DE DADOS:', err);
        res.status(500).json({ error: err.message });
    }
});

// --------- USUÁRIOS ---------
app.post('/api/usuarios/signup', async (req, res) => {
    const { username, passwordHash } = req.body;
    const sql = `INSERT INTO usuarios (username, passwordHash) VALUES ($1, $2) RETURNING id`;
    try {
        const result = await pool.query(sql, [username, passwordHash]);
        res.json({ id: result.rows[0].id });
    } catch (err) {
        console.error('ERRO AO INSERIR USUÁRIO NO BANCO DE DADOS:', err);
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/usuarios/login', async (req, res) => {
    const { username, passwordHash } = req.body;
    const sql = `SELECT * FROM usuarios WHERE username = $1 AND passwordHash = $2`;
    try {
        const result = await pool.query(sql, [username, passwordHash]);
        const user = result.rows[0];
        if (!user) {
            return res.status(401).json({ error: 'Usuário ou senha incorretos' });
        }
        res.json({ id: user.id, username: user.username });
    } catch (err) {
        console.error('ERRO AO LOGAR USUÁRIO NO BANCO DE DADOS:', err);
        res.status(500).json({ error: err.message });
    }
});


// --------- START SERVER ---------
app.listen(PORT, () => {
    console.log(`🚀 Servidor Backend rodando em http://localhost:${PORT}`);
});

// MUDANÇA: Exportamos apenas o app para a Vercel
module.exports = app;