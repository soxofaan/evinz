(function($,d3) {

	// Get data from text field
	var text = $('#input-textarea').val();
	var lines = text.split('\n');
	var data = [];
	for (var i = 0; i < lines.length; i++) {
		var value = parseInt(lines[i], 10);
		if (!isNaN(value)) {
			data.push(value);
		}
	}


	// Create graph
	var plot_width = 800;
	var plot_height = 400;
	var plot_padding = 10;
	var svg = d3.select("body").append("svg")
		.attr("class", "chart")
		.attr("width", plot_width)
		.attr("height", plot_height);

	var x = d3.scale.linear()
		.domain([d3.min(data), d3.max(data)])
		.range([plot_padding, plot_width - plot_padding]);


	var circles = svg.selectAll("circle").data(data);

	var enter = circles.enter().append('circle')
		.attr('cx', x)
		.attr('cy', plot_height / 2)
		.attr('r', 4)
		.attr('class', 'event');

})(jQuery, d3);
