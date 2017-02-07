/* INITIAL SETUP */

var margin = {
		top: 20,
		right: 250,
		bottom: 20,
		left: 300
	},
	width = 2300 - margin.right - margin.left,
	height = 1000 - margin.top - margin.bottom;

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
		return "<strong>Year:</strong> <span style='color:red'>" + d.year_grad + "</span>";
	})

var svg = d3.select("body")
	.append("svg")
	.attr("width", width + margin.right + margin.left)
	.attr("height", height + margin.top + margin.bottom)
	.append("g")
	.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// Provides backward traversal
d3.select("svg")
	.append("rect")
	.attr("class", "btn")
	.attr("width", margin.left * 0.75)
	.attr("height", height)
	.on("click", function () {
		console.log("Parent Reset Triggered");
		if (root.parent) {
			root = root.parent;
			update(root);
		}
	});

svg.call(tip);

//load root of the tree.
d3.xhr("http://localhost:7000/tree/7401", function (error, data) {
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
		d.y = (d.year_grad - root.year_grad) * 12;
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

	nodeEnter.append("circle")
		.attr("r", 1e-6)
		.style("fill", function (d) {
			return d.children ? "lightsteelblue" : "#fff";
		})
		.on("click", click);

	nodeEnter.append("text")
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

	nodeEnter.append("text-university")
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
		.style("fill-opacity", 1e-6);

	// Transition nodes to their new position.
	var nodeUpdate = node.transition()
		.duration(duration)
		.attr("transform", function (d) {
			return "translate(" + d.y + "," + d.x + ")";
		});

	nodeUpdate.select("circle")
		.attr("r", 6)
		.style("fill", function (d) {
			return d.descendants.length ? "lightsteelblue" : "#fff";
		});

	nodeUpdate.selectAll("text")
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
	} else if (d.depth >= 3 && d.descendants.length != 0) {
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
// the undisplayed children are lumped into a single node
function loadChildren(d) {
	if (d.descendants.length === 0) return

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
		d.hidden_children = d.children.slice(children_lim);
		d.children = d.children.slice(0, children_lim);

		d.children_loaded = true;
		update(d);
	});
}

function cycleChildren(d) {

}
