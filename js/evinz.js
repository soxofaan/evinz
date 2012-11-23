(function(window, $, d3) {

	var get_data = function() {
		// Get data from text field
		var text = $('#input-textarea').val();
		var format = $('#input-time-format').val();
		format = d3.time.format(format);

		var lines = text.split('\n');
		var data = [];
		for (var i = 0; i < lines.length; i++) {
			var t = format.parse(lines[i]);
			if (t) {
				data.push(t);
			}
		}
		return data;
	};

	window.evinz = function() {

		// Get data.
		// TODO: pass this as argument.
		var data = get_data();

		// Get SVG canvas to use
		// TODO: pass this as argument?
		var svg = d3.select("#evinz-plot");
		var svg_width = svg.attr('width');
		var svg_height = svg.attr('height');

		// Set up plot area.
		var plot_margin = {top: 10, bottom: 40, left: 20, right: 20};
		var plot_padding = 30;
		var plot_width = svg_width - plot_margin.left - plot_margin.right;
		var plot_height = svg_height - plot_margin.top - plot_margin.bottom;
		var plot = svg.append('g')
			.attr('class', 'plot-area')
			.attr("transform", "translate(" + plot_margin.top + "," + plot_margin.left + ")");

		// X scale: range based on data time stamps
		var x = d3.time.scale()
			.domain([d3.min(data), d3.max(data)])
			.range([0, plot_width]);
		// Y scale: based on data (counts). TODO
		var y = d3.scale.linear()
			.domain([0, 1])
			.range([plot_height, 0]);

		// X axis
		var axis = d3.svg.axis()
			.scale(x)
			.orient('bottom')
			.ticks(10)
			.tickSize(10);
		plot.append('g')
			.attr('class', 'axis')
			.attr("transform", "translate(0, " + (plot_height) + ")")
			.call(axis);

		// Event dot plot
		var dot_plot = plot.append('g').attr('class', 'dot-plot');

		// First weight/count lines
		var lines = dot_plot.selectAll("line.event").data(data);
		lines
			.attr('x1', x).attr('y1', y(0))
			.attr('x2', x).attr('y2', y(1));
		// Entering lines
		lines.enter().append('line')
			.attr('class', 'event')
			.attr('x1', x).attr('y1', y(0))
			.attr('x2', x).attr('y2', y(0))
			.transition()
			.attr('y2', y(1));
		// Exiting lines
		lines.exit().remove();

		// Event dots
		var dots = dot_plot.selectAll("circle.event").data(data);
		dots
			.attr('cx', x).attr('cy', y(0));
		// Entering dots
		dots.enter().append('circle')
			.attr('class', 'event')
			.attr('cx', x).attr('cy', y(0))
			.transition()
			.attr('r', 4);
		// Exiting dots
		dots.exit().remove();


		// Build histogram
		var histogram_builder = d3.layout.histogram();
		// How to transform date to a number, so histogram can do it's thing
		histogram_builder.value(function(date) { return date.getTime(); });
		histogram_builder.bins(32);
		// Feed the data to build the histogram.
		histogram = histogram_builder(data);


		histogram_yscale = d3.scale.linear()
			.domain([0, d3.max(histogram, function(d) { return d.y; })])
			.range([plot_height, 0]);

		// Histrogram plot
		var histogram_plot = plot.insert('g', '.dot-plot')
			.attr('class', 'histogram-plot');
		var bars = histogram_plot.selectAll('.bar').data(histogram);
		bars.enter().append('rect');
		bars.exit().remove();
		bars.attr('class', 'bar')
			.attr('width', function(d) {return x(d.x+d.dx) - x(d.x); })
			.attr('x', function(d) { return x(d.x); })
			.attr('y', function(d) { return histogram_yscale(d.y); })
			.attr('height', function(d) { return histogram_yscale(0) - histogram_yscale(d.y); });


	};

})(window, jQuery, d3);

evinz();
