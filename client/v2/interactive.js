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

  module_export.highlightCircleChain = highlightCircleChain;
  module_export.nodeMouseOut = nodeMouseOut;
  module_export.nodeMouseOver = nodeMouseOver;
  return module_export;
})();