const router = require('express').Router();
const { moveDuplicateItems } = require('../services/monday-service');
const Board = require('../models/BoardModel');

router.post('/', async (req, res) => {
  const event = req.body.event;
  const boardDetails = await Board.findOne({ boardId: event.boardId });

  await moveDuplicateItems(boardDetails);
  res.status(200).send(req.body);
});

router.post('/create-duplicates', async (req, res) => {
  try {
    const newBoard = new Board(req.body);
    await newBoard.save();

    const response = await moveDuplicateItems(req.body);
    res.status(200).send(response);
  }
  catch (err) {
    res.status(500).send({ message: 'internal server error' });
  }
})


module.exports = router;
