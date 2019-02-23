/*
  Contains logic which handle the initial
  transition on page load.
*/

var TRANSITIONS = (function() {
  var module_export = {};

  const DELAY = 600,
    DELAY_MULT = 5,
    DURATION = 1500,
    CIRCLE_SIZE = 10;

  function linkState(start_or_end) {
    /* base on the bounded-data, calculates
      the property "d" which is the instruction 
      on how to draw the links */
    let link_generator = d3
      .linkRadial()
      .angle(function(d) {
        return d.x;
      })
      .radius(function(d) {
        return d.y;
      });

    if (start_or_end === "start") {
      return function(d) {
        return link_generator({
          source: d.source,
          target: d.source
        });
      };
    } else if (start_or_end === "end") {
      return link_generator;
    }
  }

  function delay(d, i) {
    return DELAY * (d.target.depth - 1) + i*DELAY_MULT;
  }

  function transitionLinksEnter(selection) {
    /* assign transition to the selected links */
    let transitions = selection
      .attr("d", linkState("start"))
      .transition("links")
      .delay(function(d, i) {
        return DELAY * (d.target.depth - 1) + i*DELAY_MULT;
      })
      .duration(DURATION)
      .attr("d", linkState("end"));
    return transitions;
  }

  function nodeState(start_or_end) {
    let final_location = function(d) {
      return "translate(" + projection(d.x, d.y) + ")";
    };

    let initial_location = function(d) {
      if (d.parent !== null) {
        return "translate(" + projection(d.parent.x, d.parent.y) + ")";
      } else {
        return final_location(d);
      }
    };
    if (start_or_end === "start") {
      return initial_location
    } else if (start_or_end === "end") {
      return final_location
    }
  }

  function transitionNodesEnter(selection) {
    let transitions = selection
      .attr("transform", nodeState("start"))
      .transition("nodes")
      .delay(function(d, i) {
        return DELAY * (d.depth - 1) + i*DELAY_MULT;
      })
      .duration(DURATION)
      .attr("transform", nodeState("end"))
      .attr("x0", function(d) {return d.x})
      .attr("y0", function(d) {return d.y});
    return transitions;
  }

  function circleFadeIn(selection) {
    return selection
      .attr("r", 0)
      .transition("circle-fade-in")
      .delay(function(d, i) {
        return DELAY/2 * (d.depth - 1) + i*DELAY_MULT;
      })
      .duration(DURATION)
      .attr("r", CIRCLE_SIZE);
  }

  function nameFadeIn(selection) {
    return selection
      .transition('rotate-text')
      .attr("transform", rotate_text)
      .on('end', function() {
        d3.select(this)
          .transition("name-fade-in")
          .delay(function(d, i) {
            return DELAY/2 * (d.depth - 1) + i*DELAY_MULT;
          })
          .duration(DURATION)
          .style("opacity", 1);  
      })
  }

  function rotate_text(d) {
    if (d.x < Math.PI) {
      // return "rotate(" + d.x + ")";
      return "rotate(" + ((d.x - Math.PI / 2) * 180) / Math.PI + ")";
    } else {
      return "rotate(" + ((d.x + Math.PI / 2) * 180) / Math.PI + ")";
    }
  }

  module_export.DELAY = DELAY;
  module_export.DELAY_MULT = DELAY_MULT;
  module_export.DURATION = DURATION;
  module_export.transitionLinksEnter = transitionLinksEnter;
  module_export.transitionNodesEnter = transitionNodesEnter;
  module_export.circleFadeIn = circleFadeIn;
  module_export.nameFadeIn = nameFadeIn;
  return module_export;
})();
