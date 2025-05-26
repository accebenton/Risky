//EDIT RISK ROUTE

//require in modules from node, require in db from db.js
const express = require('express');
const router = express.Router(); //
const db = require('../../db');

router.post('/updaterisk', (req, res) => {
  const { id, title, likelihood, impact, risk_status, assigned_to } = req.body;

  const sql = `UPDATE risks SET name = ?, likelihood = ?, impact = ?, risk_status = ?, assigned_to = ? WHERE id = ?`;

  db.run(sql, [title, likelihood, impact, risk_status, assigned_to, id], function(err) {
    if (err) {
      return res.send('Update failed.');
    }
    res.redirect('/home');
  });
});



//this stays at get because the edit risk route is navigated to in browser to show form
router.get('/editrisk', (req, res) => {
    // edit a risk that is already logged to table
    const id = req.query.id;
    //send error if id not given
    if(!id){
      return res.send('No id given');
    }

    db.get('SELECT * FROM risks WHERE id = ?', [id], (err, risk) => {
      if (err) return res.send('Error fetching risk');
      if (!risk) return res.send('No risk found');

      db.all('SELECT id, name FROM users', [], (err, users) => {
      if (err) return res.send('Error loading users');

      //HTML form appears once click edit button
      let html = `
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
              <title>Edit Risk</title>
              </head>
              <!--EDIT RISK TABLE-->
              <body class="bg-light">
                <div class="container mt-5">
                  <div class="bg-white p-4 rounded shadow mx-auto" style="max-width: 900px;">

                    <h1 class="mb-4">Edit Risk</h1>

                    <!--send form to /updaterisk when press submit-->
                    <form action="/updaterisk" method="POST">
                      <input type="hidden" name="id" value="${risk.id}">
                      <div class="mb-4">
                        <label for="title" class="form-label">Risk Name:</label>
                        <input type="text" id="title" name="title" class="form-control" required value="${risk.name}" placeholder="Risk Name">
                      </div>
                      <div class="mb-4">
                        <label for="likelihood" class="form-label">Likelihood (1-5):</label>
                        <input type="number" id="likelihood" name="likelihood" class="form-control" value="${risk.likelihood}" min="1" max="5" required>
                      </div>
                      <div class="mb-4">
                        <label for="impact" class="form-label">Impact (1-5):</label>
                        <input type="number" id="impact" name="impact" class="form-control" value="${risk.impact}" min="1" max="5" required>
                      </div>
                      <div class="mb-4">
                        <label for="status" class="form-label">Status:</label>
                        <select class="form-control" id="status" name="risk_status" required>
                        <!-- selected open as default, so all new risks have open status-->
                        <option value="Open" selected>Open</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Closed">Closed</option>
                        </select>
                      </div>
                      <div class="mb-4">
                        <label for="assign_to" class="form-label">Assign To:</label>
                        <select class="form-control" id="assigned_to" name="assigned_to" required>
                            ${users.map(user => `<option value="${user.id}">${user.name}</option>`).join('')}
                        </select>
                      </div>
                      <div class="d-flex justify-content-between align-items-center mt-4">
                        <a href="/home" class="btn btn-secondary">Back to Home</a>
                        <button type="submit" class="btn add-new-risk">Update Risk</button>
                      </div>
                    </form>

                  </div>
                </div>

              </body>
            </html>
      `;
        res.send(html);
      });
    });
});

//exports 
module.exports = router;