(function(window, $, d3) {

	// Get SVG canvas to use
	// TODO: pass this as argument?
	var svg = d3.select("#evinz-plot");
	var svg_width = svg.attr('width');
	var svg_height = svg.attr('height');

	// Set up plot area.
	var plot_margin = {top: 30, bottom: 10, left: 40, right: 20, vertical_padding: 10};
	var plot_width = svg_width - plot_margin.left - plot_margin.right;
	var plot_height = svg_height - plot_margin.top - plot_margin.bottom;
	var marker_plot_height = 40;
	var histogram_plot_top = plot_margin.vertical_padding + marker_plot_height + plot_margin.vertical_padding;
	var histogram_plot_height = plot_height - histogram_plot_top;

	// svg plot groups
	var plot_area;
	var marker_plot;
	var histogram_plot;
	var xaxis;
	var histogram_yaxis;
	var histogram_bars;

	window.evinz = {

		setup: function () {

			plot_area = svg.append('g')
				.attr('class', 'plot-area')
				.attr("transform", "translate(" + plot_margin.left + "," + plot_margin.top + ")");

			xaxis = plot_area.append('g')
				.attr('class', 'axis x');

			marker_plot = plot_area.append('g')
				.attr('class', 'marker-plot')
				.attr('transform', 'translate(0,' + plot_margin.vertical_padding + ')');

			histogram_plot = plot_area.append('g')
				.attr('class', 'histogram-plot')
				.attr('transform', 'translate(0,' + histogram_plot_top + ')');

			histogram_yaxis = histogram_plot.append('g')
				.attr('class', 'axis y');
			histogram_bars = histogram_plot.append('g')
				.attr('class', 'bars');
		},

		draw: function (data) {

			// X scale: range based on data time stamps
			var dmin = d3.min(data);
			var dmax = d3.max(data);
			var transition_delay_factor = 500 / (dmax - dmin);
			var transition_delay_function = function(d) { return transition_delay_factor * (d - dmin); };
			var x = d3.time.scale()
				.domain([1.02 * dmin - 0.02 * dmax, 1.02 * dmax - 0.02 * dmin])
				.range([0, plot_width]);

			// X axis
			xaxis.call(d3.svg.axis()
				.scale(x)
				.orient('top')
				.ticks(10)
				.tickSize(-plot_height)
			);

			// Y scale: based on data (counts). TODO
			var marker_plot_yscale = d3.scale.linear()
				.domain([0, 1])
				.range([marker_plot_height, 0]);

			// Draw event marker plot based on data
			var markers = marker_plot.selectAll('g.marker').data(data);
			var marker_transform_function = function (d) { return 'translate(' + x(d) + ',0)'; };
			// Update existing markers
			markers.attr('transform', marker_transform_function);
			// Add entering markers
			var entering_markers = markers.enter()
				.append('g')
				.attr('class', 'marker')
				.attr('transform', marker_transform_function);
			entering_markers.append('line')
				.attr('y1', marker_plot_yscale(0))
				.attr('y2', marker_plot_yscale(0))
				.transition()
					.delay(transition_delay_function)
					.attr('y2', marker_plot_yscale(1));
			entering_markers.append('circle')
				.attr('cy', marker_plot_yscale(0))
				.transition()
					.delay(transition_delay_function)
					.attr('r', 3);
			// Remove exiting markers
			markers.exit().remove();


			// Build histogram
			var histogram_builder = d3.layout.histogram();
			// How to transform date to a number, so histogram can do it's thing
			histogram_builder.value(function(date) { return date.getTime(); });
			histogram_builder.bins(64);
			// Feed the data to build the histogram.
			var histogram = histogram_builder(data);

			// Scale for the histogram data
			var histogram_yscale = d3.scale.linear()
				.domain([0, d3.max(histogram, function(d) { return d.y; }) + 1])
				.range([histogram_plot_height, 0]);

			// Histogram plot
			var bars = histogram_bars.selectAll('.bar')
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
			histogram_yaxis.call(d3.svg.axis()
				.scale(histogram_yscale)
				.orient('left')
				.tickSize(-plot_width)
			);


		},

		_eoo: true
	};


})(window, jQuery, d3);

