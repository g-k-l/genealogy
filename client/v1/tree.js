/* INITIAL SETUP */

var req_root = "/tree/";
var margin = {
		top: 20,
		right: 100,
		bottom: 100,
		left: 100
	},
	searchResultTopMargin = 60,
	legend_height = 200,
	legend_width = 200,
	max_depth = 6;

var	width = window.innerWidth,
	height = window.innerHeight - margin.top - margin.bottom - legend_height,
	years_per_tick = 25,
	n_ticks = 10,
	tick_width = width / n_ticks;

var i = 0,
	duration = 750,
	root,
	children_lim = 15;

var tree = d3.layout.tree()
	.size([height, width])
	.separation(function (a, b) {
		return a.parent == b.parent ? 1 + a.depth / 6.0 : 2 + a.depth / 6.0;
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

var childrenTip = d3.tip()
	.attr('class','d3-tip')
	.offset([-10,0])
	.html(function(d) {
		return "<strong> Children: </strong> <span style='color:white'>" + d.descendants.length + "</span>";
	});

var svg_canvas = d3.select("#the-tree")
	.append("svg")
	.attr("id", "genealogy-tree")
	.attr("width", width)
	.attr("height", height + margin.bottom)

var legend = d3.select("svg")
	.append("g")
	.attr("id", "legend")
	.attr("transform", "translate(" + margin.left + "," + margin.top / 2 + ")")

var search_results = d3.select("svg")
	.append("g")
	.attr("id", "search-results")
	.attr("transform", "translate(" + (margin.left + legend_width) + "," + margin.top/2+ ")")
	.append("rect")
	.attr("fill","transparent")
	.attr("id","search-results-clickable")
	.attr("width", window.innerWidth - margin.left - legend_width)
	.attr("height", searchResultTopMargin)

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

var svg = svg_canvas
	.append("g")
	.attr("id", "tree")
	.attr("transform", "translate(" + margin.left + "," + (margin.top / 2 + searchResultTopMargin) + ")");

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
			remove_years();
			init_years();
			update(root);
		}
	});

// Provides year tickmarks
d3.select("svg")
	.append("rect")
	.attr("class", "btn")
	.attr("width", width)
	.attr("height", margin.top / 2)
	.attr("transform", "translate(" + margin.left + "," + searchResultTopMargin + ")")
	.on("mouseover", function () {
		console.log("Displaying years");
		show_years();
	});

svg.call(tip);
svg.call(childrenTip);

function compute_single_depth_year(d) {
	var children = d.children,
		max = years_per_tick;
	for(i=0; i<children.length; i++) {
		console.log(children[i].year_grad - d.year_grad)
		max = Math.max(max, (children[i].year_grad - d.year_grad) / 2)
	}
	return max
}

function killAll(callback) {
	// kill everything for clean slate
	d3.selectAll("#tree .node, #tree .link, .year-ticks")
		.transition("killAll")
		.duration(duration)
		.attr("opacity", 1e-6)
		.remove()
		.call(endall,callback);
}

// the function that ensures that transition is completed on all nodes before
// callback is executed.
function endall(transition, callback) {
	if (typeof callback !== "function") throw new Error("Wrong callback in endall");
	if (transition.size() === 0) { callback() }
	var n = 0;
	transition
			.each(function() { ++n; })
			.each("end", function() { if (!--n) callback.apply(this, arguments); });
}

function tree_init(d) {
	root = JSON.parse(JSON.stringify(d));
	root.name = shorten_name(root.name)
	root.x0 = height / 2;
	root.y0 = 0;
	killAll(function(){
		loadChildren(root);
		init_years();
	});
}

//load root of the tree.
//klein: 7401. Gauss:18231
d3.xhr(req_root + 18231, function (error, data) {
	if (error) throw error;
	tree_init(JSON.parse(data.response)[0]);
});

/* INTERACTIVITY */

function compute_node_y(d) {
	return d.year_grad ? (d.year_grad - root.year_grad) * tick_width / years_per_tick : d.parent.y + tick_width;
}

