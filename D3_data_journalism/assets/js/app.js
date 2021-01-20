// @TODO: YOUR CODE HERE!
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

var svg = d3
        .select("#scatter")
        .append("svg")
        .attr("width", svgWidth)
        .attr("height", svgHeight);

  // Append an SVG group
var chartGroup = svg.append("g")
.attr("transform", `translate(${margin.left}, ${margin.top})`);

var chosenXAxis = "poverty";
var chosenYAxis = "healthcare";

// function used for updating x-scale var upon click on axis label
function xScale(data, chosenXAxis) {
    // create scales
    var xLinearScale = d3.scaleLinear()
      .domain([d3.min(data, d => d[chosenXAxis]) * 0.8,
        d3.max(data, d => d[chosenXAxis]) * 1.2
      ])
      .range([0, width]);
  
    return xLinearScale;
  }

  // function used for updating y-scale var upon click on axis label
function yScale(data, chosenYAxis) {
    // create scales
    var yLinearScale = d3.scaleLinear()
                        .domain([0, d3.max(data, d => d[chosenYAxis])])
                        .range([height, 0]);
 
    return yLinearScale;
  }

  // function used for updating xAxis var upon click on axis label
function renderAxes(newXScale, xAxis) {
    var bottomAxis = d3.axisBottom(newXScale);
  
    xAxis.transition()
      .duration(1000)
      .call(bottomAxis);
  
    return xAxis;
  }

   // function used for updating yAxis var upon click on axis label
function renderYAxes(newYScale, yAxis) {
    var leftAxis = d3.axisLeft(newYScale);
  
    yAxis.transition()
      .duration(1000)
      .call(leftAxis);
  
    return yAxis;
  }

  function renderText(textNew, newXScale, chosenXAxis, newYScale, chosenYAxis) {
    textNew.transition()
        .duration(2000)
        .attr("x", d => newXScale(d[chosenXAxis]))
        .attr("y", d => newYScale(d[chosenYAxis]));
    return textNew;
}
  // function used for updating circles group with a transition to
// new circles
function renderCircles(circlesGroup, newXScale, chosenXAxis, newYScale, chosenYAxis) {

    circlesGroup.transition()
      .duration(1000)
      .attr("cx", d => newXScale(d[chosenXAxis]))
      .attr("cy", d => newYScale(d[chosenYAxis]));
  
    return circlesGroup;
  }

  // function used for updating circles group with new tooltip
function updateToolTip(chosenXAxis, chosenYAxis,circlesGroup) {

    var label;
    if (chosenXAxis === "poverty") {
        label = "Poverty:";
      }
      else if (chosenXAxis === "age"){
        label = "Age";
      }
      else {
        label = "Household Income:";
      }
    
    var toolTip = d3.tip()
                .attr("class", "tooltip")
                .offset([5, -10])
                .html(function(d) {
                return (`${d.state}<br>${label}${d[chosenXAxis]}<br>${chosenYAxis}${d[chosenYAxis]}`);
                });

    circlesGroup.call(toolTip);

    circlesGroup.on("mouseover", function(data) {
        toolTip.show(data);
      })

      // onmouseout event
    .on("mouseout", function(data, index) {
        toolTip.hide(data);
      });
  
      return circlesGroup;     
}

