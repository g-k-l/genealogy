/*
  Contains logic related to transitioning SVGs
  from one CSS class to another.
*/

var TRANSITIONS = (function() {
  var module_export = {};

  const DELAY = 600,
    DURATION = 1500;

  function transitionLinks(selection) {
    selection
      .attr("d", function(d) {
        return d3.linkRadial()
          .angle(function(d) {
            return d.x;
          })
          .radius(function(d) {
            return d.y;
          })({
          source: d.source,
          target: d.source
        });
      })
      .transition("links")
      .delay(function(d) {
        return DELAY * d.target.depth;
      })
      .duration(DURATION)
      .attr(
        "d",
        d3.linkRadial()
          .angle(function(d) {
            return d.x;
          })
          .radius(function(d) {
            return d.y;
          })
      );
    return selection;
  }

  module_export.DELAY = DELAY;
  module_export.DURATION = DURATION;
  module_export.transitionLinks = transitionLinks;
  return module_export
})();
