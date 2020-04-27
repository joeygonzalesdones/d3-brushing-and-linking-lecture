// Declare sizes as variables to make resizing easier
var svgWidth = 1000;
var svgHeight = 600;

var padding = {t: 0, r: 0, b: 0, l: 0};
var chartPadding = {t: 40, r: 40, b: 60, l: 50};

var svgAvailableWidth = svgWidth - padding.l - padding.r;
var svgAvailableHeight = svgHeight - padding.t - padding.b;

// Create a <div>, then create an <svg> in it and save a reference to the d3 selection of the <svg>.
var svg = d3.select('#main')
	.append('svg')
	.attr('width', svgWidth)
	.attr('height', svgHeight)
	.style('border', '1px solid #777');
	
// Data attribute to use on the y-axis in each chart
var dataAttributes = ['price18', 'rating', 'sales'];
var attributeLabels = {
	'price18': 'Oct. 2018 Resale Price ($)',
	'rating': 'Rating (0.0 to 5.0)',
	'sales': 'North American sales (millions)'
};

var numAttributes = dataAttributes.length;

var chartWidth = svgAvailableWidth / numAttributes;
var chartHeight = svgAvailableHeight;

// Map for referencing min/max per each attribute
var extentByAttribute = {};

var chartAvailableWidth = chartWidth - chartPadding.l - chartPadding.r;
var chartAvailableHeight = chartHeight - chartPadding.t - chartPadding.b;
	
// Declare D3 scales and axes to be shared between all of the charts
var xScale = d3.scaleLinear().range([0, chartAvailableWidth]);
var yScale = d3.scaleLinear().range([chartAvailableHeight, 0]);

var xAxis = d3.axisBottom(xScale).ticks(6).tickSize(5, 0, 0);
var yAxis = d3.axisLeft(yScale).ticks(6).tickSize(5, 0, 0);

// Ordinal color scale for year color mapping
var colorScale = d3.scaleOrdinal(d3.schemeCategory10);

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ //
//                     Code necessary for brushing and linking below                     //
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ //

selectedChart = undefined;

// Amount of extra space to add on the edges of the selectable area to make it easier to select
// data points close to the edges of the chart
var brushBorder = 20; 

var brush = d3.brush()
    .extent([[chartPadding.l - brushBorder, 
			  chartPadding.t - brushBorder], 
			 [chartWidth - chartPadding.r + brushBorder, 
			  chartHeight - chartPadding.b + brushBorder]])
    .on("start", handleBrushStart)
    .on("brush", handleBrushMove)
    .on("end", handleBrushEnd);
	
function handleBrushStart(attribute) {
	
	if (selectedChart !== attribute) {
		brush.move(d3.selectAll('.brush'), null);
		
		xScale.domain(d3.extent(games, function(d) {
			return d[attribute];
		}));
	
		selectedChart = attribute;
	}
}

function handleBrushMove(attribute) {
	var brushSelection = d3.event.selection;
	if (brushSelection) { // If the selection is not empty, get the boundaries of the selection
		var [[left, top], [right, bottom]] = brushSelection; // JavaScript's convenient array destructuring syntax :)

		svg.selectAll('.dot')
			.classed('hidden', function(d) {
				var x = xScale(d[attribute]) + chartPadding.l;
				var y = yScale(d['price19']) + chartPadding.t;
				// Hide the dots that are outside of the selected area
				return !(left <= x && x <= right && top <= y && y <= bottom);
			});
	}
}

function handleBrushEnd() {
	var brushSelection = d3.event.selection;
	if (!brushSelection) {
        // Bring back all hidden .dot elements
        svg.selectAll('.hidden').classed('hidden', false);
        selectedChart = undefined;
	}
}

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ //
//                     Code necessary for brushing and linking above                     //
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ //


// An optional component to make a tooltip with more information about each game appear when hovering over each dot
var toolTip = d3.tip()
    .attr("class", "d3-tip")
    .offset([-12, 0])
    .html(function(d) {
		var htmlString = `<h5>${d['game']} (${d['year']})</h5>`;
		htmlString = htmlString + `<table><thead><tr><td>Oct. 2019 Resale Price</td></tr></thead>`;
		htmlString = htmlString + `<tbody><tr><td>$${d['price19']}</td></tr></tbody></table>`
		return htmlString;
    });
	
