-- think i need to look at the status field, somethings not right but not entirely sure?
BACKEND TASKS
----Definitely Add-----
2. Add filter/search button
3. Make sure new risks default to Open
4. Add description field into risk table so that more details can be seen at a glance
5. Add created_at and updated_at timestamps

----would be good to add but not essential-----
1. colour code risks in table - red for critical, green for open etc
2. update colours of success messages. not clear that they are different, need to set time on how long message lasts
   -- dont like placement of message
3. Change /updaterisk route - currently all fields to have a value but only 1 value might need edited?
4. dont require all fields to be re-entered when only one changes - user might only want to edit 1 field
5. Inline edit form on /home (modal or inline row)
6. more detailed errors to a separate file? for me to see not users

----Optional--------
1. Chart.js visualizations
   -- Risk-level distribution, status over time, etc.
2. Kkanban view of risks
3. logins
   -- only admins can delete or modify all risks?
4. GDPR or privacy notice in footer?

FRONT END TASKS
1. build a front end after back end core functions are working -- updated to do list at later date
