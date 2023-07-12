const express = require('express');
const app = express();
const cors = require('cors');
const mongoose = require('mongoose');
const connectDB = require('./db');
const eventRoutes = require('./routes');
const path = require('path');
const neo4j = require('neo4j-driver');

// Configuração do servidor
app.use(cors());
app.use(express.json());

// Conectar ao banco de dados MongoDB Atlas
connectDB();

// Configuração do driver do Neo4j
const neo4jDriver = neo4j.driver(
  'bolt://localhost:7687',
  neo4j.auth.basic('neo4j', 'password')
);







// Servir arquivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

// Rotas
app.use('/api', eventRoutes);

// Rota para servir arquivos estáticos
app.use(express.static(__dirname));

// Rota raiz
app.get('/', (req, res) => {
  res.send('API do Meu Projeto');
});

// Rota para acessar o arquivo login.html
app.get('/login.html', (req, res) => {
  res.sendFile(path.join(__dirname,'login.html'));
});

// Rota para o arquivo index.html
app.get('/index.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});


// Rota para criar um relacionamento de "Like" no Neo4j
app.post('/api/event/like', async (req, res) => {
  const eventId = req.body.eventId;
  const userId = req.body.userId;

  const session = neo4jDriver.session();

  try {
    const result = await session.run(
      'MATCH (e:Event), (u:User) WHERE e.id = $eventId AND u.id = $userId CREATE (u)-[:LIKES]->(e) RETURN e',
      { eventId, userId }
    );

    session.close();

    if (result.records.length > 0) {
      const eventNode = result.records[0].get('e');
      res.json({ success: true, eventId: eventNode.properties.id });
    } else {
      res.json({ success: false, message: 'Evento ou usuário não encontrado.' });
    }
  } catch (error) {
    console.error('Erro ao criar relacionamento de "Like":', error);
    res.status(500).json({ success: false, message: 'Ocorreu um erro ao criar o relacionamento.' });
  }
});



// Iniciar o servidor
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});
