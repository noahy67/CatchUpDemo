require('dotenv').config();
const mongoose = require('mongoose');
const express = require('express');
const connectDB = require('./src/db/conn');
const usersRoutes = require('./src/routes/usersRoutes');
const groupsRoutes = require('./src/routes/groupsRoutes');

const { API_PORT } = process.env;
// node package imports.

// connect to mongoDB
connectDB();

// server.
const app = express();

app.use(express.json());

const phone_port = '8081';

mongoose.connection.once('open', () => {
  console.log('Connected to MONGODB');
  // start server.
  // app.listen(API_PORT, () => {
  //   console.log(`Server is listening on port ${API_PORT}.`);
  // });

  app.listen(phone_port, '192.168.0.225', () => {
    console.log(`Server is listening on port ${phone_port}.`);
  });
});

// const logger = (req, res, next) => {
//   console.log(req.url);
//   console.log(req.params);
//   console.log(req.query);
//   next();
// };

app.use('/api/users', usersRoutes);
app.use('/api/groups', groupsRoutes);
