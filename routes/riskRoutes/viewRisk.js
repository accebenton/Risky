//VIEW RISK ROUTE - to see more of a specific risk
//require in modules from node, require in db from db.js
const express = require('express');
const router = express.Router(); 


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

//exports 
module.exports = router;