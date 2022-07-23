// adapted from http://bl.ocks.org/larsenmtl/222043d93a41d48b58d2bfa1e3d4f708 for jyalu <3

var width = 500,
    height = 500,
    start = 0,
    end = 2.25,
    numSpirals = 4;

var theta = function(r) {
    return numSpirals * Math.PI * r;
};

var r = d3.min([width, height]) / 2 - 40;

var radius = d3.scaleLinear()
    .domain([start, end])
    .range([40, r]);

var svg = d3.select("#chart").append("svg")
    .attr("width", width)
    .attr("height", height)
    .append("g")
    .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

// create the spiral, borrowed from http://bl.ocks.org/syntagmatic/3543186
var points = d3.range(start, end + 0.001, (end - start) / 1000);

var spiral = d3.radialLine()
    .curve(d3.curveCardinal)
    .angle(theta)
    .radius(radius);

var path = svg.append("path")
    .datum(points)
    .attr("id", "spiral")
    .attr("d", spiral)
    .style("fill", "none")
    .style("stroke", "skyblue");



d3.csv("https://raw.githubusercontent.com/imogencs/distance-viz/main/data/processed.csv?token=GHSAT0AAAAAABWYAQZTIVNLZQEDD3SU7SISYW4OVAA", function(distanceData) {

    console.log(distanceData)


    // TODO update length to account for different bar widths
    var spiralLength = path.node().getTotalLength(),
        N = 800,
        barWidth = (spiralLength / N) - 1;

    // time scale that'll run along the spiral
    var timeScale = d3.scaleTime()
        .domain(d3.extent(distanceData, function(d) {
            return d.date;
        }))
        .range([0, spiralLength]);

    // yScale for the bar height
    var yScale = d3.scaleLinear()
        .domain([0, d3.max(distanceData, function(d) {
            return d.log_distance;
        })])
        .range([0, (r / numSpirals) - 30]);

    // append rects
    svg.selectAll("rect")
        .data(distanceData)
        .enter()
        .append("rect")
        .attr("x", function(d, i) {

            // placement calculations
            var linePer = timeScale(d.date),
                posOnLine = path.node().getPointAtLength(linePer),
                angleOnLine = path.node().getPointAtLength(linePer - barWidth);

            d.linePer = linePer; // % distance are on the spiral
            d.x = posOnLine.x; // x postion on the spiral
            d.y = posOnLine.y; // y position on the spiral

            d.a = (Math.atan2(angleOnLine.y, angleOnLine.x) * 180 / Math.PI) - 90; //angle at the spiral position

            return d.x;
        })
        .attr("y", function(d) {
            return d.y;
        })
        .attr("width", function(d) {
            return barWidth;
        })
        .attr("height", function(d) {
            return yScale(d.log_distance);
        })
        .style("fill", "steelblue")
        .style("stroke", "none")
        .attr("transform", function(d) {
            return "rotate(" + d.a + "," + d.x + "," + d.y + ")"; // rotate the bar
        });

    // add date labels
    var tF = d3.timeFormat("%b %Y"),
        firstInMonth = {};
    svg.selectAll("text")
        .data(distanceData)
        .enter()
        .append("text")
        .attr("dy", 10)
        .style("text-anchor", "start")
        .style("font", "10px arial")
        .append("textPath")
        // only add for the first of each month
        .filter(function(d) {
            var sd = tF(d.date);
            if (!firstInMonth[sd]) {
                firstInMonth[sd] = 1;
                return true;
            }
            return false;
        })
        .text(function(d) {
            return tF(d.date);
        })
        // place text along spiral
        .attr("xlink:href", "#spiral")
        .style("fill", "grey")
        .attr("startOffset", function(d) {
            return ((d.linePer / spiralLength) * 100) + "%";
        })
})