// require in modules from node.js
const express = require('express');
const sqlite3 = require('sqlite3').verbose();

//express function to create web app
const app = express();
//port variable to run browser locally, if port in use please change
const port = 3000;


//connect to sqlite
const db = new sqlite3.Database('riskTool.db');

/* test -- .get tells express to go to webpage '/'*/
app.get('/', (req, res) => {
    res.send('tick! first step complete');
  });


//starts server so can go to browser - port 3000 common for local servers
app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
  });


// SQL CREATE TABLES-----------------------------------

// run code in SQLite through variable db
db.run(`
    CREATE TABLE IF NOT EXISTS risks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      likelihood INTEGER,
      impact INTEGER,
      risk_level TEXT
    )
  `);

//route for newly added risk to db--when user visits browser, it will add risk to table
//SHOULD CHANGE THIS TO POST------------------------------
app.get('/addrisk', (req, res) => {
    // example data --- update later to take data from html
    const title = 'outdated software, to update';
    const likelihood = 3; // Scale of 1–5
    const impact = 4;     // Scale of 1–5

    //calculate risk from OWASP matrix
    const riskScore = likelihood * impact;

    let riskLevel = 'Low';
    if (riskScore => 15){
        riskLevel = 'Critical';
    } else if (riskScore => 10){
        riskLevel = 'High';
    } else if (riskScore => 5){
        riskLevel = 'Medium';
    }

    //insert in db
    db.run(
        `INSERT INTO risks (title, likelihood, impact, risk_level) VALUES (?, ?, ?, ?)`,
        [title, likelihood, impact, riskLevel],
        /*this function runs after code is inserted - if error, then return (response.send) msg
        to browser. if not, risk added*/
        function(err) {
            if (err) {
              return res.send('Something went wrong.');
            }
            res.send('Risk added!');
          }
      );
    });