// require in modules from node.js
const express = require('express');
const sqlite3 = require('sqlite3').verbose();

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


//connect to sqlite
const db = new sqlite3.Database('riskTool.db');

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
      title TEXT NOT NULL,
      likelihood INTEGER,
      impact INTEGER,
      risk_level TEXT,
      assigned_to TEXT,
      status TEXT
    )
  `);
//forgot to add assigned to column - will comment this out after run once -- added in sql above anyway
//db.run(`ALTER TABLE risks ADD COLUMN assigned_to TEXT`);

/*ADD RISK ROUTE */
//route for newly added risk to db--when user visits browser, it will add risk to table
//SHOULD CHANGE THIS TO POST?------------------------------
app.get('/addrisk', (req, res) => {
    // example data --- update later to take data from html, testing from url right now
    const title = req.query.title;
    const likelihood = req.query.likelihood; // scale of 1–5
    const impact = req.query.impact;     // scale of 1–5
    const assigned_to = req.query.assigned_to;
    //check if all values are present
    if (!title || !likelihood || !impact){
      return res.send('Please provide title, likelihood and impact.')
    }

    //calculate risk from OWASP matrix
    const riskScore = likelihood * impact;

    let riskLevel = 'Low';

    if (riskScore >= 6 && riskScore <= 10) {
      riskLevel = 'Medium';
    } else if (riskScore >= 11 && riskScore <= 15) {
      riskLevel = 'High';
    } else if (riskScore >= 16) {
      riskLevel = 'Critical';
    }

    //insert into db
    db.run(
        `INSERT INTO risks (title, likelihood, impact, risk_level, assigned_to) VALUES (?, ?, ?, ?, ?)`,
        [title, likelihood, impact, riskLevel, assigned_to],
        /*this function runs after code is inserted - if error, then return (response.send) msg
        to browser. if not, risk added*/
        function(err) {
            if (err) {
              return res.send('Something went wrong.');
            }
            req.session.message = 'Risk added';
            res.redirect('/home');
          }
      );
    });




//HOME PAGE ROUTE
//when user clicks on html that is linked with /home this code will run
app.get('/home', (req, res) => {
  // get all risks from db, changed from const to let for sort/filter
   // for sort/filter field
  const sort = req.query.sort;
  let sql = `SELECT * FROM risks`;
  //logic for sort 
  if (sort === 'score'){
    sql += ` ORDER BY likelihood * impact DESC`;
  } else if (sort === 'level'){
    sql += `
       ORDER BY CASE risk_level
        WHEN 'Critical' THEN 1
        WHEN 'High' THEN 2
        WHEN 'Medium' THEN 3
        WHEN 'Low' THEN 4
      END`;
  } else if (sort ==='title'){
    sql += ' ORDER BY title ASC';
  } else if (sort === 'assigned'){
    sql += ` ORDER BY assigned_to ASC`;
  }






 
  //for success message using express.session
  const message = req.session.message; 
  //only show message once then clear
  req.session.message = null;


  db.all(sql, [], function(err, rows) {
    if(err){
      return res.send('There was an error');
    }
    
    //test, shows in-browser my rows, backend connecting to front end
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
      <body>`

      //session message for success message upon adding/deleting/editng risk
      if (message) {
        html += `<div class="alert alert-success">${message}</div>`;
      } 

      html +=
      `
      <!--TOP NAVBAR-->
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
            <!-- assigned to user input-->
              <div class="form-group">
                <label for="assigned_to">Assign to:</label>
                <input type="text" class="form-control" id ="assigned_to" name="assigned_to" placeholder="Enter user name" required>
              </div>
              <!-- Submit button -->
              <button type="submit" class="btn btn-primary">Add Risk</button>
          </form>
          <div class="table">
            <h1>Risks Table</h1>
            <!-- SORTING INPUT FIELD -->
            <!--template literals/ternary operators change placeholder view of input field to match selected view
            <!-- ie if selected option matches, show selected option-->
            <form method="get" action="/home" class="mb-3">
              <label for="sort" class="form-label">Sort by:</label>
              <select name="sort" id="sort" class="form-select" onchange="this.form.submit()">
                <option value="" ${sort === '' || !sort ? 'selected' : ''}>By ID (default)</option>
                <option value="score" ${sort === 'score' ? 'selected' : ''}>Risk Score (High to Low)</option>
                <option value="level" ${sort === 'level' ? 'selected' : ''}>Risk Level (Critical to Low)</option>
                <option value="title" ${sort === 'title' ? 'selected' : ''}>Risk Title (A-Z)</option>
                <option value="assigned" ${sort === 'assigned' ? 'selected' : ''}>Assigned User (A-Z)</option>
              </select>
            </form>
              <table class="risks table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Risk Name</th>
                    <th>Likelihood</th>
                    <th>Impact</th>
                    <th>Risk Level</th>
                    <th>Assigned To</th>
                  </tr>
                </thead>
                <!--tbody is where the info is pulled to from the backend-->
                <tbody>`;

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
          <td>${risk.assigned_to}</td>
          <td>
          <!-- delete and edit buttons -->
            <a href="/deleterisk?id=${risk.id}" 
              class="btn btn-danger btn-sm"
              onclick="return confirm('Are you sure you want to delete this risk?');">Delete</a>
            <a href="/editrisk?id=${risk.id}" class="btn btn-secondary btn-sm">Edit</a>
          </td>
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

