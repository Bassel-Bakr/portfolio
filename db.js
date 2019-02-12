const config = require('./config');
const mysql = require('mysql');


module.exports = {
  createConnection(callback) {
    const dbConnection = mysql.createConnection({
      host: config.databaseHost,
      user: config.databaseUser,
      password: config.databasePassword,
      database: config.databaseName
    });

    dbConnection.connect(
        callback ? (err => callback(err, dbConnection)) : null);
        
    return dbConnection;
  }
}