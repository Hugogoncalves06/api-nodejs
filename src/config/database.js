const mongoose = require('mongoose');
const logger = require('../utils/logger');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    logger.info(`MongoDB connecté: ${conn.connection.host}`);
  } catch (error) {
    logger.error('Erreur de connexion MongoDB:', error);
    process.exit(1);
  }
};

module.exports = connectDB; 