//DELETE RISK ROUTE
app.get('/deleterisk', (req, res) => {
  //get id from URL ie ?id=3
  const id= req.query.id;

  //check id was found
  if(!id){
    return res.send('No ID found');
  }

  //run sql query to delete ID's row
  const sql = `DELETE FROM risks WHERE id = ?`;
  db.run(sql, [id], function(err) {
    if (err) {
      return res.send('Error');
    }
    //for success message
    req.session.message = 'Risk deleted';
    //redirect to home after deletion
    res.redirect('/home');
  });
});

/*EDIT ROUTE/ html form page*/
app.get('/editrisk', (req, res) => {
  // edit a risk that is already logged to table
  const id = req.query.id;
  //send error if id not given
  if(!id){
    return res.send('No id given');
  }
  const sql = `SELECT * FROM risks WHERE id = ?`;

  db.get(sql, [id], (err, risk) => {
    //send error message if fails
    if (err) {
      return res.send('Error');
    }
    //send error msg if no risk found
    if (!risk){
      res.send('No risk found');
    }

    //HTML form appears once click edit button
    let html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Edit Risk</title>
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@4.4.1/dist/css/bootstrap.min.css">
      </head>
      <!--EDIT RISK TABLE-->
      <body class="container mt-5">
        <h1>Edit Risk</h1>
        <!--send form to /updaterisk when press submit-->
        <form action="/updaterisk" method="get">
          <input type="hidden" name="id" value="${risk.id}">
          <div class="form-group">
            <label>Risk Name</label>
            <input type="text" name="title" class="form-control" value="${risk.title}" required>
          </div>
          <div class="form-group">
            <label>Likelihood (1-5):</label>
            <input type="number" name="likelihood" class="form-control" value="${risk.likelihood}" min="1" max="5" required>
          </div>
          <div class="form-group">
            <label>Impact (1-5):</label>
            <input type="number" name="impact" class="form-control" value="${risk.impact}" min="1" max="5" required>
          </div>
          <button type="submit" class="btn btn-primary">Update Risk</button>
        </form>
      </body>
      </html>
    `;
    res.send(html);

  });
});


//runs when user submits Edit form 
app.get("/updaterisk", (req, res) => {
  //get values from form
  const id = req.query.id;
  const title = req.query.title;
  //converts string to number value
  const likelihood = Number(req.query.likelihood);
  const impact = Number(req.query.impact);

  //checks if fields all have inputs, but maybe should change this since all fields might not need changed?
   if (!id || !title || !likelihood || !impact) {
    return res.send('input fields missing values');
  }

  //calculate risk score and risk level
  const riskScore = likelihood * impact;
  let riskLevel = 'Low';  // Default value

  if (riskScore >= 6 && riskScore <= 10) {
    riskLevel = 'Medium';
  } else if (riskScore >= 11 && riskScore <= 15) {
    riskLevel = 'High';
  } else if (riskScore >= 16) {
    riskLevel = 'Critical';
  }

  //update correct row in db with new values from form
  const sql = `
    UPDATE risks
    SET title = ?, likelihood = ?, impact = ?, risk_level = ?
    WHERE id = ?
    `;

  //run sql command above with values
  db.run(sql, [title, likelihood, impact, riskLevel, id], function(err){
    //error message 
    if (err){
      return res.send("Can't update risk");
    }
    req.session.message = 'Risk updated';
    //send user back to home page
    res.redirect('/home');
  });
});








/*NEXT STEPS:
2. update colours of success messages. not clear that they are different, need to set time on how long message lasts
2.2 dont like placement of message. 
3. colour code risks
4. Sort risks table 
5. change edit form so that it appears on the /home route instead of new page (optional)
6. change risk.title in table to risk.name so fields are consistently named
7. Change /updaterisk route - currently all fields to have a value but only 1 value might need edited?
8. consider features that other software uses. look at research/literature. what is helpful in agile working?
9. need to add in security features for data protection
*/