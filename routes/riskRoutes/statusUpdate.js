//MARK CLOSED RISK ROUTE - quick update of status field

//require in modules from node, require in db from db.js
const express = require('express');
const router = express.Router(); //
const db = require('../../db');


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

//exports 
module.exports = router;