//require in modules from node, require in db from db.js
const express = require('express');
const router = express.Router(); //
const db = require('../../db');
const { getFormattedDate } = require('../../functions/formatDate.js'); 

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
            req.session.messageType = 'success';
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
                <title>Add New Risk</title>
            </head>
            <body class="bg-light">
                <div class="container mt-5">
                    <div class="bg-white p-4 rounded shadow mx-auto">
                        <h1 class="mb-4">Add a New Risk</h1>
                        <form action="/addrisk" method="POST">
                            <!--risk name input field-->
                            <div class="mb-4">
                                <label for="name" class="form-label">Risk Name:</label>
                                <input type="text" class="form-control" id="name" name="name" required  placeholder="Unsecured API, Scope Creep, SQL Injection">
                            </div>
                            <!--risk likelihood input-->
                            <div class="mb-4">
                                <label for="likelihood" class="form-label">Likelihood (1-5):</label>
                                <input type="number" class="form-control" id="likelihood" name="likelihood" min="1" max="5" required>
                            </div>
                            <!--risk impact input-->
                            <div class="mb-4">
                                <label for="impact" class="form-label">Impact (1-5):</label>
                                <input type="number" class="form-control" id="impact" name="impact" min="1" max="5" required>
                            </div>
                            <!-- risk status input-->
                            <div class="mb-4">
                                <label for="status" class="form-label">Status:</label>
                                <select class="form-control" id="status" name="risk_status" required>
                                <!-- selected open as default, so all new risks have open status-->
                                <option value="Open" selected>Open</option>
                                <option value="In Progress">In Progress</option>
                                <option value="Closed">Closed</option>
                                </select>
                            </div>
                            <!--risk description input-->
                            <div class="mb-4">
                                <label for="name" class="form-label">Description:</label>
                                <textarea class="form-control" id="description" name="description" rows="3"  placeholder="Please add more details e.g. This API is public and lacks auth. Data may be exposed."></textarea>
                            </div>
                            <!-- assigned to user input-->
                            <div class="mb-4">
                                <label for="assigned_to" class="form-label">Assign to:</label>
                                <!--insert drop down menu for users to choose another user rather than free type-->
                                <select class="form-control" id="assigned_to" name="assigned_to" required></option>
                                  <option value="" disabled selected hidden>Select a user</option>
                                    ${users.map(user => `<option value="${user.id}">${user.name}</option>`).join('')}
                                </select>
                            </div>
                            <div class="mb-4">
                                <label for="mitigation" class="form-label">Mitigation (optional):</label>
                                <textarea class="form-control" id="mitigation" name="mitigation" rows="3" placeholder="e.g. Require API tokens, validate inputs, use HTTPS..."></textarea>
                            </div>
                            <div class="d-flex justify-content-between align-items-center mt-4">
                              <a href="/home" class="btn btn-secondary">Back to Home</a>
                              <button type="submit" class="btn add-new-risk">Add Risk</button>
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

module.exports = router;