// Retrieve data from the CSV file and execute everything below
d3.csv("assets/data/data.csv").then(function(data, err) {
    if (err) throw err;

    // parse data
    data.forEach(function(data) {
    data.poverty = +data.poverty;
    data.healthcare = +data.healthcare;
    data.age = +data.age;
    data.income = +data.income;
    data.obesity = +data.obesity;
    data.smokes = +data.smokes;
  });

  // xLinearScale function above csv import
  var xLinearScale = xScale(data, chosenXAxis);

  // Create y scale function
  var yLinearScale = d3.scaleLinear()
    .domain([0, d3.max(data, d => d[chosenYAxis])])
    .range([height, 0]);

    var yLinearScale = yScale(data, chosenYAxis)

    // Create initial axis functions
  var bottomAxis = d3.axisBottom(xLinearScale);
  var leftAxis = d3.axisLeft(yLinearScale);

  // append x axis
  var xAxis = chartGroup.append("g")
    .classed("x-axis", true)
    .attr("transform", `translate(0, ${height})`)
    .call(bottomAxis);

    // append y axis
  var yAxis = chartGroup.append("g")
                        .classed("y-axis",true)
                        .attr("transform", `translate(0, 0)`)
                        .call(leftAxis);

  // append initial circles
  var circlesGroup = chartGroup.selectAll("circle")
    .data(data)
    .enter()
    .append("circle")
    .attr("cx", d => xLinearScale(d[chosenXAxis]))
    .attr("cy", d => yLinearScale(d[chosenYAxis]))
    .attr("r", 20)
    .attr("fill", "pink")
    .attr("opacity", ".5");

    //set the Text inside the bubble
    var statetxtGroup = chartGroup.selectAll(".stateText")
                    .data(data)
                    .enter()
                    .append("text")
                    .classed("stateText",true)
                    .attr("x", d => xLinearScale(d[chosenXAxis]))
                    .attr("y", d => yLinearScale(d[chosenYAxis]))
                    .text(function(d) {
                        return d.abbr;
                    })
                    .style("text-anchor", "middle")
                    .style("font-weight", "bold")
                    .style("font-size", "7pt")
                    .style("fill", "#344761");
    

  // Create group for  x-axis labels
  var labelsGroup = chartGroup.append("g")
    .attr("transform", `translate(${width / 3}, ${height + 20})`);

  // Create group for  y-axis labels
    var yLabelsGroup = chartGroup.append("g")
                .attr("transform", `translate(0, 0)`)

    var healthcareLabel = yLabelsGroup.append("text")
                        .attr("transform", "rotate(-90)")
                        .attr("y", -40)
                        .attr("x", -180)
                        .attr("value", "healthcare")
                        .classed("active", true)
                        .text("Lacks healthcare (%)");

    var obesityLabel = yLabelsGroup.append("text")
                        .attr("transform", "rotate(-90)")
                        .attr("y", -80)
                        .attr("x", -180)
                        .attr("value", "obesity")
                        .classed("inactive", true)
                        .text("Obesity (%)");

    var smokesLabel = yLabelsGroup.append("text")
                        .attr("transform", "rotate(-90)")
                        .attr("y", -60)
                        .attr("x", -180)
                        .attr("value", "smokes")
                        .classed("inactive", true)
                        .text("Smokes (%)");


    var povertyLabel = labelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 20)
    .attr("value", "poverty") // value to grab for event listener
    .classed("active", true)
    .text("Poverty");

    var ageLabel = labelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 40)
    .attr("value", "age") // value to grab for event listener
    .classed("inactive", true)
    .text("Age");


    var incomeLabel = labelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 60)
    .attr("value", "income") // value to grab for event listener
    .classed("inactive", true)
    .text("Household Income");

    
  // updateToolTip function above csv import
  var circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

  yLabelsGroup.selectAll("text")
  .on("click", function() {
    var value = d3.select(this).attr("value");
    if (value !== chosenXAxis) {
        chosenYAxis = value;
        xLinearScale = xScale(data, chosenXAxis);
        yLinearScale = yScale(data,chosenYAxis);
        yAxis = renderYAxes(yLinearScale,yAxis)
        xAxis = renderAxes(xLinearScale, xAxis);

        circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, 
                                yLinearScale, chosenYAxis);
        statetxtGroup = renderText(statetxtGroup,xLinearScale, chosenXAxis, 
                yLinearScale, chosenYAxis)
                
            
        // changes classes to change bold text
        if (chosenYAxis === "healthcare") {
            healthcareLabel
            .classed("active", true)
            .classed("inactive", false);
            ageLabel
            .classed("active", false)
            .classed("inactive", true);
            smokesLabel
            .classed("active", false)
            .classed("inactive", true);
        }
        else if (chosenYAxis === "obesity") {
            obesityLabel
            .classed("active", true)
            .classed("inactive", false);
            healthcareLabel
            .classed("active", false)
            .classed("inactive", true);
            smokesLabel
            .classed("active", false)
            .classed("inactive", true);
        } 
        else {
            smokesLabel
            .classed("active", true)
            .classed("inactive", false);
            healthcareLabel
            .classed("active", false)
            .classed("inactive", true);
            obesityLabel
            .classed("active", false)
            .classed("inactive", true);
            }
        }
  })

  // x axis labels event listener
  labelsGroup.selectAll("text")
    .on("click", function() {
      // get value of selection
      var value = d3.select(this).attr("value");
      if (value !== chosenXAxis) {

        // replaces chosenXAxis with value
        chosenXAxis = value;

        console.log(chosenXAxis, chosenYAxis)

        // functions here found above csv import
        // updates x scale for new data
        xLinearScale = xScale(data, chosenXAxis);
        yLinearScale = yScale(data,chosenYAxis);
        // updates x axis with transition
        xAxis = renderAxes(xLinearScale, xAxis);
        yAxis = renderYAxes(yLinearScale,yAxis)

        // updates circles with new x values
        circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, 
                                        yLinearScale, chosenYAxis);
        
        
        // updates tooltips with new info
        circlesGroup = updateToolTip(chosenXAxis, circlesGroup);

        statetxtGroup = renderText(statetxtGroup,xLinearScale, chosenXAxis, 
                                    yLinearScale, chosenYAxis)

        // changes classes to change bold text
        if (chosenXAxis === "poverty") {
            povertyLabel
            .classed("active", true)
            .classed("inactive", false);
            ageLabel
            .classed("active", false)
            .classed("inactive", true);
            incomeLabel
            .classed("active", false)
            .classed("inactive", true);
        }
        else if (chosenXAxis === "age") {
            povertyLabel
            .classed("active", false)
            .classed("inactive", true);
            ageLabel
            .classed("active", true)
            .classed("inactive", false);
            incomeLabel
            .classed("active", false)
            .classed("inactive", true);
        } 
        else {
          incomeLabel
            .classed("active", true)
            .classed("inactive", false);
          povertyLabel
            .classed("active", false)
            .classed("inactive", true);
          ageLabel
            .classed("active", false)
            .classed("inactive", true);
          
        }
      }
    });
}).catch(function(error) {
  console.log(error);
});
















  



  
  
  
  



