const mongoose = require('mongoose');

const boardSchema = new mongoose.Schema({
  boardId: {
    type: String,
    required: true
  },
  groupId: {
    type: String,
    required: true
  },
  columnIds: [{
    type: String
  }]
});

const Board = mongoose.model('Board', boardSchema);

module.exports = Board;
