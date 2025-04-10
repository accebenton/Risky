// require in modules from node.js
const express = require('express');
const sqlite3 = require('sqlite3').verbose();

//express function to create web app
const app = express();
//tell express to use public folder cont html and css
app.use(express.static('public'));

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



/*-------ADDING RISK TO DB---------------------*/
//route for newly added risk to db--when user visits browser, it will add risk to table
//SHOULD CHANGE THIS TO POST------------------------------
app.get('/addrisk', (req, res) => {
    // example data --- update later to take data from html, testing from url right now
    const title = req.query.title;
    const likelihood = req.query.likelihood; // scale of 1–5
    const impact = req.query.impact;     // scale of 1–5

    //check if all values are present
    if (!title || !likelihood || !impact){
      return res.send('Please provide title, likelihood and impact.')
    }

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

    //insert into db
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

/*-----------------VIEWING RISKS IN DB----------------------*/
//when someone clicks on view risks, takes them to a new page which shows risks in table
//request, coming from browser to server - response - send back to browser
app.get('/viewrisks', (req, res) => {
  const sql = 'SELECT * FROM risks';
  db.all(sql, [], function(err, rows) {
    //could change to return statement to stop before else clause runs
    if (err) {
      return res.send('Error loading risks.');
    } 

    let output = "Risks: \n";
    
    //loop through rows
    for(let i = 0; i <rows.length; i++){
      const risk = rows[i];
      output += risk.title + '\n';
    }

    //show in browser as text just now, HTML later when updating code
    res.type('text');
    //sends output to browser
    res.send(output);
  });
});


//when user clicks on html that is linked with /home this code will run
app.get('/home', (req, res) => {
  // get all risks from db
  const sql = `SELECT * FROM risks`;

db.all(sql, [], function(err, rows) {
    

})