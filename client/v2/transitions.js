/*
  Contains logic related to transitioning SVGs
  from one CSS class to another.
*/

var TRANSITIONS = (function() {
  var module_export = {};

  const DELAY = 750,
    DELAY_MULT = 25,
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
    } else {
      throw "Must be either start or end";
    }
  }

  function transitionLinks(selection, start_state, end_state) {
    /* assign transition to the selected links */
    let transitions = selection
      .attr("d", start_state)
      .transition("links")
      .delay(function(d, i) {
        return DELAY * (d.target.depth - 1) + i*DELAY_MULT;
      })
      .duration(DURATION)
      .attr("d", end_state);
    return transitions;
  }

  function transitionLinksEnter(selection) {
    return transitionLinks(selection, linkState("start"), linkState("end"));
  }

  function transitionLinksExit(selection) {
    return transitionLinks(selection, linkState("end"), linkState("start"));
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
    } else {
      throw "Must be either start or end"
    }
  }

  function transitionNodes(selection, start_state, end_state) {
    let transitions = selection
      .attr("transform", start_state)
      .transition("nodes")
      .delay(function(d, i) {
        return DELAY * (d.depth - 1) + i*DELAY_MULT;
      })
      .duration(DURATION)
      .attr("transform", end_state);
    return transitions;
  }

  function transitionNodesEnter(selection) {
    return transitionNodes(selection, nodeState("start"), nodeState("end"))
  }

  function transitionNodesExit(selection) {
    return transitionNodes(selection, nodeState("end"), nodeState("start"))
  }

  function circleFadeIn(selection) {
    let transitions = selection
      .attr("r", 0)
      .transition("circle-fade-in")
      .delay(function(d, i) {
        return DELAY * (d.depth - 1) + i*DELAY_MULT;
      })
      .duration(DURATION)
      .attr("r", CIRCLE_SIZE);
    return transitions;
  }

  function circleFadeOut(selection) {}

  function nameFadeIn(selection) {
    let transitions = selection
      .style("opacity", 0)
      .transition("name-fade-in")
      .delay(function(d, i) {
        return DELAY * d.depth + i*DELAY_MULT;
      })
      .duration(DURATION)
      .style("opacity", 1);
    return transitions;
  }

  function nameFadeOut(selection) {}


  module_export.DELAY = DELAY;
  module_export.DELAY_MULT = DELAY_MULT;
  module_export.DURATION = DURATION;
  module_export.transitionLinksEnter = transitionLinksEnter;
  module_export.transitionLinksExit = transitionLinksExit;
  module_export.transitionNodesEnter = transitionNodesEnter;
  module_export.transitionNodesExit = transitionNodesExit;
  module_export.circleFadeIn = circleFadeIn;
  module_export.nameFadeIn = nameFadeIn;
  return module_export;
})();
