const express = require('express');
const router = express.Router();
const User = require('./user');
const jwt = require('jsonwebtoken');

// Rota para autenticar o usuário
router.post('/', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Verificar se o usuário existe no banco de dados
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(401).json({ message: 'Nome de usuário inválido' });
    }

    // Verificar se a senha está correta
    if (password !== user.password) {
      return res.status(401).json({ message: 'Senha inválida' });
    }

    // Gerar token de autenticação usando JWT
    const token = generateAuthToken(user);

    // Enviar o token de autenticação como resposta
    res.json({ token });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Função para gerar token de autenticação usando JWT
function generateAuthToken(user) {
  // Gerar o token de autenticação com base no ID do usuário
  const token = jwt.sign({ userId: user._id }, 'secretkey');
  return token;
}

module.exports = router;
