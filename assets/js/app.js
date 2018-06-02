// D3 Scatterplot Assignment

// Students:
// =========
// Follow your written instructions and create a scatter plot with D3.js.

var svgWidth = 960;
var svgHeight = 500;

var margin = {
    top: 20,
    right: 40,
    bottom: 80,
    left: 100
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;
// Create an SVG wrapper, append an SVG group that will hold our chart,
//and shift the latter by left and top margins.

var svg = d3
    .select(".chart")
    .append("svg")
    .attr("width", svgWidth)
    .attr("height", svgHeight);


// Append an SVG group
var chartGroup = svg.append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);


// Initial Params
var chosenXAxis = "Percent_below_poverty_level"

// function used for updating x-scale var upon click on axis label
function xScale(povertyData, chosenXAxis) {
    // create scales
    var xLinearScale = d3.scaleLinear()
        .domain([d3.min(povertyData, d => d[chosenXAxis]) * 0.8,
            d3.max(povertyData, d => d[chosenXAxis]) * 1.2
        ])
        .range([0, width])

    return xLinearScale

};

// function used for updating xAxis var upon click on axis label
function renderAxes(newXScale, xAxis) {
    var bottomAxis = d3.axisBottom(newXScale)

    xAxis.transition()
        .duration(1000)
        .call(bottomAxis)

    return xAxis
}

// function used for updating circles group with a transition to
// new circles
function renderCircles(circlesGroup, newXScale, chosenXaxis) {

    circlesGroup.transition()
        .duration(1000)
        .attr("cx", d => newXScale(d[chosenXAxis]))

    return circlesGroup
};

// function used for updating circles group with new tooltip
function updateToolTip(chosenXAxis, circlesGroup) {

    if (chosenXAxis == "Percent_below_poverty_level") {
        var label = "Percent below poverty level:"
    } else {
        var label = "Percent without health coverage"
    }

    var toolTip = d3.tip()
        .attr("class", "tooltip")
        .offset([80, -60])
        .html(function (d) {
            return (`${d.Geography}<br>${label} ${d[chosenXAxis]} <br> ${"Percent Without Health Coverage: "} ${d["Percent_without_health_coverage"]}`);
        });


    circlesGroup.call(toolTip);

    circlesGroup.on("mouseover", function (data) {
            toolTip.show(data);
        })
        // onmouseout event
        .on("mouseout", function (data, index) {
            toolTip.hide(data);
        });

    return circlesGroup
}

// Retrieve data from the CSV file and execute everything below  
d3.csv("assets/poverty_vs_health.csv").then((povertyData) => {

    // parse data
    povertyData.forEach(function (data) {
        data.Percent_below_poverty_level = +data.Percent_below_poverty_level;
        data.Percent_without_health_coverage = +data.Percent_without_health_coverage;

    });

    // xLinearScale function above csv import
    var xLinearScale = xScale(povertyData, chosenXAxis)

    // Create y scale function
    var yLinearScale = d3.scaleLinear()
        .domain([0, d3.max(povertyData, d => d.Percent_without_health_coverage)])
        .range([height, 0]);

    // Create initial axis functions
    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);

    // append x axis
    var xAxis = chartGroup.append("g")
        .classed("x-axis", true)
        .attr("transform", `translate(0, ${height})`)
        .call(bottomAxis)

    // append y axis
    chartGroup.append("g")
        .call(leftAxis)

    // append initial circles
    var circlesGroup = chartGroup.selectAll("circle")
        .data(povertyData)
        .enter()
        .append("circle")
        .attr("cx", d => xLinearScale(d[chosenXAxis]))
        .attr("cy", d => yLinearScale(d.Percent_without_health_coverage))
        .attr("r", 15)
        .attr("fill", "pink")
        .attr("opacity", ".5");

        
    var circleLabels = chartGroup.selectAll("text")
        .data(povertyData)
        .enter()
        .append("text")
        .attr("x", d => xLinearScale(d[chosenXAxis]))
        .attr("y", d => yLinearScale(d.Percent_without_health_coverage))
        .attr("dy", "0.3em")
        .attr("text-anchor", "middle")
        .attr("fill", "grey")
        .text(d => {console.log(d.Locationabbr); return d.Locationabbr})
        
    console.log(povertyData);
    // Create group for  2 x- axis labels
    var labelsGroup = chartGroup.append("g")
        .attr("transform", `translate(${width/2}, ${height + 20})`)

    var Percent_below_poverty_level_label = labelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 20)
        .attr("value", "Percent_below_poverty_level") //value to grab for event listener
        .classed("active", true)
        .text("Percent_below_poverty_level(%)");

    chartGroup.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left/2)
        .attr("x", 0 - (height - 40))
        .attr("dy", "1em")
        .classed("axis-text", true)
        .text("Percentage Without Health Coverage ( % ) ");



    // append y axis
    // var Percent_without_health_coverage_label = labelsGroup.append("text")
    //     .attr("x", 0)
    //     .attr("y", 40)
    //     .attr("value", "Percentage_with_health_coverage") //value to grab for event listener
    //     .classed("inactive", true)
    //     .text("Percentage_with_health_coverage(%)");


    // updateToolTip function above csv import
    var circlesGroup = updateToolTip(chosenXAxis, circlesGroup)

    // x axis labels event listener
    labelsGroup.selectAll("text")
        .on("click", function () {
            // get value of selection
            var value = d3.select(this).attr("value")
            if (value != chosenXAxis) {

                // replaces chosenXAxis with value
                chosenXAxis = value;

                // console.log(chosenXAxis)

                // functions here found above csv import
                // updates x scale for new data
                xLinearScale = xScale(povertyData, chosenXAxis);

                // updates x axis with transition
                xAxis = renderAxes(xLinearScale, xAxis);

                // updates circles with new x values
                circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis);

                // updates tooltips with new info
                circlesGroup = updateToolTip(chosenXAxis, circlesGroup);

                // changes classes to change bold text
                if (chosenXAxis == "num_albums") {
                    albumsLabel
                        .classed("active", true)
                        .classed("inactive", false)
                    hairLengthLabel
                        .classed("active", false)
                        .classed("inactive", true)
                } else {
                    albumsLabel
                        .classed("active", false)
                        .classed("inactive", true)
                    hairLengthLabel
                        .classed("active", true)
                        .classed("inactive", false)
                };
            };
        });
});