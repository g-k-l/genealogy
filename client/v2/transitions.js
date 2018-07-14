/*
  Contains logic related to transitioning SVGs
  from one CSS class to another.
*/

var TRANSITIONS = (function() {
  var module_export = {};

  const DELAY = 750,
    DURATION = 1500,
    CIRCLE_SIZE = 10;

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
        return DELAY * (d.target.depth - 1);
      })
      .duration(DURATION)
      .attr("d", link_generator);
    return selection;
  }

  function transitionNodes(selection) {
    var final_location = function(d) {
      return "translate(" + projection(d.x, d.y) + ")";
    };

    var initial_location = function(d) {
      if (d.parent !== null) {
        return "translate(" + projection(d.parent.x, d.parent.y) + ")";
      } else {
        return final_location(d);
      }
    };
    selection
      .attr("transform", initial_location)
      .transition("nodes")
      .delay(function(d) {
        return DELAY * (d.depth - 1);
      })
      .duration(DURATION)
      .attr("transform", final_location);
    return selection;
  }

  function circleFadeIn(selection) {
    selection
      .attr("r", 0)
      .transition("circle-fade-in")
      .delay(function(d) {
        return DELAY * (d.depth - 1);
      })
      .duration(DURATION)
      .attr("r", CIRCLE_SIZE);
    return selection;
  }

  function nameFadeIn(selection) {
    selection
      .style("opacity", 0)
      .transition("name-fade-in")
      .delay(function(d) {
        return DELAY * d.depth;
      })
      .duration(DURATION)
      .style("opacity", 1);
    return selection;
  }

  function transitionNames(selection) {}

  module_export.DELAY = DELAY;
  module_export.DURATION = DURATION;
  module_export.transitionLinks = transitionLinks;
  module_export.transitionNodes = transitionNodes;
  module_export.circleFadeIn = circleFadeIn;
  module_export.nameFadeIn = nameFadeIn;
  return module_export;
})();
