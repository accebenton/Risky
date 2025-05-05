// require in modules from node.js
const express = require('express');
// connect to sqlite via "db" which is variable created in db.js
const db = require('./db');

// define the other route files so they can be pulled in
const homeRoutes = require('./routes/homeRoutes');
const riskRoutes = require('./routes/riskRoutes');


//express function to create web app
const app = express();
//for session library
const session = require('express-session');

// for using express.session library
// secret = internal encrypt session data 
// resave = doesn't save if nothings changed
// saveun = lets new session be stored
app.use(session({
  secret: 'risky_secret_key',  
  resave: false,
  saveUninitialized: true
}));

//tell express to use public folder cont html and css
app.use(express.static('public'));

//port variable to run browser locally, if port in use please change
const port = 3000;

/* test -- .get tells express to go to webpage '/'
app.get('/', (req, res) => {
    res.send('tick! first step complete');
  });
*/
//tells express to use the other files in project folder
app.use('/', homeRoutes);
app.use('/', riskRoutes);


//starts server so can go to browser - port 3000 common for local servers
app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}/home`);
  });


// SQL CREATE TABLES-----------------------------------

// run code in SQLite through variable db
db.run(`
    CREATE TABLE IF NOT EXISTS risks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      likelihood INTEGER,
      impact INTEGER,
      risk_level TEXT,
      assigned_to TEXT,
      riskStatus TEXT
    )
  `);

//adding/amending columns- will comment this out after run once -- added in sql above anyway
//db.run(`ALTER TABLE risks ADD COLUMN assigned_to TEXT`);
//db.run(`ALTER TABLE risks ADD COLUMN status TEXT`);
//db.run(`ALTER TABLE risks RENAME COLUMN name TO name`);




















