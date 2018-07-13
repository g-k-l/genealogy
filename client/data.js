/*
  Use (abuse?) closures to create modules
  http://www.adequatelygood.com/JavaScript-Module-Pattern-In-Depth.html

  Example of a JSON returned by .fetch_data:

  {
    "_id": "5896853e5309753bb525b654",
    "dissertation": "Über Multiplikatorgleichungen höherer Stufe im Gebiete der elliptischen Funktionen",
    "name": "Paul Friedrich Biedermann",
    "descendants": [],
    "year_grad": 1887,
    "school": "Universität Leipzig",
    "math_id": 745,
    "parent_id": 7401
  }
*/

var DATA_MODULE = (function() {
  var module_export = {};

  const REQUEST_ROOT = "/tree/";

  function children_accessor(d) {
    /* 
    need to flatten the array because it looks like:
    [[<math_id>, <name>], ...]
  */
    if (d.descendants === undefined) {
      return null;
    }
    return d.descendants.map(function(inner_arr) {
      return {
        math_id: inner_arr[0],
        name: inner_arr[1]
      };
    });
  }

  function to_comma_delimited_str(arr) {
    return arr.reduce(function(a, b) {
      return a.toString() + "," + b.toString();
    });
  }

  function uniquify(arr, key) {
    var i;
    var hashmap = {};
    for (i = 0; i < arr.length; i++) {
      hashmap[arr[i][key]] = arr[i];
    }
    return Object.values(hashmap);
  }

  var return_data = [];
  function fetch_data(math_ids, depth) {
    /*
      math_ids is a comma-delimited string e.g.
        "1,2,3,4,5". This will fetch data with math_ids
        1, 2, 3, 4, and 5.
    */
    this.return_data = [];
    MODULE = this; //need this reference in the d3.json callback
    function _fetch_data(math_ids, depth, parent_id) {
      if (depth === undefined) {
        depth = 1;
      }
      if (depth < 0) {
        return;
      }
      return d3.json(REQUEST_ROOT + math_ids).then(function(data) {
        MODULE.return_data = MODULE.return_data.concat(data);
        var i;
        var promises = [];
        for (i = 0; i < data.length; i++) {
          var node_data = data[i];
          node_data.parent_id = parent_id;
          if (node_data.descendants.length > 0) {
            var children_math_ids = to_comma_delimited_str(
              children_accessor(node_data).map(function(child) {
                return child.math_id;
              })
            );
            promises.push(
              _fetch_data(children_math_ids, depth - 1, node_data.math_id)
            );
          }
        }
        return Promise.all(promises);
      });
    }
    return _fetch_data(math_ids, depth, null);
  }

  function getFetchedData(){
    /* call this after fetch_data runs to completion
      to get the data */
    return uniquify(this.return_data, "math_id")
  }

  /* EXPORTS */
  module_export.REQUEST_ROOT = REQUEST_ROOT;
  module_export.fetch_data = fetch_data;
  module_export.children_accessor = children_accessor;
  module_export.getFetchedData = getFetchedData;
  return module_export;
})();
