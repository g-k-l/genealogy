/*
  Contains logic related to transitioning SVGs
  from one CSS class to another.
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
    } else {
      throw "Must be either start or end";
    }
  }

  function delay(d, i) {
    return DELAY * (d.target.depth - 1) + i*DELAY_MULT;
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

  function updateLinks(selection) {
    return selection
      .attr("d", linkState("start"))
      .transition("update-links")
      .delay(function(d, i) {
        return DELAY * (d.target.depth - 1) + i*DELAY_MULT;
      })
      .duration(DURATION)
      .attr("d", linkState("end"));
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

  function updateNodes(selection) {

    function trans(d) {
      console.log(d);
      var end  = projection(d.x, d.y);
      var start;
      if (d.parent === null) {
        start = [0, 0];
      } else {
        start = projection(d.x0, d.y0);
      }
      var trans = [end[0]-start[0], end[1]-start[1]];
      // console.log(trans);
      return "translate(" + trans + ")" 
      // if (d.parent === null) {
      //   return "translate(" + projection(d.x, d.y) + ")";
      // } else {
      //   return "translate(" + projection(d.x-d.parent.x, d.y-d.parent.y) + ")";
      // }
      
    }
    return selection
      .transition("update-nodes")
      .delay(function(d, i) {
        return DELAY * (d.depth - 1) + i*DELAY_MULT;
      })
      .duration(DURATION)
      // .attr("transform", nodeState("end"));
      .attr("transform", trans); 
      // .attr("cx", function(d){
      //   return projection(d.x, d.y)[0];
      // })
      // .attr("cy", function(d){
      //   return projection(d.x, d.y)[1];
      // })
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

  function circleFadeOut(selection) {}

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

  function nameFadeOut(selection) {}

  function rotate_text(d) {
    if (d.x < Math.PI) {
      return "rotate(" + ((d.x - Math.PI / 2) * 180) / Math.PI + ")";
    } else {
      return "rotate(" + ((d.x + Math.PI / 2) * 180) / Math.PI + ")";
    }
  }

  module_export.updateLinks = updateLinks;
  module_export.updateNodes = updateNodes;
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
