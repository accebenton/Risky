//UPDATE RISK ROUTE
//require in modules from node, require in db from db.js
const express = require('express');
const router = express.Router(); //
const db = require('../../db');

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
    console.log('UPDATE RISK › req.body =', req.body);



  
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

//exports 
module.exports = router;