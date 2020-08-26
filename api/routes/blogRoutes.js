'use strict';
module.exports = function(app) {
  const blogEntry = require('../controllers/blogEntryController');
  app.route('/entries')
    .get(blogEntry.listAll)
    .post(blogEntry.create);

    app.route('/entries')
    .post(blogEntry.create);

  app.route('/entries/:entryId')
    .get(blogEntry.read)

    app.route('/api/entries/:entryId')
    .put(blogEntry.update)
    .delete(blogEntry.delete);
};