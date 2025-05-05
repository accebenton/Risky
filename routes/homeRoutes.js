//require in modules from node, require in db from db.js
const express = require('express');
const router = express.Router(); //
const db = require('../db');

//HOME PAGE ROUTE
//when user clicks on html that is linked with /home this code will run
router.get('/home', (req, res) => {
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
    } else if (sort ==='name'){
      sql += ' ORDER BY name ASC';
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
                <label for="name">Risk Name:</label>
                <input type="text" class="form-control" id="name" name="name" required>
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
                <select class="form-control" id="status" name="status" required>
                  <!-- selected open as default, so all new risks have open status-->
                  <option value="Open" selected>Open</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Closed">Closed</option>
                </select>
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
              <!--template literals/ternary operators change placeholder view of input field to match selected view-->
              <!-- ie if selected option matches, show selected option-->
              <form method="get" action="/home" class="mb-3">
                <label for="sort" class="form-label">Sort by:</label>
                <select name="sort" id="sort" class="form-select" onchange="this.form.submit()">
                  <option value="" ${sort === '' || !sort ? 'selected' : ''}>By ID (default)</option>
                  <option value="score" ${sort === 'score' ? 'selected' : ''}>Risk Score (High to Low)</option>
                  <option value="level" ${sort === 'level' ? 'selected' : ''}>Risk Level (Critical to Low)</option>
                  <option value="name" ${sort === 'name' ? 'selected' : ''}>Risk name (A-Z)</option>
                  <option value="assigned" ${sort === 'assigned' ? 'selected' : ''}>Assigned User (A-Z)</option>
                </select>
              </form>
              <form method="get" action ="/home" class="row g-2 mb-3">
                <table class="risks table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Risk Name</th>
                      <th>Likelihood</th>
                      <th>Impact</th>
                      <th>Status</th>
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
            <td>${risk.name}</td>
            <td>${risk.likelihood}</td>
            <td>${risk.impact}</td>
            <td>${risk.riskStatus}</td>
            <td>${risk.risk_level}</td>
            <td>${risk.assigned_to}</td>
            <!-- delete and edit buttons -->
            <td>
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

module.exports = router;