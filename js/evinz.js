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
		var plot_margin = {top: 30, bottom: 10, left: 40, right: 20, vertical_padding: 10};
		var plot_width = svg_width - plot_margin.left - plot_margin.right;
		var plot_height = svg_height - plot_margin.top - plot_margin.bottom;
		var dot_plot_height = 40;
		var histogram_plot_top = plot_margin.vertical_padding + dot_plot_height + plot_margin.vertical_padding;
		var histogram_plot_height = plot_height - histogram_plot_top;

		var plot_area = svg.append('g')
			.attr('class', 'plot-area')
			.attr("transform", "translate(" + plot_margin.left + "," + plot_margin.top + ")");

		// X scale: range based on data time stamps
		var dmin = d3.min(data);
		var dmax = d3.max(data);
		var ddiff = dmax - dmin;
		var transition_delay_function = function(d) { return 500 * (d - dmin) / (dmax - dmin); };
		var x = d3.time.scale()
			.domain([1.02 * dmin - 0.02 * dmax, 1.02 * dmax - 0.02 * dmin])
			.range([0, plot_width]);

		// X axis
		var axis = d3.svg.axis()
			.scale(x)
			.orient('top')
			.ticks(10)
			.tickSize(-plot_height);
		plot_area.append('g')
			.attr('class', 'axis')
			.call(axis);

		// Event dot plot
		var dot_plot = plot_area
			.append('g')
			.attr('class', 'dot-plot')
			.attr('transform', 'translate(0,' + plot_margin.vertical_padding + ')');
		// Y scale: based on data (counts). TODO
		var dot_plot_yscale = d3.scale.linear()
			.domain([0, 1])
			.range([dot_plot_height, 0]);

		// First weight/count lines
		var lines = dot_plot.selectAll("line.event").data(data);
		lines
			.attr('x1', x).attr('y1', dot_plot_yscale(0))
			.attr('x2', x).attr('y2', dot_plot_yscale(1));
		// Entering lines
		lines.enter().append('line')
			.attr('class', 'event')
			.attr('x1', x).attr('y1', dot_plot_yscale(0))
			.attr('x2', x).attr('y2', dot_plot_yscale(0))
			.transition()
				.delay(transition_delay_function)
				.attr('y2', dot_plot_yscale(1));

		// Exiting lines
		lines.exit().remove();

		// Event dots
		var dots = dot_plot.selectAll("circle.event").data(data);
		dots
			.attr('cx', x).attr('cy', dot_plot_yscale(0));
		// Entering dots
		dots.enter().append('circle')
			.attr('class', 'event')
			.attr('cx', x).attr('cy', dot_plot_yscale(0))
			.transition()
				.delay(transition_delay_function)
				.attr('r', 3);
		// Exiting dots
		dots.exit().remove();


		// Build histogram
		var histogram_builder = d3.layout.histogram();
		// How to transform date to a number, so histogram can do it's thing
		histogram_builder.value(function(date) { return date.getTime(); });
		histogram_builder.bins(64);
		// Feed the data to build the histogram.
		histogram = histogram_builder(data);

		// Scale for the histogram data
		histogram_yscale = d3.scale.linear()
			.domain([0, d3.max(histogram, function(d) { return d.y; }) + 1])
			.range([histogram_plot_height, 0]);

		// Histogram plot
		var histogram_plot = plot_area.append('g')
			.attr('class', 'histogram-plot')
			.attr('transform', 'translate(0,' + histogram_plot_top + ')');
		var bars = histogram_plot
			.append('g')
			.attr('class', 'bars')
			.selectAll('.bar')
			.data(histogram);
		bars.enter().append('rect');
		bars.exit().remove();
		bars.attr('class', 'bar')
			.attr('width', function(d) {return x(d.x+d.dx) - x(d.x); })
			.attr('x', function(d) { return x(d.x); })
			.attr('y', function(d) { return histogram_yscale(0); })
			.attr('height', 0)
			.transition()
				.delay(function (d) { return transition_delay_function(d.x); })
				.attr('y', function(d) { return histogram_yscale(d.y); })
				.attr('height', function(d) { return histogram_yscale(0) - histogram_yscale(d.y); });

		// Y axis for histogram
		var histogram_yaxis = d3.svg.axis()
			.scale(histogram_yscale)
			.orient('left')
			.tickSize(-plot_width);
		histogram_plot.insert('g', '.bars')
			.attr('class', 'axis')
			.call(histogram_yaxis);


	};

})(window, jQuery, d3);

evinz();
