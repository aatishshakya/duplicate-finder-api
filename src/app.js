require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const routes = require('./routes');
const mongoose = require('mongoose');
const cors = require('cors');

const { PORT: port } = process.env;
const app = express();

app.use(cors("*"));
app.use(bodyParser.json());
app.use(routes);

mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.log(err));
app.listen(port, () => {
  console.log(`Transform text integration listening on port ${port}`)
});

module.exports = app;
