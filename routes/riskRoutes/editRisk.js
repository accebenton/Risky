//EDIT RISK ROUTE

//require in modules from node, require in db from db.js
const express = require('express');
const router = express.Router(); //
const db = require('../../db');


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

//exports 
module.exports = router;