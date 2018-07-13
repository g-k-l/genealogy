/*
  Contains logic related to transitioning SVGs
  from one CSS class to another.
*/

var TRANSITIONS = (function() {
  var module_export = {};

  const DELAY = 600,
    DURATION = 1500;

  function transitionLinks(selection) {

    /* base on the bounded-data, calculates
      the property "d" which is the instruction 
      on how to draw the links */
    var link_generator = d3
      .linkRadial()
      .angle(function(d) {
        return d.x;
      })
      .radius(function(d) {
        return d.y;
      });

    /* assign transition to the selected links */
    selection
      .attr("d", function(d) {
        return link_generator({
          source: d.source,
          target: d.source
        });
      })
      .transition("links")
      .delay(function(d) {
        return DELAY * d.target.depth;
      })
      .duration(DURATION)
      .attr("d", link_generator);
    return selection;
  }

  module_export.DELAY = DELAY;
  module_export.DURATION = DURATION;
  module_export.transitionLinks = transitionLinks;
  return module_export;
})();
