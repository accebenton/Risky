//require in modules from node, require in db from db.js
const express = require('express');
const router = express.Router(); //
const db = require('../../db');


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