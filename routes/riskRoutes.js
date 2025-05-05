//require in modules from node, require in db from db.js
const express = require('express');
const router = express.Router(); //
const db = require('../db');



/*ADD RISK ROUTE */
//route for newly added risk to db--when user visits browser, it will add risk to table
router.post('/addrisk', (req, res) => {

    // takes from req.body (because its POST not GET)
    const name = req.body.name;
    const likelihood = req.body.likelihood; // scale of 1–5
    const impact = req.body.impact;     // scale of 1–5
    const assigned_to = req.body.assigned_to;
    const risk_status = req.body.risk_status;

    //check if all values are present
    if (!name || !likelihood || !impact || !assigned_to || !risk_status) {
      return res.send('Please provide name, likelihood, impact, assigned user, and status.');
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
        `INSERT INTO risks (name, likelihood, impact, risk_level, assigned_to, risk_status) VALUES (?, ?, ?, ?, ?, ?)`,
        [name, likelihood, impact, riskLevel, assigned_to, risk_status],
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
    let riskLevel = 'Low';  
  
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
      SET name = ?, likelihood = ?, impact = ?, risk_level = ?, assigned_to = ?, risk_status = ?
      WHERE id = ?
      `;
  
    //run sql command above with values
    db.run(sql, [name, likelihood, impact, riskLevel, assigned_to, risk_status, id], function(err){
      //error message 
      if (err){
        return res.send("Can't update risk");
      }
      
      req.session.message = 'Risk updated';
      //send user back to home page
      res.redirect('/home');
    });
});
//exports 
module.exports = router;