svg.call(toolTip);

// Handle the data processing and drawing
d3.csv('./gamecube.csv',
	// Load data and use this function to process each row
	function(row) {
		return {
			'game': row['Game'],
			'genre': row['Genre'],
			'year': row['Year'],
			'price19': +row['Price (Oct 19) ($)'],
			'price18': +row['Price (Oct 18) ($)'],
			'rating': +row['Rating'],
			'difficulty': +row['Difficulty'],
			'length': +row['Length (hrs)'],
			'sales': +row['NA Sales (millions)']
		};
	},
	function(error, dataset) {
        // Log and return from an error
        if(error) {
            console.error('Error while loading ./gamecube.csv dataset.');
            console.error(error);
            return;
        }		
		
		// Save the dataset in a variable in case we need to access it outside of this callback;
		// Global in scope since we declared it without the "var" keyword
		games = dataset; 
		
		// Create map for each attribute's extent
        dataAttributes.forEach(function(attribute) {
            extentByAttribute[attribute] = d3.extent(dataset, function(d) {
                return d[attribute];
            });
        });
		
		yScale.domain(d3.extent(dataset, function(d) {
			return d['price19'];
		}));
		
		var chartEnter = svg.selectAll('.chart')
			.data(dataAttributes)
			.enter()
			.append('g')
			.attr('class', 'chart')
			.attr('id', function(d) {
				return d; // Make each chart uniquely identifiable via its associated attribute
			})
			.attr('transform', function(d, i) {
				return `translate(${padding.l+(i * chartWidth)}, ${padding.t})`
			});
			
		// Make sure you call the brush on a <g>, not on the <svg>. If you call it on a selection of the svg, 
		// for example, if you do svg.call(brush) here, you might not be able to click the elements  when the 
		// brush is on.
		chartEnter.append('g')
			.attr('class', 'brush')
			.call(brush); 	
			
		chartEnter.each(function(attribute) {
			
			xScale.domain(extentByAttribute[attribute]);
			
			var chart = d3.select(`#${attribute}`); // Select which chart to process based on the current attribute
							
			var dots = chart.selectAll('.dot')
				.data(dataset, function(d) {
					return d['game']; // use the name of the data case (an individual game) as the key
				});
				
			var dotsEnter = dots.enter()
				.append('circle')
				.attr('class', 'dot')
				.style('fill', function(d) { return colorScale(d['year']); })
				.attr('r', 4);	

			dotsEnter.on('mouseover', toolTip.show)
				.on('mouseout', toolTip.hide);			
				
			dots.merge(dotsEnter).attr('cx', function(d){
					return xScale(d[attribute]) + chartPadding.l;
				})
				.attr('cy', function(d){
					return yScale(d['price19']) + chartPadding.t;
				});

			dots.exit().remove();			
					
			// x-axis
			chart.append('g')
				.attr('class', '.x.axis')
				.attr('transform', `translate(${chartPadding.l}, ${chartHeight - chartPadding.b})`)
				.call(xAxis);
			
			// y-axis
			chart.append('g')
				.attr('class', '.y.axis')
				.attr('transform', `translate(${chartPadding.l}, ${chartPadding.t})`)
				.call(yAxis);
				
			// x-axis label
			chart.append('text')
				.text(function(d) {
					return attributeLabels[d];
				})
				.attr('class', 'axis-label')
				.attr('transform', function(d, i) {
					return `translate(${chartPadding.l * 2}, ${chartHeight - (chartPadding.b / 2) + 10})`;
				});
				
			// y-axis label
			chart.append('text')
				.text(function(d) {
					return 'Oct. 2019 Resale Price ($)';
				})
				.attr('class', 'axis-label')
				.attr('transform', function(d, i) {
					return `rotate(90) translate(${chartHeight / 3}, -10)`;
				});
		});
	});
	
