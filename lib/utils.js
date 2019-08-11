module.exports = {
  uniquify: function(items) {
    var unique_ids = [];
    var uniques = [];
    for (var i = 0; i < items.length; i++) {
      if (!unique_ids.includes(items[i].math_id)) {
        unique_ids.push(items[i].math_id);
        uniques.push(items[i]);
      }
    }
    return uniques;
  }
};
