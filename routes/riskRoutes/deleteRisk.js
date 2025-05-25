//require in modules from node, require in db from db.js
const express = require('express');
const router = express.Router(); //
const db = require('../../db');


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
      req.session.messageType = 'success';
      //redirect to home after deletion
      res.redirect('/home');
    });
});

//exports 
module.exports = router;