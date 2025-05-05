// db.js is the file that connects project folder to SQLite database
//opens a single connection to db file and exports connection so other files can access
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('riskTool.db');
module.exports = db;
