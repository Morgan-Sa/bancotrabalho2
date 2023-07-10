const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  location: {
    type: String,
    required: true
  }
});

eventSchema.index(
  { title: "text", description: "text" },
  {
    default_language: "pt",
    name: "contentTextIndex",
    weights: { title: 2, description: 1 },
  }
);

const Event = mongoose.model('Event', eventSchema);

module.exports = Event;
