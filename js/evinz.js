(function(window, $, d3) {

	var get_data = function() {
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
		return data;
	};

	window.evinz = function() {

		var data = get_data();

		// Create graph
		var svg = d3.select("#evinz-plot");
		var plot_width = svg.attr('width');
		var plot_height = svg.attr('height');
		var plot_padding = 10;

		var x = d3.scale.linear()
			.domain([d3.min(data), d3.max(data)])
			.range([plot_padding, plot_width - plot_padding]);


		// Dots
		var circles = svg.selectAll("circle").data(data, function(d){return d;});
		circles.transition()
			.duration(500)
			.attr('cx', x);
		// Entering dots
		circles.enter().append('circle')
			.attr('class', 'event')
			.attr('cx', x)
			.attr('cy', plot_height / 2)
			.transition()
			.delay(function(d, i) { return 50 * i;})
			.attr('r', 4);
		// Exiting dots
		var exit = circles.exit().remove();

		var lines = svg.selectAll("line").data(data);
		lines.transition()
			.attr('x1', x).attr('y1', plot_height/2)
			.attr('x2', x).attr('y2', plot_height * 0.25);
		// Entering lines
		lines.enter().append('line')
			.attr('class', 'event')
			.attr('x1', x).attr('y1', plot_height / 2)
			.attr('x2', x).attr('y2', plot_height / 2)
			.transition()
			.delay(function(d, i) { return 100 * i;})
			.attr('y2', plot_height* 0.25);
		// Exiting lines
		var exit = circles.exit().remove();

	};

})(window, jQuery, d3);
