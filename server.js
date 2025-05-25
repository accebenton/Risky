// require in modules from node.js
const express = require('express');
//for session library
const session = require('express-session');
// connect to sqlite via "db" which is variable created in db.js
const db = require('./db');
// define the other route files so they can be pulled in
const homeRoutes = require('./routes/homeRoutes');
const addRisk = require('./routes/riskRoutes/addRisk');
const deleteRisk = require('./routes/riskRoutes/deleteRisk');
const editRisk = require('./routes/riskRoutes/editRisk');
const updateRisk = require('./routes/riskRoutes/updateRisk');
const viewRisk = require('./routes/riskRoutes/viewRisk');
const kanban = require('./routes/riskRoutes/kanban');
const statusUpdate = require('./routes/riskRoutes/statusUpdate');


//express function to create web app
const app = express();
// this is for POST requests so the form fields can be read
//express will parse urlencoded data into req.body
app.use(express.urlencoded({ extended: true }));
// for using express.session library
// secret = internal encrypt session data 
// resave = doesn't save if nothings changed
// saveun = lets new session be stored
app.use(session({
  secret: 'risky_secret_key',  
  resave: false,
  saveUninitialized: true
}));

// POST routes
app.use('/', homeRoutes);
app.use('/', addRisk);
app.use('/', deleteRisk);
app.use('/', editRisk);
app.use('/', updateRisk);
app.use('/', viewRisk);
app.use('/', kanban);
app.use('/', statusUpdate);


//tell express to use public folder cont html and css
app.use(express.static('public'));

//port variable to run browser locally, if port in use please change
const port = 3000;

/* test -- .get tells express to go to webpage '/'
app.get('/', (req, res) => {
    res.send('tick! first step complete');
  });
*/

//starts server so can go to browser - port 3000 common for local servers
app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}/home`);
  });


// SQL CREATE TABLES-----------------------------------

// run code in SQLite through variable db
db.run(`
    CREATE TABLE IF NOT EXISTS risks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      date_created TEXT,
      likelihood INTEGER,
      impact INTEGER,
      risk_status TEXT,
      risk_level TEXT,
      assigned_to INTEGER,
      description TEXT,
      last_updated TEXT
    );
  `);

//adding/amending columns- will comment this out after run once -- added in sql above anyway
//db.run(`ALTER TABLE risks ADD COLUMN assigned_to TEXT`);
//db.run(`ALTER TABLE risks ADD COLUMN status TEXT`);
//db.run(`ALTER TABLE risks RENAME COLUMN name TO name`);




















