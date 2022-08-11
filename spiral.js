// adapted from http://bl.ocks.org/larsenmtl/222043d93a41d48b58d2bfa1e3d4f708 


// import curveRadial, { curveRadialLinear } from "./curve/radial.js";
// import line from "./line.js";


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


    // attempt at woody colors
    // var barcolor = 'none'
    // var barstrokecolor = 'none'
    // var imocolor = 'maroon'
    // var jwucolor = 'Goldenrod'
    // var togethercolor = 'yellowgreen'
    // var backgroundRectColor = 'sienna' // color of the bars in between us when we are apart - should be slightly lighter than the background (woodColor)
    // var backgroundcolor = '#3b2b00'
    // var textcolor = '#aaba9b' // light greyish green color
    // var woodColor = 'saddlebrown' // color of the circle that the spiral is over
    // var barkColor = '#3b2b00'

    // night / bowling alley colors

    var barcolor = 'none'
    var barstrokecolor = 'none'
    var imocolor = 'magenta'
    var jwucolor = 'deepskyblue'
    var togethercolor = '#8800DD'
    var backgroundRectColor = 'DarkBlue'
    var backgroundcolor = 'navy'
    var textcolor = 'blueviolet'
    var boxcolor = 'darkblue'


    var rect_radius = 0
    var gfRectHeight = 3
        // var gfOpacity = .7
    var jwuOpacity = .7
    var imoOpacity = .7


    var width = 1200,
        height = 1000,
        start = 0,
        end = 3,
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

    // // bark // 

    // var barkWidth = 20

    // svg.append('circle')
    //     .attr('x', 0)
    //     .attr('y', 0)
    //     .attr('r', Math.min(height, width) / 2)
    //     .attr('fill', barkColor)
    //     .attr('id', 'bark')


    // ////////////////////
    // // the wood trunk //
    // ////////////////////

    // svg.append('circle')
    //     .attr('x', 0)
    //     .attr('y', 0)
    //     .attr('r', Math.min(height, width) / 2 - barkWidth)
    //     .attr('fill', woodColor)
    //     .attr('id', 'wood')

    // randomBarkData = [{'height':0, 'width':0}]
    // while (Math.sum(randomBarkData.width) < 2 * Math.PI * width){
    //     // while the widths of the rectangles is less than the circumferance of the circle, approx :)
    //     svg.append('rect')
    //         .attr('x')
    // }
    // svg.append('rect')

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
        .style("stroke", 'none');

    // TODO update length to account for different bar widths
    var spiralLength = path.node().getTotalLength(),
        N = 800,
        barWidth = (spiralLength / N) - 0;



    function drawInfobox(d) {

        var boxwidth = 100
        var x = -1 * width / 2
        var y = -1 * height / 2
        var cornerRadius = 4
        var lineSpacing = 20
        var margin = 20

        svg.append('text')
            .attr('x', x + margin)
            .attr('y', y + lineSpacing * 2)
            .text(d.pretty_date)
            .attr('id', 'date')
        svg.append('text')
            .attr('x', x + margin)
            .attr('y', y + lineSpacing * 3)
            .text(d.description)
            .attr('id', 'title')

        // our individual locations
        svg.append('text')
            .attr('x', x + barWidth * 1.5 + margin)
            .attr('y', y + lineSpacing * 4)
            .text("leezard: " + d.jwu)
            .attr('id', 'jwuLoc')
        svg.append('text')
            .attr('x', x + barWidth * 1.5 + margin)
            .attr('y', y + lineSpacing * 5)
            .text("clover: " + d.imo)
            .attr('id', 'imoLoc')

        // "key" I guess
        svg.append('rect')
            .attr('x', x + margin)
            .attr('y', y + lineSpacing * 3.5 + gfRectHeight / 2)
            .attr('fill', jwucolor)
            .attr('rx', rect_radius)
            .attr('height', gfRectHeight)
            .attr('width', barWidth)
            .attr('opacity', jwuOpacity)
            .attr('id', 'jwuKey')
        svg.append('rect')
            .attr('x', x + margin)
            .attr('y', y + lineSpacing * 4.5 + gfRectHeight / 2)
            .attr('fill', imocolor)
            .attr('rx', rect_radius)
            .attr('height', gfRectHeight)
            .attr('width', barWidth)
            .attr('opacity', imoOpacity)
            .attr('id', 'imoKey')
        if (d.log_distance <= .01) {
            milesApart = 'together <3'
        } else if (Math.ceil(d.distance) == 1) {
            milesApart = Math.ceil(d.distance) + ' little mile apart'
        } else {
            milesApart = Math.ceil(d.distance) + ' little miles apart'
        }
        svg.append('text')
            .attr('x', x + margin)
            .attr('y', y + lineSpacing * 6)
            .text(milesApart)
            .attr('id', 'milesApart')
    }

    function eraseInfobox() {
        d3.select('#date').remove()
        d3.select('#title').remove()
        d3.select('#jwuLoc').remove()
        d3.select('#imoLoc').remove()
        d3.select('#jwuKey').remove()
        d3.select('#imoKey').remove()
        d3.select('#milesApart').remove()
    }
    ////////////////////////
    // the bars and stuff // 
    ////////////////////////

    // time scale that'll run along the spiral
    var timeScale = d3.scaleTime()
        .domain(d3.extent(distanceData, function(d) {
            return d.date;
        }))
        .range([barWidth, spiralLength]);

    // yScale for the bar height
    var yScale = d3.scaleLinear()
        .domain([0, d3.max(distanceData, function(d) {
            return d.log_distance;
        })])
        .range([0, (r / numSpirals) - 30]);

    // ---------------- // 
    // append imo rects //
    // ---------------- // 
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
        // .style("stroke", barstrokecolor)
        // .style('stroke-width', .1)
        .style('opacity', imoOpacity)
        .attr("transform", function(d) {
            return "rotate(" + d.a + "," + d.x + "," + d.y + ")"; // rotate the bar
        })
        .attr('id', 'backrgoundrect')
        .on('mouseover', function(d) {
            eraseInfobox()
            drawInfobox(d)
        })
        .attr('id', 'imorect');


    // ----------------------------- // 
    // append background color rects //
    // ----------------------------- // 
    svg.selectAll("backgroundrect")
        .data(distanceData)
        .enter()
        .append("rect")
        // .attr('rx', rect_radius)
        // .attr('ry', rect_radius)
        .attr("x", function(d, i) {
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
        .style('stroke', 'none')
        .attr("transform", function(d) {
            return "rotate(" + d.a + "," + d.x + "," + d.y + ")"; // rotate the bar
        })
        .attr('id', 'backrgoundrect')
        .on('mouseover', function(d) {
            eraseInfobox()
            drawInfobox(d)
        });


    // ---------------- // 
    // append jwu rects //
    // ----------------- // 
    svg.selectAll("jwurect")
        .data(distanceData)
        .enter()
        .append("rect")
        .attr('rx', rect_radius)
        .attr('ry', rect_radius)
        .attr("x", function(d, i) {
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
        .style("fill", function(d) {
            if (yScale(d.log_distance) < gfRectHeight) {
                // if this is an overlap case aka we were together
                return togethercolor
            } else {
                return jwucolor
            }
        })
        .style('opacity', function(d) {
            if (yScale(d.log_distance) < gfRectHeight) {
                // if this is an overlap case aka we were together
                return 1
            } else {
                return jwuOpacity
            }
        })
        .attr("transform", function(d) {
            return "rotate(" + d.a + "," + d.x + "," + d.y + ")"; // rotate the bar
        })
        .attr('id', 'backrgoundrect')
        .on('mouseover', function(d) {
            eraseInfobox()
            drawInfobox(d)
        })
        .attr('id', 'jwurect');

})