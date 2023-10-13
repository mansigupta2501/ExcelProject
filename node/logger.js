const winston = require('winston');

// Create a logger instance
const logger = winston.createLogger({
  level: 'silly', // Set the logging level to the lowest level 'silly'
  format: winston.format.combine(
    winston.format.timestamp(), // Add timestamps to log entries
    winston.format.json() // Log messages as JSON objects
  ),
  transports: [
    new winston.transports.File({ filename: 'logs.log' }) // Specify the log file name
  ]
});

// Create a logger for exceptions
const exceptionLogger = winston.createLogger({
  level: 'error', // Set the logging level to 'error' for exceptions
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'exceptions.log' }) // Specify the exception log file name
  ]
});

// Log uncaught exceptions and unhandled promise rejections
process.on('uncaughtException', (ex) => {
  console.error('Uncaught Exception:', ex);
  exceptionLogger.error('Uncaught Exception:', ex);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection:', reason);
  exceptionLogger.error('Unhandled Rejection:', reason);
  process.exit(1);
});

module.exports = {
  logger,
  exceptionLogger
};
