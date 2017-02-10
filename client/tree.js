/* INITIAL SETUP */

var margin = {
		top: 80,
		right: 200,
		bottom: 20,
		left: 250
	},
	width = 1900 - margin.right - margin.left,
	height = 850 - margin.top - margin.bottom,
	year_depth_mult = 12;

var i = 0,
	duration = 750,
	root,
	children_lim = 15;

var tree = d3.layout.tree()
	.size([height, width])
	.separation(function (a, b) {
		return a.parent == b.parent ? 1 : 2;
	});

var diagonal = d3.svg.diagonal()
	.projection(function (d) {
		return [d.y, d.x];
	});

var tip = d3.tip()
	.attr('class', 'd3-tip')
	.offset([-10, 0])
	.html(function (d) {
		return "<strong>Year:</strong> <span style='color:white'>" + d.year_grad + "</span>";
	})

var svg_canvas = d3.select("body")
	.append("svg")
	.attr("width", width + margin.right + margin.left)
	.attr("height", height + margin.top + margin.bottom)

// define gradients used in this project
var leftGradient = d3.select("svg")
	.append('defs')
	.append('radialGradient')
	.attr('id', 'leftGradient');

leftGradient.append('stop')
	.attr("offset", "5%")
	.attr("stop-color", "#F0F8FF");
leftGradient.append('stop')
	.attr("offset", "95%")
	.attr("stop-color", "#FFFFFF");

d3.select("svg")
	.append("rect")
	.attr("width", margin.left * 0.75)
	.attr("height", height)
	.attr("fill-opacity", 1)
	.attr("fill", "url(#leftGradient)");

var svg = svg_canvas
	.append("g")
	.attr("transform", "translate(" + margin.left + "," + margin.top / 2 + ")");

// Provides backward traversal via left rectangular region
d3.select("svg")
	.append("rect")
	.attr("class", "btn")
	.attr("width", margin.left * 0.6)
	.attr("height", height)
	.on("click", function () {
		console.log("Parent Reset Triggered");
		if (root.parent) {
			root = root.parent;
			update(root);
		}
	});

// Provides year tickmarks
d3.select("svg")
	.append("rect")
	.attr("class", "btn")
	.attr("width", width)
	.attr("height", margin.top / 2)
	.on("mouseover", function () {
		console.log("Displaying years");
		draw_years();
	})
	.on("mouseout", function () {
		console.log("Hiding years");
		hide_years();
	});

svg.call(tip);

//load root of the tree.
//klein: 7401. Gauss:18231
d3.xhr("http://localhost:7000/tree/18231", function (error, data) {
	if (error) throw error;
	root = JSON.parse(data.response)[0];
	root.x0 = height / 2;
	root.y0 = 0;
	loadChildren(root);
});


/* INTERACTIVITY */

function update(source) {

	// Compute the new tree layout.
	var nodes = tree.nodes(root)
		.reverse(),
		links = tree.links(nodes);

	// adjust depth by year_grad
	nodes.forEach(function (d) {
		d.y = d.year_grad ? (d.year_grad - root.year_grad) * year_depth_mult : d.parent.y + year_depth_mult;
	});

	// Update the nodes…
	var node = svg.selectAll("g.node")
		.data(nodes, function (d) {
			return d.id || (d.id = ++i);
		});

	// Enter any new nodes at the parent's previous position.
	var nodeEnter = node.enter()
		.append("g")
		.attr("class", "node")
		.attr("transform", function (d) {
			return "translate(" + source.y0 + "," + source.x0 + ")";
		});

	// mathematician name
	nodeEnter.append("text")
		.attr("class", "name")
		.attr("x", function (d) {
			return d.children || d._children || d.descendants.length ? -10 : 10;
		})
		.attr("dy", ".35em")
		.attr("text-anchor", function (d) {
			return d.children || d._children || d.descendants.length ? "end" : "start";
		})
		.text(function (d) {
			return d.name;
		})
		.on("mouseover", tip.show)
		.on("mouseout", tip.hide)
		.style("fill-opacity", 1e-6);

	// university info
	nodeEnter.append("text")
		.attr("id", function (d) {
			return d.math_id;
		})
		.attr("x", function (d) {
			return d.children || d._children || d.descendants.length ? -10 : 10;
		})
		.attr("dy", "2em")
		.attr("text-anchor", function (d) {
			return d.children || d._children || d.descendants.length ? "end" : "start";
		})
		.style("fill", "steelblue")
		.text(function (d) {
			return d.school;
		})
		.style("fill-opacity", 1e-6)
		.on("mouseover", function () {
			d3.select(this)
				.transition()
				.duration(duration * 0.5)
				.style('fill-opacity', 1)
		})
		.on("mouseout", function () {
			d3.select(this)
				.transition()
				.delay(duration * 0.5)
				.duration(duration * 0.5)
				.style('fill-opacity', 1e-6)
		})

	// outer circle indicates hidden_children that can be cycled through
	nodeEnter.append("circle")
		.attr('class', 'outer')
		.attr("r", 1e-6)
		.on("click", cycleChildren);


	nodeEnter.append("circle")
		.attr('class', 'inner')
		.attr("r", 1e-6)
		.style("fill", function (d) {
			return (d._children || d.hidden_children) ? "lightsteelblue" : "#fff";
		})
		.on("click", click);


	// Transition nodes to their new position.
	var nodeUpdate = node.transition()
		.duration(duration)
		.attr("transform", function (d) {
			return "translate(" + d.y + "," + d.x + ")";
		});

	nodeUpdate.select("circle.inner")
		.attr("r", 6)
		.style("fill", function (d) {
			return (d._children || d.hidden_children || d.descendants.length) ? "lightsteelblue" : "#fff";
		});

	nodeUpdate.select("circle.outer")
		.attr("r", function (d) {
			if (d.hidden_children || d.descendants.length > children_lim) return 12;
			else return 0;
		});

	nodeUpdate.selectAll("text.name")
		.style("fill-opacity", 1);

	// Transition exiting nodes to the parent's new position.
	var nodeExit = node.exit()
		.transition()
		.duration(duration)
		.attr("transform", function (d) {
			return "translate(" + source.y + "," + source.x + ")";
		})
		.remove();

	nodeExit.select("circle")
		.attr("r", 1e-6);

	nodeExit.selectAll("text")
		.style("fill-opacity", 1e-6);

	// Update the links…
	var link = svg.selectAll("path.link")
		.data(links, function (d) {
			return d.target.id;
		});

	// Enter any new links at the parent's previous position.
	link.enter()
		.insert("path", "g")
		.attr("class", "link")
		.attr("d", function (d) {
			var o = {
				x: source.x0,
				y: source.y0
			};
			return diagonal({
				source: o,
				target: o
			});
		});

	// Transition links to their new position.
	link.transition()
		.duration(duration)
		.attr("d", diagonal);

	// Transition exiting nodes to the parent's new position.
	link.exit()
		.transition()
		.duration(duration)
		.attr("d", function (d) {
			var o = {
				x: source.x,
				y: source.y
			};
			return diagonal({
				source: o,
				target: o
			});
		})
		.remove();

	// Stash the old positions for transition.
	nodes.forEach(function (d) {
		d.x0 = d.x;
		d.y0 = d.y;
	});
}

