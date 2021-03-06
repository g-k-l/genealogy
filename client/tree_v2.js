var date = new Date();
const current_year = date.getFullYear();

const GAUSS_ID = 18231,
  GAUSS_GRAD_DATE = 1799,
  SVG_CANVAS_WIDTH = Math.max(
    Math.min(
      window.innerWidth * 0.9,
      window.innerHeight * 0.9
    ),
    1080
  ),
  SVG_CANVAS_HEIGHT = Math.max(
    Math.min(
      window.innerWidth * 0.9,
      window.innerHeight * 0.9
    ),
    1080
  ),
  TREE_MARGIN_FRACTION = 0.8,
  CIRCLE_SIZE = 10,
  RADIAL_SCALING = current_year - GAUSS_GRAD_DATE;

var svg_canvas = d3
  .select("#genealogy")
  .append("svg")
  .attr("class", "svg-canvas")
  .attr("width", SVG_CANVAS_WIDTH)
  .attr("height", SVG_CANVAS_HEIGHT);

LEGEND.init(svg_canvas, SVG_CANVAS_WIDTH, SVG_CANVAS_HEIGHT);

function json_to_array(data) {
  /* Map each piece of data to array form for the legend*/
  let dissertation;
  if (data.dissertation.length > LEGEND.MAX_CHARS_PER_LINE)
    dissertation =
      data.dissertation.slice(0, LEGEND.MAX_CHARS_PER_LINE) + "...";
  else dissertation = data.dissertation;
  return [
    data.name,
    data.school + " (" + data.year_grad + ")",
    "Dissertation: " + dissertation,
    "Direct Descendants: " + data.descendants.length,
    "Advisor ID: " + data.parent_id
  ];
}

function center_root() {
  return (
    "translate(" + SVG_CANVAS_WIDTH / 2 + "," + SVG_CANVAS_HEIGHT / 2 + ")"
  );
}

function projection(theta, r) {
  /* converts polar coordinates to cartesian */
  return [r * Math.cos((theta -= Math.PI / 2)), r * Math.sin(theta)];
}

function adjust_radius_by_year(d) {
  if (d.parent === null) {
    return d;
  }
  let scale_factor;
  if (d.data.year_grad === undefined) {
    scale_factor = (d.parent.y + 1) / RADIAL_SCALING;
  } else {
    scale_factor = (d.data.year_grad - GAUSS_GRAD_DATE) / RADIAL_SCALING;
  }
  d.y *= Math.sqrt(scale_factor);
  return d;
}

function rotate_text(d) {
  if (d.x < Math.PI) {
    return "rotate(" + ((d.x - Math.PI / 2) * 180) / Math.PI + ")";
  } else {
    return "rotate(" + ((d.x + Math.PI / 2) * 180) / Math.PI + ")";
  }
}

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

function circleMouseOver(d) {
  highlightCircleChain.call(this, d, "orange", 12);
}

function circleMouseOut(d) {
  highlightCircleChain.call(this, d, "steelblue", 10);
}

function draw_tree(data) {
  var tree_group = svg_canvas
    .append("g")
    .attr("transform", center_root())
    .attr("id", "tree-group");

  /*
    Assume coordinates are Polar, then convert
    back to cartesian representation.
  */
  var tree = d3
    .tree()
    .size([2 * Math.PI, (SVG_CANVAS_WIDTH * TREE_MARGIN_FRACTION) / 2]);

  var stratifed = d3
    .stratify()
    .id(function(d) {
      return d.math_id;
    })
    .parentId(function(d) {
      return d.parent_id;
    })(data);

  root = d3.hierarchy(stratifed);
  tree(root);

  var links = tree_group
    .selectAll(".link")
    .data(root.links())
    .enter()
    .append("path")
    .attr("class", "link");

  TRANSITIONS.transitionLinks(links);

  var node = tree_group
    .selectAll(".node")
    .data(root.descendants())
    .enter()
    .append("g")
    .attr("class", "node");

  var circles = node.append("circle");

  TRANSITIONS.transitionNodes(node).each(function() {
    // bind mouse behavior after transitions are complete
    // otherwise mouseover/mouseout will interrupt transition
    d3.select(this).on("mouseover", function(d) {
      LEGEND.unbind();
      LEGEND.bind(json_to_array(d.data.data));
      circleMouseOver.call(this, d);
    });
    d3.select(this).on("mouseout", circleMouseOut);
  });

  TRANSITIONS.circleFadeIn(circles);

  var names = node
    .append("text")
    .attr("class", "name")
    .text(function last_name(d) {
      var name_parts = d.data.data.name.split(" ");
      return name_parts[name_parts.length - 1];
    })
    .attr("dy", "0.31em")
    .attr("x", function(d) {
      return d.x < Math.PI === !d.children
        ? CIRCLE_SIZE + 1
        : -(CIRCLE_SIZE + 1);
    })
    .attr("text-anchor", function(d) {
      return d.x < Math.PI === !d.children ? "start" : "end";
    })
    .attr("transform", rotate_text);

  TRANSITIONS.nameFadeIn(names);
}

DATA_MODULE.fetch_data(GAUSS_ID, 4)
  .then(function() {
    draw_tree(DATA_MODULE.getFetchedData());
  })
  .catch(function(error) {
    console.log(error);
    throw error;
  });
