// adapted from http://bl.ocks.org/larsenmtl/222043d93a41d48b58d2bfa1e3d4f708 


var rowConverter = function(d) {
    // Just gotta get a date that's not a string lol
    return {
        date: new Date(d.year, d.month - 1, d.day),
        pretty_date: d.pretty_date,
        imo: d.imo,
        jwu: d.jwu,
        description: d.description,
        year: d.year,
        month: d.month,
        day: d.day,
        day_int: d.day_int,
        imo_lat: d.imo_lat,
        imo_lon: d.imo_lon,
        jwu_lat: d.jwu_lat,
        jwu_lon: d.jwu_lon,
        distance: d.distance,
        log_distance: d.log_distance
    };
}


d3.csv("https://raw.githubusercontent.com/imogencs/distance-viz/main/data/processed.csv", rowConverter, function(distanceData) {

    //////////////////////////////////////
    // some boring constants and stuff // 
    /////////////////////////////////////

    var barcolor = 'none'
    var barstrokecolor = 'black'
    var imocolor = 'magenta'
    var jwucolor = 'blue'
    var backgroundRectColor = 'blue'
    var backgroundcolor = 'navy'
    var textcolor = 'blueviolet'


    var width = 1200,
        height = 1000,
        start = 0,
        end = 2.25,
        numSpirals = 4;

    var theta = function(r) {
        return numSpirals * Math.PI * r;
    };

    var r = d3.min([width, height]) / 2 - 100;

    var radius = d3.scaleLinear()
        .domain([start, end])
        .range([40, r]);

    var svg = d3.select("#chart").append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");


    ////////////////
    // the spiral //
    //////////////// 

    // borrowed from http://bl.ocks.org/syntagmatic/3543186
    var points = d3.range(start, end + 0.001, (end - start) / 1000);

    var spiral = d3.radialLine()
        .curve(d3.curveCardinal)
        .angle(theta)
        .radius(radius);

    var path = svg.append("path")
        .datum(points)
        .attr("id", "spiral")
        .attr("d", spiral)
        .style("fill", 'none')
        .style("stroke", backgroundcolor); // TODO change spiral color


    ////////////////////////
    // the bars and stuff // 
    ////////////////////////

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

    var rect_radius = 0
    var gfRectHeight = 2

    // append white base rects
    svg.selectAll("baserect")
        .data(distanceData)
        .enter()
        .append("rect")
        .attr('rx', rect_radius)
        .attr('ry', rect_radius)
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
            return Math.max(yScale(d.log_distance), gfRectHeight);
        })
        .style("fill", 'white')
        // .style('opacity', .4)
        .attr("transform", function(d) {
            return "rotate(" + d.a + "," + d.x + "," + d.y + ")"; // rotate the bar
        })
        .attr('id', 'baserect');


    // append imo rects
    svg.selectAll("imorect")
        .data(distanceData)
        .enter()
        .append("rect")
        .attr('rx', rect_radius)
        .attr('ry', rect_radius)
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
            return Math.max(yScale(d.log_distance), gfRectHeight);
        })
        .style("fill", imocolor)
        .style("stroke", barstrokecolor)
        .style('stroke-width', .1)
        // .style('opacity', .4)
        .attr("transform", function(d) {
            return "rotate(" + d.a + "," + d.x + "," + d.y + ")"; // rotate the bar
        })
        .attr('id', 'imorect');


    // append white rects
    svg.selectAll("whiterect")
        .data(distanceData)
        .enter()
        .append("rect")
        .attr('rx', rect_radius)
        .attr('ry', rect_radius)
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
            return Math.max(yScale(d.log_distance) - gfRectHeight, 0);
        })
        .style("fill", 'white')
        .attr("transform", function(d) {
            return "rotate(" + d.a + "," + d.x + "," + d.y + ")"; // rotate the bar
        })
        .attr('id', 'whiterect');

    // append background color rects
    svg.selectAll("backgroundrect")
        .data(distanceData)
        .enter()
        .append("rect")
        .attr('rx', rect_radius)
        .attr('ry', rect_radius)
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
            return Math.max(yScale(d.log_distance) - gfRectHeight, 0);
        })
        .style("fill", backgroundRectColor)
        // .style('opacity', .5)
        .attr("transform", function(d) {
            return "rotate(" + d.a + "," + d.x + "," + d.y + ")"; // rotate the bar
        })
        .attr('id', 'backrgoundrect');


    // append jwu rects
    svg.selectAll("jwurect")
        .data(distanceData)
        .enter()
        .append("rect")
        .attr('rx', rect_radius)
        .attr('ry', rect_radius)
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
            // TODO modify barwidth
        })
        .attr("height", function(d) {
            // return Math.min(barWidth, yScale(d.log_distance));
            return gfRectHeight;

        })
        .style("fill", jwucolor)
        // .style('opacity', .3)
        .attr("transform", function(d) {
            return "rotate(" + d.a + "," + d.x + "," + d.y + ")"; // rotate the bar
        })
        .attr('id', 'jwurect');



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
        .style("fill", textcolor)
        .attr("startOffset", function(d) {
            return ((d.linePer / spiralLength) * 100) + "%";
        })
})