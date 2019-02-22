var date = new Date();
const current_year = date.getFullYear();

const GAUSS_ID = 18231,
  GAUSS_GRAD_DATE = 1799,
  SVG_CANVAS_WIDTH = Math.min(
    window.innerWidth * 0.9,
    window.innerHeight * 0.9
  ),
  SVG_CANVAS_HEIGHT = Math.min(
    window.innerWidth * 0.9,
    window.innerHeight * 0.9
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

var tree_group = svg_canvas
  .append("g")
  .attr("transform", center_root())
  .attr("id", "tree-group");


function json_to_array(data) {
  /* Map each piece of data to array form for the legend*/
  var dissertation;
  if (data.dissertation.length > LEGEND.MAX_CHARS_PER_LINE) {
    dissertation = data.dissertation.slice(0, LEGEND.MAX_CHARS_PER_LINE) + "...";
  } else {
    dissertation = data.dissertation;
  }
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

function create_tree(data) {

  var tree = d3
    .tree()
    .size([2 * Math.PI, (SVG_CANVAS_WIDTH * TREE_MARGIN_FRACTION) / 2]);

  var stratified = d3
    .stratify()
    .id(function(d) {
      return d.math_id;
    })
    .parentId(function(d) {
      return d.parent_id;
    })(data);

  var root = d3.hierarchy(stratified);
  tree(root);

  var links = tree_group
    .selectAll(".link")
    .data(root.links(), function(d){
      return d.source.data.math_id + '|' + d.target.data.math_id;
    })
    .enter()
    .append("path")
    .attr("class", "link");
    
  // console.log(root.descendants());
  var node = tree_group
    .selectAll(".node")
    .data(root.descendants(), function(d){
      return d.data.id;
    })
    .enter()
    .append("g")
    .attr("class", "node");

  var circles = node
    .append("circle")
    .attr("class", "node");

  var names = node
    .append("text")
    .attr("class", "node")
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
    });

  node.each(function(d){
    d.x0 = d.x;
    d.y0 = d.y;
  });

  initialTransitions({
    node: node,
    links: links,
    circles: circles,
    names: names
  });
}


function update_tree(data) {

  // TODO: nodeEnter the subtrees, not the whole
  // tree during update.
  var tree = d3
    .tree()
    .size([2 * Math.PI, (SVG_CANVAS_WIDTH * TREE_MARGIN_FRACTION) / 2]);

  var stratified = d3
    .stratify()
    .id(function(d) {
      return d.math_id;
    })
    .parentId(function(d) {
      return d.parent_id;
    })(data);

  var root = d3.hierarchy(stratified);
  tree(root);

  var links = tree_group
    .select(".link")
    .data(root.links(), function(d){
      return d.source.data.math_id + "|" + d.target.data.math_id;
    });
  links
    .exit()
    .remove()
  links 
    .enter()
    .append("path")
    .merge(links)
    .attr("class", "link");

  var node = tree_group
    .select(".node")
    .data(root.descendants(), function(d){
      return d.data.id;
    });
  node
    .exit()
    .remove()
  var nodeEnter = node
    .enter()
    .append("g")
    .merge(node)
    .attr("class", "node");

  console.log(nodeEnter);

  var circles = node
    .append("circle")
    .attr("class", "node");

  var names = node
    .append("text")
    .attr("class", "node")
    .style("opacity", 0)
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
    });

  // d3.selectAll(".node").selectAll("g") 
  // // node
  //   .transition('update-nodes')
  //   .delay(function(d, i) {
  //     return TRANSITIONS.DELAY * (d.target.depth - 1) + i*TRANSITIONS.DELAY_MULT;
  //   })
  //   .duration(TRANSITIONS.DURATION)
  //   .attr("transform", function(d) {
  //     return "translate(" + projection(d.x, d.y) + ")";
  //   })
  // TRANSITIONS.updateLinks(links);
  TRANSITIONS.updateNodes(node).on("end", function(){
    console.log('wtf');

  });

  // TRANSITIONS.updateNodes(nodeEnter).on("end", function(){
  //   TRANSITIONS.nameFadeIn(d3.select(this).select('text'));
  //   TRANSITIONS.circleFadeIn(d3.select(this).select('circle')).on("end", function(){
  // //   TRANSITIONS.nameFadeIn(names);  
  //   });
  // }); 

  // TRANSITIONS.nameFadeIn(node.selectAll());
  // TRANSITIONS.circleFadeIn(d3.select(this).select('circle')).on("end", function(){
  // //   TRANSITIONS.nameFadeIn(names);  
  // }) ;
  node.each(function(d){
    d.x0 = d.x;
    d.y0 = d.y;
  })

  // console.log(node);
  // console.log(links);

  // initialTransitions({
  //   node: node,
  //   links: links,
  //   circles: circles,
  //   names: names
  // });

}


function initialTransitions(ret) {
   /*
    This function is run when the page first
    loads - with the opening transitions.
  */
  // ret = create_tree(data);
  TRANSITIONS.transitionLinksEnter(ret.links);
  TRANSITIONS.transitionNodesEnter(ret.node).on("end", function() {
    // TRANSITIONS.circleFadeIn(d3.select(this).select("circle"));
    // TRANSITIONS.nameFadeIn(d3.select(this).select("text"));
    // bind mouse behavior after transitions are complete
    // otherwise mouseover/mouseout will interrupt transition
    bindNodeInteractivity(d3.select(this));
  });
  TRANSITIONS.circleFadeIn(ret.node.select("circle")).on("end", function() {
    // TRANSITIONS.nameFadeIn(d3.select(this.parentNode).select("text"));
  });
  TRANSITIONS.nameFadeIn(ret.node.select("text"));
}


function bindNodeInteractivity(selection) {
    selection.on("mouseover", function(d) {
      LEGEND.unbind();
      LEGEND.bind(json_to_array(d.data.data));
      INTERACTIVE.nodeMouseOver(this, d);
    });
    selection.on("mouseout", function(d) {
      INTERACTIVE.nodeMouseOut(this, d);
    });
    selection.on("click", function(d, i, node) {
      if (d.children === undefined & d.data.data.descendants.length === 0) {
        return
      } else if (d.children === undefined & d.data.data.descendants.length > 0) {
        DATA_MODULE.onClickFetchData(d).then(function() {
          // initialTransitions(DATA_MODULE.getFetchedData());
          var data = DATA_MODULE.getFetchedData();
          console.log(data);
          update_tree(data);
        });
      } else if (d.children.length > 0) {
        // TODO, retract/hide tree
      }
    });
}


// Entry point is right here
DATA_MODULE.fetch_data(GAUSS_ID, 3, null)
  .then(function() {
    create_tree(DATA_MODULE.getFetchedData());
  })
  .catch(function(error) {
    console.log(error);
    throw error;
  });