// Toggle descendants on click.
function click(d) {
	//if children are displayed already, hide them
	if (d.children) {
		console.log("A");
		d._children = d.children;
		d.children = null;
		update(d);
		// if children loaded, but not displayed, then unhide and display children
	} else if (d.children_loaded) {
		console.log("B");
		d.children = d._children;
		d._children = null;
		update(d);
		// otherwise, load children
	} else if (d.depth >= 3 && (d.descendants && d.descendants.length != 0)) {
		// reset the root to d if in too deep and more children coming
		resetRoot(d);
		console.log("C");
	} else {
		console.log("D");
		loadChildren(d);
	}
}

// change the root to new_root
function resetRoot(new_root) {
	root = new_root
	root.x0 = height / 2;
	root.y0 = 0;
	root.depth = 0;

	var non_root_nodes = d3.selectAll('.node, .link')
		.filter(function (d, i) {
			return d.math_id != root.math_id;
		});

	non_root_nodes.transition()
		.duration(duration)
		.style("opacity", 1e-6)
		.remove();

	var root_node = d3.selectAll('.node')
		.filter(function (d) {
			return d.math_id == root.math_id;
		});

	root_node.transition()
		.delay(duration)
		.duration(duration)
		.attr('transform', function (d) {
			return "translate(" + root.y0 + ',' + root.x0 + ")";
		});

	if (root.children_loaded) {
		root._children = root.children.slice(0);
		root.children = null;
	}
}

// load descendants information
// the maximum number of children displayed is set by children_lim
// having processed the node, set d.descendants to null
function loadChildren(d) {
	if (d.descendants.length === 0) return;

	var req_str = "http://localhost:7000/tree/" + d.descendants.map(function (a) {
			return a[0];
		})
		.reduce(function (a, b) {
			return a.toString() + ',' + b.toString();
		});
	d3.xhr(req_str, function (error, data) {
		if (error) throw error;

		// sort children by year_grad
		d.children = JSON.parse(data.response)
			.sort(function (a, b) {
				if (b.year_grad - a.year_grad != 0) return b.year_grad - a.year_grad
				else return b.math_id - a.math_id;
			});

		// hide some children if there are too many
		if (d.children.length > children_lim) {
			d.hidden_children = d.children.slice(children_lim);
			d.children = d.children.slice(0, children_lim);
		}
		d.children_loaded = true;
		d.descendants = [];
		update(d);
	});
}

// When clicked on a node with children overflow, cycle through its children
// one by one (move one from hidden_children to children, and one from children to hidden)
function cycleChildren(d) {
	if (d.children_loaded) {
		d.hidden_children.push(d.children.shift());
		d.children.push(d.hidden_children.shift());
		update(d);
	}
}

// This portion handles the x-axis year-ticks
var ticks = width / year_depth_mult / 10;

function draw_years() {
	if (d3.selectAll('.year-ticks')[0]
		.length > 0) {
		d3.selectAll('.year-ticks')
			.transition()
			.duration(duration / 2)
			.style('opacity', 1);
		return;
	}
	for (var i = 0; i < ticks; i++) {
		d3.select('svg')
			.append("text")
			.attr("class", "year-ticks")
			.attr("x", year_depth_mult * i * 10 + margin.left)
			.attr("y", margin.top / 3)
			.style('opacity', 1e-6)
			.text(root.year_grad + i * 10)
	}
	d3.selectAll(".year-ticks")
		.transition()
		.duration(duration)
		.style('opacity', 1);
}

function hide_years() {
	d3.selectAll(".year-ticks")
		.transition()
		.delay(duration * 4)
		.duration(duration)
		.style('opacity', 1e-6)
		.remove();
}
