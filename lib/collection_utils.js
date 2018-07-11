utils = require("./utils");

module.exports = {
  init: function(collection) {
    this.collection = collection;
    (this.fetchById = function(math_ids, callback) {
      this.collection
        .find({ math_id: { $in: math_ids } })
        .toArray(function(err, items) {
          if (err) {
            throw err;
          } else {
            callback(utils.uniquify(items));
          }
        });
    }),
      (this.fetchByName = function(math_name, callback) {
        this.collection
          .find({ name: { $regex: math_name } })
          .toArray(function(err, items) {
            if (err) {
              throw err;
            } else {
              callback(utils.uniquify(items));
            }
          });
      }),\
    return this;
  }
};
