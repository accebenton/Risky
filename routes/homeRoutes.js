//require in modules from node, require in db from db.js
const express = require('express');
const router = express.Router(); //
const db = require('../db');


function getStatusColour(status) {
  switch (status) {
    case 'Open': return 'open';
    case 'In Progress': return 'inprogress';
    case 'Closed': return 'closed';
    default: return 'default';
  }
}

function getLevelColour(level) {
  switch (level) {
    case 'Critical': return 'critical';
    case 'High': return 'high';
    case 'Medium': return 'medium';
    case 'Low': return 'low';
    default: return 'default';
  }
}

//HOME PAGE ROUTE
//when user clicks on html that is linked with /home this code will run
router.get('/home', (req, res) => {
    // get all risks from db, changed from const to let for sort/filter
     // for sort/filter field
    const sort = req.query.sort;
    let sql = 
      `SELECT 
        risks.id,
        risks.name,
        risks.dateCreated,
        risks.likelihood,
        risks.impact,
        risks.risk_level,
        risks.risk_status,
        users.name AS assigned_to_name
      FROM risks
      LEFT JOIN users ON risks.assigned_to = users.id
      `;

      
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
      //get users from users table for drop down in for
      db.all('SELECT id, name FROM users', [], function(err2, users) {
        if (err2) return res.send('Error loading users');

      //test, shows in-browser my rows, backend connecting to front end
      //res.send(rows);
  
      //HTML PAGE SETUP
      let html =`
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1" charset="UTF-8" />
          
          <!-- bootstrap css-->
          <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.5/dist/css/bootstrap.min.css" 
              rel="stylesheet" 
              integrity="sha384-SgOJa3DmI69IUzQ2PVdRZhwQ+dy64/BUtbMJw1MZ8t5HZApcHrRKUc4W0kG879m7" 
              crossorigin="anonymous">
          <link rel="stylesheet" href="style.css" />
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
        <!--main content-->
        <div class="d-flex flex-row main-container">
          <div class="flex-grow-1">
          <!--TOP NAVBAR-->
            <nav class="navbar">
              <div class="d-flex align-items-center w-100">
                  <!--profile icon-->
                  <div class="profile-icon text-start">
                      <a href="/profile">
                          <img src="user-icon.png" alt="Profile" width="36" height="36" class="rounded-circle">
                      </a>
                  </div>
                  <!-- search bar-->
                  <div class="search-bar-cont d-flex justify-content-center">
                    <form class="d-flex w-100 search-bar-form" role="search" method="get" action="/search">
                        <div class="input-group w-100">
                            <input type="search" name="q" class="form-control" placeholder="Search..." aria-label="Search">
                            <button class="btn btn-danger" type="submit">Search</button>
                        </div>
                  </form>
                </div>
                <div class="settings-logout-cont d-flex justify-content-end">
                  <div class="menu">
                    <!--don't need these right now
                    <ul class="nav">
                      <li class="nav-item">
                        <a class="nav-link" href="#">Settings</a>
                      </li>
                      <li class="nav-item">
                        <a class="nav-link" href="#">Logout</a>
                      </li>
                    </ul>
                  -->
                  </div>
                </div>
              </div>
            </nav>
          <!--add risk and kanban buttons-->
            <a href="/add-risk" class="btn btn-primary m-3">+ Add New Risk</a>
            <a href="/kanban" class="btn btn-outline-primary m-3">Kanban View</a>
            <div class="table table-container">
              <!--Risk table-->
              <h1>Risks Table</h1>
              <!-- SORTING INPUT FIELD -->
              <!--template literals/ternary operators change placeholder view of input field to match selected view-->
              <!-- ie if selected option matches, show selected option-->
              <form method="get" action="/home" class="mb-4 me-3">
                <label for="sort" class="form-label">Sort by:</label>
                <select name="sort" id="sort" class="form-select" onchange="this.form.submit()">
                  <option value="" ${sort === '' || !sort ? 'selected' : ''}>By ID (default)</option>
                  <option value="level" ${sort === 'level' ? 'selected' : ''}>Risk Level (Critical to Low)</option>
                  <option value="name" ${sort === 'name' ? 'selected' : ''}>Risk name (A-Z)</option>
                  <option value="assigned" ${sort === 'assigned' ? 'selected' : ''}>Assigned User (A-Z)</option>
                </select>
              </form>
              <div class="table-responsive p-4">
                  <table class="table table-bordered table-hover">
                    <thead class="table-light">
                      <tr>
                        <th>ID</th>
                        <th>Risk Name</th>
                        <th>Date Created</th>
                        <th>Status</th>
                        <th>Risk Level</th>
                        <th>Assigned To</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <!--tbody is where the info is pulled into from the backend-->
                    <tbody>`;
  
      //loop through each risk from db and add row to ht
      // 
      // ml table
      for (let i=0; i <rows.length; i++){
        const risk = rows[i];
        html += `
          <tr>
            <td><a href="/viewrisk?id=${risk.id}">${risk.id}</a></td>
            <td>${risk.name}</td>
            <td>${risk.dateCreated}</td>
            <td><span class="status-colour bg-${getStatusColour(risk.risk_status)}">${risk.risk_status}</span></td>
            <td><span class="level-colour bg-${getLevelColour(risk.risk_level)}">${risk.risk_level}</span></td>
            <td>${risk.assigned_to_name}</td>
            <!-- delete and edit buttons -->
            <td>
              <div class="action-dropdown">
                <button class="btn btn-sm btn-light dropdown-toggle" type="button" data-bs-toggle="dropdown">...</button>
                <ul class="dropdown-menu">
                  <li><a href="/editrisk?id=${risk.id}" class="btn btn-secondary btn-sm">Edit</a></li>
                  <li><a href="/deleterisk?id=${risk.id}" 
                  class="btn btn-danger btn-sm"
                  onclick="return confirm('Are you sure you want to delete this risk?');">Delete</a></li>
                </ul>
            </td>
          </tr>
        `;
      }
  
      html += ` 
                      </tbody>
                  </table>
                </div>
              </div>
            </div>
            <!--sidebar -->
            <div class="sidebar-right text-white" id="sidebar">
              <h4 class="risky-text fw-bold text-end pr-4">Risky</h4>
              <hr class="border-light">
              <h6 class="projects-text">Projects</h6>
              <ul class="list-unstyled listed-projects">
                <li><a href="#">Project A</a></li>
                <li><a href="#">Project B</a></li>
                <li><a href="#">Project C</a></li>
              </ul>
            </div>
          </div>          
        </body>
      </html>
        `;
  
  
        //sends page to browser
        res.send(html);

      });
    });
});
module.exports = router;