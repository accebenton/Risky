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
            res.redirect('/home');
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
    if(err){
      return res.send('There was an error');
    }
    
    //test, shows in browser my rows, backend connecting to front end
    //res.send(rows);

    //HTML PAGE SETUP
    let html =`
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" charset="UTF-8" />
        <link rel="stylesheet" href="style.css" />
        <!-- bootstrap css-->
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.5/dist/css/bootstrap.min.css" 
            rel="stylesheet" 
            integrity="sha384-SgOJa3DmI69IUzQ2PVdRZhwQ+dy64/BUtbMJw1MZ8t5HZApcHrRKUc4W0kG879m7" 
            crossorigin="anonymous">
        <script src="server.js"></script>
        <!-- jQuery, Popper.js, and Bootstrap JS -->
        <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
        <script src="https://cdn.jsdelivr.net/npm/@popperjs/core@2.9.3/dist/umd/popper.min.js"></script>
        <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.5/dist/js/bootstrap.bundle.min.js" 
            integrity="sha384-k6d4wzSIapyDyv1kpU366/PK5hCdSbCRGRCMv+eplOQJWyd1fbcAu9OCUj5zNLiq" 
            crossorigin="anonymous">
        </script>
        <title>Risk Management Tool</title>
      </head>
      <body>
        <!--navigation bar-->
        <div class="nav-bar">
          <div class="row">
            <div class="risky col-2">
              <h1>Risky</h1>
            </div>
            <!-- search bar-->
            <div class="search-bar col-6">
              <form class="form-inline" action="/search" method="get">
                <input class="form-control mr-sm-2" type="search" placeholder="Search" aria-label="Search">
                <button class="btn btn-dark" type="submit">Search</button>
              </form>
            </div>
              <div class="col-4">
                <div class="menu">
                  <ul class="nav">
                    <li class="nav-item">
                      <a class="nav-link" href="profile.html">Profile</a>
                    </li>
                    <li class="nav-item">
                      <a class="nav-link" href="#">Settings</a>
                    </li>
                    <li class="nav-item">
                      <a class="nav-link" href="#">Logout</a>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
        </div>
        <!--adding a risk-->
        <div class="row add-risk">
          <h1>add risk here</h1>
          <!--send data using GET method to backend-->
          <form action="/addrisk" method="get">
            <!--risk name input field-->
            <div class="form-group">
              <label for="title">Risk Name:</label>
              <input type="text" class="form-control" id="title" name="title" required>
            </div>
            <!--risk likelihood input-->
            <div class="form-group">
              <label for="likelihood">Likelihood (1-5):</label>
              <input type="number" class="form-control" id="likelihood" name="likelihood" min="1" max="5" required>
            </div>
            <!--risk impact input-->
              <div class="form-group">
                <label for="impact">Impact (1-5):</label>
                <input type="number" class="form-control" id="impact" name="impact" min="1" max="5" required>
              </div>
              <!-- Submit button -->
              <button type="submit" class="btn btn-primary">Add Risk</button>
          </form>
          <div class="table">
            <h1>Risks Table</h1>
              <table class="risks table">
                <thead>
                  <tr>
                    <th>Risk Name</th>
                    <th>ID</th>
                    <th>Likelihood</th>
                    <th>Impact</th>
                    <th>Risk Level</th>
                  </tr>
                </thead>
                <!--tbody is where the info is pulled to from the backend-->
                <tbody>
    `;

    //loop through each risk from db and add row to html table
    for (let i=0; i <rows.length; i++){
      const risk = rows[i];
      html += `
        <tr>
          <td>${risk.id}</td>
          <td>${risk.title}</td>
          <td>${risk.likelihood}</td>
          <td>${risk.impact}</td>
          <td>${risk.risk_level}</td>
        </tr>
      `;
    }

    html += ` 
                </tbody>
              </table>
          </div>
        </div>
      </body>
    </html>
      `;


  //sends page to browser
  res.send(html);
  });
});



/*NEXT STEPS:
1. ADD DELETE BUTTON
2. SHOW SUCCESS MESSAGE ONCE SUBMIT BUTTON CLICKED
*/
