'use strict';
module.exports = function(app,authRoute) {
  const blogEntry = require('../controllers/blogEntryController');
  
  authRoute.post('/entries', blogEntry.create);
  authRoute.put('/entries/:entryId', blogEntry.update);
  authRoute.delete('/entries/:entryId', blogEntry.delete);

  app.route('/entries')
    .get(blogEntry.listAll);

  app.route('/entries/:entryId')
    .get(blogEntry.read)

};