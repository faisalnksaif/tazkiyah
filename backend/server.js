require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const routes = require('./routes');
const { notFoundHandler, errorHandler } = require('./middleware/errorHandler');
const appConfig = require('./config/appConfig');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api', routes);

app.use(notFoundHandler);
app.use(errorHandler);

const PORT = process.env.PORT || 4000;

async function start() {
  if (!process.env.MONGO_URI) throw new Error('MONGO_URI is not set (see .env.example)');
  if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET is not set (see .env.example)');

  await connectDB(process.env.MONGO_URI);
  app.listen(PORT, () => console.log(`${appConfig.appName} API listening on port ${PORT}`));
}

if (require.main === module) {
  start().catch((err) => {
    console.error('Failed to start server:', err);
    process.exit(1);
  });
}

module.exports = app;