function update(source) {

	// A "node" is a svg group (<g>) consisting of a mathematician data and the
	// associating visual elements, the circles

	// Compute the new tree layout.
	var nodes = tree.nodes(root)
		.reverse(),
		links = tree.links(nodes);

	// adjust depth by year_grad
	// need to compute years_per_tick. Each level's can only take up at most 2 ticks
	nodes.forEach(function (d) {
		d.y = compute_node_y(d)
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
		.attr("id", function(d) {
			return "g_" + d.math_id;
		})
		.attr("transform", function (d) {
			return "translate(" + source.y0 + "," + source.x0 + ")";
		});

	// mathematician name
	nodeEnter.append("text")
		.attr("id", function (d) {
			return "name_" + d.math_id;
		})
		.attr("class", "name")
		.attr("x", function (d) {
			if (d.children || d._children || d.descendants.length) {
				if (d.hidden_children || d.descendants.length > children_lim) {
					return -15;
				} else {
					return -10;
				}
			}
			return 10;
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
		.on("dblclick", resetRoot)
		.style("fill-opacity", 1e-6);

	// university info
	nodeEnter.append("text")
		.attr("id", function (d) {
			return "text_uni" + d.math_id;
		})
		.attr("class", "school")
		.attr("x", function (d) {
			return d.children || d._children || d.descendants.length ? -10 : 10;
		})
		.attr("dy", "1.5em")
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
		.on("mouseover", circleMouseOver)
		.on("mouseout", circleMouseOut)
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
		.attr("id", function (d) {
			return "link_" + d.target.math_id;
		})
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
	} else if (d.depth >= max_depth && (d.descendants && d.descendants.length != 0)) {
		// reset the root to d if in too deep and more children coming
		resetRoot(d);
		console.log("C");
	} else {
		console.log("D");
		loadChildren(d);
	}
}

// set the root to the new root and transition the associated node to the root location
function resetRoot(new_root) {
	root = new_root
	root.x0 = height / 2;
	root.y0 = 0;
	root.depth = 0;

	remove_years();
	init_years();

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

function shorten_name(full_name) {
	var names = full_name.split(" ")
	return [names[0][0] + ".", names[names.length-1]].join(" ")
}

// load descendants information
// the maximum number of children displayed is set by children_lim
// having processed the node, set d.descendants to []
function loadChildren(d) {
	if (d.descendants.length === 0) return;

	var req_str = req_root + d.descendants.map(function (a) {
			return a[0];
		})
		.reduce(function (a, b) {
			return a.toString() + ',' + b.toString();
		});
	console.log(req_str)
	d3.xhr(req_str, function (error, data) {
		if (error) throw error;
		// sort children by year_grad
		d.children = JSON.parse(data.response)
			.sort(function (a, b) {
				if (b.year_grad - a.year_grad != 0) return b.year_grad - a.year_grad
				else return b.math_id - a.math_id;
			});
		var i;
		for (i=0; i<d.children.length; i++) {
			d.children[i].name = shorten_name(d.children[i].name)
		}
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
function init_years() {
	//prevent error occuring here before root is loaded
	if (!root) return;

	// enter a year tick, transition it to the correct spot
	for (var i = 0; i < n_ticks; i++) {
		var xloc = tick_width * i + margin.left,
			yloc = margin.top / 3;
		d3.select('svg')
			.append("text")
			.attr("text-anchor", "end")
			.attr("class", "year-ticks")
			.attr("x", 0)
			.attr("y", margin.top / 3)
			.attr("transform", "translate(0," + searchResultTopMargin + ")")
			.style('opacity', 1e-6)
			.text(root.year_grad + i * years_per_tick)
			.transition("init-years")
			.duration(duration)
			.attr("x", xloc)
			.attr("y", yloc)
			.style('opacity', 1)
	}
}

function show_years() {
	d3.selectAll('.year-ticks')
		.transition()
		.duration(duration / 2)
		.style('opacity', 1);
}

function remove_years() {
	d3.selectAll(".year-ticks")
		.transition('remove-year-ticks')
		.duration(duration)
		.style('opacity', 1e-6)
		.remove();
}

// This section handles search results
var results, _results;

function clickSearchResult(d){
	tree_init(d);
}

function getSearchResults(input_root) {
	d3.xhr(req_root + 'name/' + input_root,
		function (err, data) {
			results = JSON.parse(data.response);
			if (results.length > 0) {
				if (results.length > 6) {
					_results = results.slice(6)
					results = results.slice(0, 6)
					d3.select('#search-results-clickable')
						.on("click",cycleSearchResults);
				}
				drawSearchResults();
			}
		});
	event.preventDefault();
}

function drawSearchResults() {
	var resultNodes = d3.select("#search-results")
		.selectAll("g.node")
		.data(results, function(d) {
			return d.id || (d.id = i++);
		})

	var resultEnter = resultNodes.enter()
	.append("g")
	.attr("class","node")
	.attr("transform", function(d) {
		// begin at the right most side, then shifts in
		return "translate(" + width +",0)";
	});

	resultEnter.append("circle")
		.attr('class', 'outer')
		.attr("r", 1e-6)

	resultEnter.append("circle")
	.attr('class', 'inner')
	.attr("r", 1e-6)
	.style("fill", function (d) {
		return (d._children || d.hidden_children) ? "lightsteelblue" : "#fff";
	})
	.on("mouseover", function (d) {
		d3.select(this)
			.transition()
			.duration(duration * 0.3)
			.attr("r", 9);
		childrenTip.show(d);
		})
	.on("mouseout", function (d) {
		d3.select(this)
			.transition()
			.duration(duration * 0.3)
			.attr("r", 6);
		childrenTip.hide(d);
	})
	.on("click",clickSearchResult)

	resultEnter.append("text")
		.attr("id", function (d) {
			return "name_" + d.math_id;
		})
		.attr("class", "name")
		.attr("x", -10)
		.attr("dy", ".35em")
		.attr("text-anchor", "end")
		.text(function (d) {
			return d.name;
		})
		.on("mouseover", tip.show)
		.on("mouseout", tip.hide)
		.on("click",clickSearchResult)
		.style("fill-opacity", 1e-6);

	var resultUpdate = resultNodes.transition()
		.duration(duration*2)
		.attr("transform", function(d) {
			return "translate(" + ((width-legend_width-margin.right*3)*results.indexOf(d)/results.length) +",0)";
		})

	resultUpdate.select("circle.inner")
		.attr("r", 6)
		.style("fill", function (d) {
			return (d._children || d.hidden_children || d.descendants.length) ? "lightsteelblue" : "#fff";
		});

	resultUpdate.select("circle.outer")
		.attr("r", function (d) {
			if (d.hidden_children || d.descendants.length > children_lim) return 12;
			else return 0;
		});

	resultUpdate.selectAll("text.name")
		.style("fill-opacity", 1);

	var resultExit = resultNodes.exit()
		.transition()
		.duration(duration)
		.attr("transform", function (d) {
			return "translate(" + (width - legend_width) + ",0)";
		})
		.remove();

	resultExit.selectAll("circle")
		.attr("r", 1e-6);

	resultExit.selectAll("text")
		.style("fill-opacity", 1e-6);
}

function cycleSearchResults() {
	if (!_results) return
	_results.push(results.shift());
	results.push(_results.shift());
	drawSearchResults();
}

function circleMouseOver(d) {
	// highlight the circles connected
	d3.select("#g_"+d.math_id)
		.select(".inner")
		.transition("#g_"+d.math_id)
		.duration(duration * 0.3)
		.attr("r", 9);

	d3.select("#name_"+d.math_id)
		.transition("#name_"+d.math_id)
		.duration(duration*0.1)
		.style("font-size","14px")

	// select the link for which this circle is the target and change its color
	d3.select("#link_"+d.math_id)
		.transition("#link_"+d.math_id)
		.duration(duration * 0.3)
		.style("stroke", "OrangeRed")
		.style("stroke-width", "2px");

	// bubble upwards
	if (d.parent) {
		circleMouseOver(d.parent);
	}
}

function circleMouseOut(d) {
	d3.select("#g_"+d.math_id)
		.select(".inner")
		.transition("#g_"+d.math_id)
		.duration(duration * 0.3)
		.attr("r", 6);

	d3.select("#name_"+d.math_id)
		.transition("#name_"+d.math_id)
		.duration(duration*0.3)
		.style("font-size","12px")

	// select the link for which this circle is the target and change its color
	d3.select("#link_"+d.math_id)
		.transition("#link_"+d.math_id)
		.duration(duration * 0.3)
		.style("stroke", "#ccc")
		.style("stroke-width", "1.5px");

	// bubble upwards
	if (d.parent) {
		circleMouseOut(d.parent);
	}
}

$('#form-root')
	.submit(function (event) {
		getSearchResults($("#input-root")
			.val());
		event.preventDefault();
		$("#input-root").val('')
	});
