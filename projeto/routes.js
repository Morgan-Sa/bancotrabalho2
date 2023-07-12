const express = require('express');
const router = express.Router();
const Event = require('./event');
const neo4j = require('neo4j-driver');
const User = require('./user');
const UserEventRelation = require('./userEventRelation');
const authRoutes = require('./auth');
const path = require('path');

// Rota para listar todos os eventos
router.get('/event', async (req, res) => {
  try {
    const events = await Event.find();
    res.json(events);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.post('/event', async (req, res) => {
  try {
    const event = new Event(req.body);
    await event.save();

    // Criar um nó para o evento no Neo4J e relacioná-lo com o usuário (se necessário)
    const driver = neo4j.driver(
      'bolt://localhost:7687',
      neo4j.auth.basic('neo4j', 'password')
    );
    const session = driver.session();

    const neo4jQuery = `
      CREATE (event:Event {id: $eventId, title: $eventTitle})
      RETURN event
    `;

    const params = {
      eventId: event._id,
      eventTitle: event.title
    };

    await session.run(neo4jQuery, params);

    session.close();
    driver.close();

    res.status(201).json(event);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Rota para servir o arquivo index.html
router.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});



// Rota para obter um evento específico por ID
router.get('/event/:id', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Evento não encontrado' });
    }
    res.json(event);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Rota para atualizar um evento
router.put('/event/:id', async (req, res) => {
  try {
    const event = await Event.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!event) {
      return res.status(404).json({ message: 'Evento não encontrado' });
    }
    res.json(event);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Rota para remover um evento
router.delete('/event/:id', async (req, res) => {
  try {
    const event = await Event.findByIdAndRemove(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Evento não encontrado' });
    }
    res.json({ message: 'Evento removido com sucesso' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Rota para salvar um usuário
router.post('/user', async (req, res) => {
  try {
    const user = new User(req.body);
    await user.save();

    // Criar um nó para o usuário no Neo4J
    const driver = neo4j.driver(
      'bolt://localhost:7687',
      neo4j.auth.basic('neo4j', 'IBasYnPWiOGQyxNuFL3ovbktUu6q6whxPatUbSOQLiM')
    );
    const session = driver.session();

    const neo4jQuery = `
      CREATE (user:User {id: $userId, username: $username})
      RETURN user
    `;

    const params = {
      userId: user._id,
      username: user.username
    };

    await session.run(neo4jQuery, params);

    session.close();
    driver.close();

    res.status(201).json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Rota para relacionar um usuário com um evento
router.post('/user/:userId/event/:eventId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    const event = await Event.findById(req.params.eventId);

    if (!user || !event) {
      return res.status(404).json({ message: 'Usuário ou evento não encontrado' });
    }

    // Criar uma relação entre o usuário e o evento no banco de grafos
    const userEventRelation = new UserEventRelation({
      userId: user._id,
      eventId: event._id
    });

    await userEventRelation.save();

    // Criar uma relação no Neo4J
    const driver = neo4j.driver(
      'bolt://localhost:7687',
      neo4j.auth.basic('neo4j', 'IBasYnPWiOGQyxNuFL3ovbktUu6q6whxPatUbSOQLiM')
    );
    const session = driver.session();

    const neo4jQuery = `
      MATCH (user:User {id: $userId}), (event:Event {id: $eventId})
      MERGE (user)-[:ATTENDED]->(event)
      RETURN user, event
    `;

    const params = {
      userId: user._id,
      eventId: event._id
    };

    await session.run(neo4jQuery, params);

    session.close();
    driver.close();

    res.status(200).json({ message: 'Relacionamento criado com sucesso' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Rotas de autenticação
router.use('/authenticate', authRoutes);

module.exports = router;
