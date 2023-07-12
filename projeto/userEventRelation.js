// userEventRelation.js
const mongoose = require('mongoose');

const userEventRelationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true
  },
  // Outros campos de relação entre usuário e evento
});

const UserEventRelation = mongoose.model('UserEventRelation', userEventRelationSchema);

module.exports = UserEventRelation;
