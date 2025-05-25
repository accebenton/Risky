//require in modules from node, require in db from db.js
const express = require('express');
const router = express.Router(); //
const db = require('../db');

//function for formatting timestamp
function getFormattedDate() {
  const now = new Date();

  const day = String(now.getDate()).padStart(2, '0');
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const year = String(now.getFullYear()).slice(2);

  let hours = now.getHours();
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const ampm = hours >= 12 ? 'pm' : 'am';
  hours = hours % 12;
  hours = hours ? hours : 12;

  return `${day}/${month}/${year}, ${hours}:${minutes}${ampm}`;
}
/*ADD RISK ROUTE */
//post route for submitting form
router.post('/addrisk', (req, res) => {
  //debug server side  
  //console.log('/addrisk called');
    // takes from req.body (because its POST not GET)
    const name = req.body.name;
    const date_created = getFormattedDate();
    const likelihood = req.body.likelihood; // scale of 1–5
    const impact = req.body.impact;     // scale of 1–5
    const description = req.body.description || null;
    const assigned_to = req.body.assigned_to;
    const risk_status = req.body.risk_status;
    const mitigation = req.body.mitigation || null;

    //check if all values are present
    if (!name || !likelihood || !impact || !assigned_to || !risk_status) {
      return res.send('Please provide name, likelihood, impact, assigned user, and status.');
    }

    //calculate risk from OWASP matrix
    const riskScore = likelihood * impact;
    let risk_level = 'Low';

    if (riskScore >= 6 && riskScore <= 10) {
      risk_level = 'Medium';
    } else if (riskScore >= 11 && riskScore <= 15) {
      risk_level = 'High';
    } else if (riskScore >= 16) {
      risk_level = 'Critical';
    }

    //insert into db
    db.run(
        `INSERT INTO risks (name, date_created, likelihood, impact, risk_status, risk_level, assigned_to, description, mitigation, last_updated) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [name, date_created, likelihood, impact, risk_status, risk_level, assigned_to, description, mitigation, null],
        /*this function runs after code is inserted - if error, then return (response.send) msg
        to browser. if not, risk added*/
        function(err) {
            if (err) {
              //debugging on server side 
              //console.error('ERROR:', err.message);
              return res.send('Something went wrong.');
            }
            req.session.message = 'Risk added';
            res.redirect('/home');
          }
    );
});
//get route displays form
router.get('/add-risk', (req, res) => {
  db.all('SELECT id, name FROM users', [], (err, users) => {
    if (err) return res.send('Error loading users');

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Add Risk</title>
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.5/dist/css/bootstrap.min.css" rel="stylesheet">
      </head>
      <body class="container mt-4">
        <h1>Add a New Risk</h1>
        <form action="/addrisk" method="POST">
          <!--risk name input field-->
          <div class="form-group">
            <label for="name">Risk Name:</label>
            <input type="text" class="form-control" id="name" name="name" required  placeholder="Unsecured API, Scope Creep, SQL Injection">
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
          <!-- risk status input-->
          <div class="form-group">
            <label for="status">Status:</label>
            <select class="form-control" id="status" name="risk_status" required>
              <!-- selected open as default, so all new risks have open status-->
              <option value="Open" selected>Open</option>
              <option value="In Progress">In Progress</option>
              <option value="Closed">Closed</option>
            </select>
          </div>
          <!--risk description input-->
          <div class="form-group">
            <label for="name">Description:</label>
            <textarea class="form-control" id="description" name="description" rows="3"  placeholder="Please add more details e.g. This API is public and lacks auth. Data may be exposed."></textarea>
          </div>
          <!-- assigned to user input-->
            <div class="form-group">
              <label for="assigned_to">Assign to:</label>
              <!--insert drop down menu for users to choose another user rather than free type-->
              <select class="form-control" id="assigned_to" name="assigned_to" required>
                ${users.map(user => `<option value="${user.id}">${user.name}</option>`).join('')}
              </select>
              <div class="form-group">
                <label for="mitigation">Mitigation (optional):</label>
                <textarea class="form-control" id="mitigation" name="mitigation" rows="3" placeholder="e.g. Require API tokens, validate inputs, use HTTPS..."></textarea>
              </div>
            </div>
            <!-- Submit button -->
            <button type="submit" class="btn btn-primary">Add Risk</button>
        </form>
      </body>
      </html>
    `;

    res.send(html);
  });
});

