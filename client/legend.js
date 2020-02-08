/* 
  TODO
*/

var LEGEND = (function() {
  let module_export = {};

  let legend,
    LEGEND_WIDTH,
    LEGEND_HEIGHT,
    TOP_MARGIN,
    LEFT_MARGIN,
    INLINE_MARGIN,
    MAX_CHARS_PER_LINE;

  function init(svg_canvas, canvas_width, canvas_height) {
    this.LEGEND_WIDTH = canvas_width / 5;
    this.LEGEND_HEIGHT = canvas_height / 5;
    this.TOP_MARGIN = this.LEGEND_HEIGHT / 10;
    this.LEFT_MARGIN = this.LEGEND_WIDTH / 8;
    this.INLINE_MARGIN = this.LEGEND_HEIGHT / 9;
    this.MAX_CHARS_PER_LINE = 40;

    this.legend = svg_canvas
      .append("g")
      .attr("width", this.LEGEND_WIDTH)
      .attr("height", this.LEGEND_HEIGHT)
      .attr("class", "legend");
    return legend;
  }

  function bind(data) {
    this.bind_title(data[0]);
    this.bind_details(data.slice(1));
  }

  function bind_title(title) {
    return this.legend
      .append("text")
      .attr("class", "legend-title")
      .attr("x", this.LEFT_MARGIN)
      .attr("y", this.TOP_MARGIN)
      .text(title);
  }

  function bind_details(details) {
    let i;
    for (i = 0; i < details.length; i++) {
      this.legend
        .append("text")
        .attr("class", "legend-detail")
        .attr("x", this.LEFT_MARGIN)
        .attr("y", (i+2) * this.INLINE_MARGIN)
        .text(details[i]);
    }
  }

  function unbind() {
    this.legend.selectAll("*").remove()
  }

  module_export.legend = legend;
  module_export.init = init;
  module_export.bind = bind;
  module_export.bind_title = bind_title;
  module_export.bind_details = bind_details;
  module_export.unbind = unbind;

  return module_export;
})();
