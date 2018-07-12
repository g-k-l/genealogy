/*


*/

var date = new Date();
const current_year = date.getFullYear();

const GAUSS_ID = 18231,
	GAUSS_GRAD_DATE = 1799,
	REQUEST_ROOT = "/tree/",
	SVG_CANVAS_WIDTH = 1280,
	SVG_CANVAS_HEIGHT = 1280,
	TREE_MARGIN_FRACTION = 0.8,
	CIRCLE_SIZE = 10,
	RADIAL_SCALING = current_year - GAUSS_GRAD_DATE;

var svg_canvas = d3
	.select("#genealogy")
	.append("svg")
	.attr("width", SVG_CANVAS_WIDTH)
	.attr("height", SVG_CANVAS_HEIGHT);

function center_root() {
	return (
		"translate(" + SVG_CANVAS_WIDTH / 2 + "," + SVG_CANVAS_HEIGHT / 2 + ")"
	);
}

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

function children_accessor(d) {
	/* 
		need to flatten the array because it looks like:
		[[<math_id>, <name>], ...]
	*/
	if (d.descendants === undefined) {
		return null;
	}
	return d.descendants.map(function(inner_arr) {
		return {
			math_id: inner_arr[0],
			name: inner_arr[1]
		};
	});
}

function projection(theta, r) {
	/* converts polar coordinates to cartesian */
	return [r * Math.cos((theta -= Math.PI / 2)), r * Math.sin(theta)];
}

function adjust_radius_by_year(d) {
	let scale_factor;
	if (d.data.year_grad === undefined) {
		scale_factor = (d.parent.y + 1) / RADIAL_SCALING;
	} else {
		scale_factor = (d.data.year_grad - GAUSS_GRAD_DATE) / RADIAL_SCALING;
	}
	d.y *= Math.sqrt(scale_factor);
	return d;
}

function transform(d) {
	// d = adjust_radius_by_year(d)
	return "translate(" + projection(d.x, d.y) + ")";
}

function rotate_text(d) {
	if (d.x < Math.PI) {
		return "rotate(" + ((d.x - Math.PI / 2) * 180) / Math.PI + ")";
	} else {
		return "rotate(" + ((d.x + Math.PI / 2) * 180) / Math.PI + ")";
	}
}

function to_comma_delimited_str(arr) {
	return arr.reduce(function(a, b) {
		return a.toString() + "," + b.toString();
	});
}

function uniquify(arr, key) {
	var i;
	var hashmap = {}
	for(i=0; i<arr.length;i++ ) {
		hashmap[arr[i][key]] = arr[i]
	}
	return Object.values(hashmap)
}

function draw_tree(data) {
	var stratifed = d3
		.stratify()
		.id(function(d) {
			return d.math_id;
		})
		.parentId(function(d) {
			console.log(d)
			return d.parent_id;
		})(data);

	root = d3.hierarchy(stratifed);
	tree(root);

	var link = tree_group
		.selectAll(".link")
		.data(root.links())
		.enter()
		.append("path")
		.attr("class", "link")
		.attr(
			"d",
			d3.linkRadial()
				.angle(function(d) {
					return d.x;
				})
				.radius(function(d) {
					return d.y;
				})
		);

	var node = tree_group
		.selectAll(".node")
		.data(root.descendants())
		.enter()
		.append("g")
		.attr("class", "node")
		.attr("transform", transform);

	node.append("circle").attr("r", CIRCLE_SIZE);

	node.append("text")
		.attr("dy", "0.31em")
		.attr("x", function(d) {
			return d.x < Math.PI === !d.children
				? CIRCLE_SIZE + 1
				: -(CIRCLE_SIZE + 1);
		})
		.attr("text-anchor", function(d) {
			return d.x < Math.PI === !d.children ? "start" : "end";
		})
		.attr("class", "name")
		.attr("transform", rotate_text)
		.text(function(d) {
			// last name only
			var name_parts = d.data.data.name.split(" ");
			return name_parts[name_parts.length - 1];
		});
}

var return_data = [];
function fetch_data(math_ids, depth, parent_id) {
	/*
		math_ids is a comma-delimited string e.g.
			"1,2,3,4,5". This will fetch data with math_ids
			1, 2, 3, 4, and 5.
	*/
	if (depth === undefined) {
		depth = 1;
	}
	if (depth < 0) {
		return;
	}
	return d3.json(REQUEST_ROOT + math_ids).then(function(data) {
		return_data = return_data.concat(data);
		var i;
		var promises = [];
		for (i = 0; i < data.length; i++) {
			var node_data = data[i];
			node_data.parent_id = parent_id;
			if (node_data.descendants.length > 0) {
				var children_math_ids = to_comma_delimited_str(
					children_accessor(node_data).map(function(child) {
						return child.math_id;
					})
				);
				promises.push(
					fetch_data(children_math_ids, depth - 1, node_data.math_id)
				);
			}
		}
		return Promise.all(promises);
	});
}
fetch_data(GAUSS_ID, 4, null)
	.then(function() {
		//uniquify to prevent error in d3.stratify
		draw_tree(uniquify(return_data, 'math_id'));
	})
	.catch(function(error) {
		console.log(error);
		throw error;
	});

$(document).ready(function() {
	console.log("ready!");
});
