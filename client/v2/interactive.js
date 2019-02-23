/*
    Contains behavior of on-click, on-mouseover, etc.
*/

var INTERACTIVE = (function() {
  let module_export = {};

  function highlightCircleChain(d, color, radius) {
    d3.select(this)
      .select("circle")
      .style("stroke", color)
      .attr("r", radius);

    let current = d;
    while (true) {
      d3.selectAll(".node")
        .filter(function(p) {
          return current.parent === p;
        })
        .select("circle")
        .style("stroke", color)
        .attr("r", radius);
      if (current.parent === null) {
        break;
      }
      current = current.parent;
    }
  }

  function nodeMouseOver(node, d) {
    /* TODO: factor out colors as constants*/
    highlightCircleChain.call(node, d, "orange", 12);
  }

  function nodeMouseOut(node, d) {
    /* TODO: factor out colors as constants
            probably need a constant file that is
            loaded first - since constants like color
            need to be shared across js files */
    highlightCircleChain.call(node, d, "steelblue", 10);
  }

  function updateNodes(selection) {
    // console.log(selection);
    let transitions = selection
      // .attr("transform", nodeState("start"))
      .transition("update-nodes")
      .delay(function(d, i) {
        return TRANSITIONS.DELAY + i*TRANSITIONS.DELAY_MULT;
      })
      .duration(TRANSITIONS.DURATION)
      .attr("transform", function(d) {
        // console.log(d.x);
        console.log(d3.select(this).attr('x0'));

        // var new_loc = projection(d.x, d.y);
        // return "translate(" + [
        //   new_loc[0] - d3.select(this).attr('x'),
        //   new_loc[1] - d3.select(this).attr('y')] + ")";
        // return "translate(" + 
        //   projection(
        //     d.x - d3.select(this).attr('x0'),
        //     d.y - d3.select(this).attr('y0')) + ")";
        var x0 = d3.select(this).attr('x0');
        var y0 = d3.select(this).attr('y0');
        return "translate(" + 
          projection(
            x0 +  Math.atan2(d.y*Math.sin(d.x+x0), y0 - d.y*Math.cos(d.x+x0)),
            Math.sqrt(y0**2 + d.y**2 - 2*d.y*y0*Math.cos(d.x+x0))) + ")";
      })
    return transitions;
  } 

  function updateLinks(selection) {
    return selection
      .transition("update-links")
      .delay(function(d, i) {
        return DELAY + i*DELAY_MULT;
      })
      .duration(DURATION)
  }
  
  module_export.highlightCircleChain = highlightCircleChain;
  module_export.nodeMouseOut = nodeMouseOut;
  module_export.nodeMouseOver = nodeMouseOver;
  module_export.updateNodes = updateNodes;

  return module_export;
})();