//DELETE RISK ROUTE
router.get('/deleterisk', (req, res) => {
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

//MARK CLOSED RISK ROUTE
router.get('/mark-closed', (req, res) => {
    //get id from URL ie ?id=3
    const id= req.query.id;
  
    //check id was found
    if(!id){
      return res.send('No ID found');
    }
  
    //run sql query to delete ID's row
    const sql = `
      UPDATE risks
      SET risk_status = 'Closed',
      last_updated = ?
      WHERE id = ?
    `;;
    
    const now = new Date().toISOString();

    db.run(sql, [now, id], function(err) {
      if (err) {
        console.error('Error. Failed to mark as closed:', err.message);
        return res.send("Failed to update status.");
      }
      //for success message
      req.session.message = 'Risk Closed';
      //redirect to home after update
      res.redirect('/home');
    });
});


//EDIT RISK ROUTE
//this stays at get because the edit risk route is navigated to in browser to show form
router.get('/editrisk', (req, res) => {
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
          <name>Edit Risk</name>
          <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@4.4.1/dist/css/bootstrap.min.css">
        </head>
        <!--EDIT RISK TABLE-->
        <body class="container mt-5">
          <h1>Edit Risk</h1>
          <!--send form to /updaterisk when press submit-->
          <form action="/updaterisk" method="POST">
            <input type="hidden" name="id" value="${risk.id}">
            <div class="form-group">
              <label>Risk Name</label>
              <input type="text" name="name" class="form-control" value="${risk.name}" >
            </div>
            <div class="form-group">
              <label>Likelihood (1-5):</label>
              <input type="number" name="likelihood" class="form-control" value="${risk.likelihood}" min="1" max="5">
            </div>
            <div class="form-group">
              <label>Impact (1-5):</label>
              <input type="number" name="impact" class="form-control" value="${risk.impact}" min="1" max="5">
            </div>
            <!-- risk status input-->
              <div class="form-group">
                <label for="status">Status:</label>
                <select class="form-control" id="status" name="status">
                  <!-- selected open as default, so all new risks have open status-->
                  <option value="Open" selected>Open</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Closed">Closed</option>
                </select>
              </div>
              <!-- assigned to user input-->
                <div class="form-group">
                  <label for="assigned_to">Assign to:</label>
                  <input type="text" class="form-control" id ="assigned_to" name="assigned_to" value="${risk.assigned_to}">
                </div>
            <button type="submit" class="btn btn-primary">Update Risk</button>
          </form>
        </body>
        </html>
      `;
      res.send(html);
  
    });
});
  
//UPDATE RISK ROUTE
//runs when user submits Edit form 
router.post("/updaterisk", (req, res) => {
    //get values from form
    const id = req.body.id;
    const name = req.body.name;
    //converts string to number value
    const likelihood = Number(req.body.likelihood);
    const impact = Number(req.body.impact);
    const assigned_to = req.body.assigned_to;
    const risk_status = req.body.status;

    // test because not sure whats causing error message
    //console.log('UPDATE RISK › req.body =', req.body);

  
    //checks if fields all have inputs, but maybe should change this since all fields might not need changed?
     if (!id || !name || !likelihood || !impact || !assigned_to || !risk_status) {
      return res.send('input fields missing values');
    }
  
    //calculate risk score and risk level
    const riskScore = likelihood * impact;
    let risk_level = 'Low';  
  
    if (riskScore >= 6 && riskScore <= 10) {
      risk_level = 'Medium';
    } else if (riskScore >= 11 && riskScore <= 15) {
      risk_level = 'High';
    } else if (riskScore >= 16) {
      risk_level = 'Critical';
    }
  
    //update correct row in db with new values from form
    const sql = `
      UPDATE risks
      SET name = ?, likelihood = ?, impact = ?, risk_level = ?, assigned_to = ?, risk_status = ?
      WHERE id = ?
      `;
  
    //run sql command above with values
    db.run(sql, [name, likelihood, impact, risk_level, assigned_to, risk_status, id], function(err){
      //error message 
      if (err){
        return res.send("Can't update risk");
      }
      
      req.session.message = 'Risk updated';
      //send user back to home page
      res.redirect('/home');
    });
});

//VIEW RISK ROUTE - to see more of a specific risk
router.get('/viewrisk', (req, res) => {
  const id = req.query.id;
  
  db.get(`
    SELECT 
      risks.id,
      risks.name,
      risks.date_created,
      risks.likelihood,
      risks.impact,
      risks.risk_level,
      risks.risk_status,
      risks.description,
      risks.last_updated,
      users.name AS assigned_to_name
    FROM risks
    LEFT JOIN users ON risks.assigned_to = users.id
    WHERE risks.id = ?`
    , [id], (err, risk) => {
    if (err) return res.send('Error loading risk.');
    if (!risk) return res.send('Risk not found.');

    // HTML
    let html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>View Risk</title>
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.5/dist/css/bootstrap.min.css" rel="stylesheet">
      </head>
      <body class="container mt-5">
        <h1>${risk.name}</h1>
        <p><strong>Assigned To:</strong> ${risk.assigned_to_name}</p>
        <p><strong>Date Created:</strong> ${risk.date_created}</p>
        <p><strong>Last Updated:</strong> ${risk.last_updated || 'Not updated yet'}</p>
        <p><strong>Status:</strong> ${risk.risk_status}</p>
        <p><strong>Likelihood:</strong> ${risk.likelihood}</p>
        <p><strong>Impact:</strong> ${risk.impact}</p>
        <p><strong>Risk Level:</strong> ${risk.risk_level}</p>
        <p><strong>Description:</strong> ${risk.description || 'No description provided'}</p>
        <p><strong>Suggested Mitigation:</strong> ${risk.mitigation || 'No suggestion provided.'}</p>
        <a href="/home" class="btn btn-secondary mt-3">Back to Home</a>
      </body>
      </html>
    `;

    res.send(html);
  });
});


//KANBAN VIEW
router.get('/kanban', (req, res) => {
  const sql = `
    SELECT 
      risks.id,
      risks.name,
      risks.risk_status,
      risks.risk_level,
      users.name AS assigned_to_name
    FROM risks
    LEFT JOIN users ON risks.assigned_to = users.id
  `;

  db.all(sql, [], (err, risks) => {
    if (err) return res.send('Error loading risks');

    //group risks by status
    const grouped = {
      'Open': [],
      'In Progress': [],
      'Closed': []
    };

    for (let risk of risks) {
      if (grouped[risk.risk_status]) {
        grouped[risk.risk_status].push(risk);
      }
    }

    //HTML
    let html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Kanban View</title>
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.5/dist/css/bootstrap.min.css" rel="stylesheet">
        <style>
          .kanban-column {
            border: 1px solid #ccc;
            padding: 10px;
            min-height: 300px;
            width: 30%;
            float: left;
            margin-right: 10px;
            background: #f8f9fa;
          }
          .risk-card {
            background: white;
            border: 1px solid #ccc;
            padding: 10px;
            margin-bottom: 10px;
            border-radius: 4px;
          }
        </style>
      </head>
      <body class="p-4">
        <h1>Kanban Board</h1>
        <div class="d-flex justify-content-between">

          <div class="kanban-column">
            <h3>Open</h3>
            ${grouped['Open'].map(r => `
              <div class="risk-card">
                <strong>${r.name}</strong><br>
                Level: ${r.risk_level}<br>
                Assigned to: ${r.assigned_to_name || 'Unassigned'}
              </div>
            `).join('')}
          </div>

          <div class="kanban-column">
            <h3>In Progress</h3>
            ${grouped['In Progress'].map(r => `
              <div class="risk-card">
                <strong>${r.name}</strong><br>
                Level: ${r.risk_level}<br>
                Assigned to: ${r.assigned_to_name || 'Unassigned'}
              </div>
            `).join('')}
          </div>

          <div class="kanban-column">
            <h3>Closed</h3>
            ${grouped['Closed'].map(r => `
              <div class="risk-card">
                <strong>${r.name}</strong><br>
                Level: ${r.risk_level}<br>
                Assigned to: ${r.assigned_to_name || 'Unassigned'}
              </div>
            `).join('')}
          </div>

        </div>
        <div style="clear: both; margin-top: 20px;">
          <a href="/home" class="btn btn-secondary">Back to Home</a>
        </div>
      </body>
      </html>
    `;

    res.send(html);
  });
});



//exports 
module.exports = router;