/*
Created by Sarah "Sally" Schafer
For INFO 474 Interactive Information Visualizations
Design Challenge 3 Final Deliverable
*/


// Initialize Global Variables
let city1; // data
let city2; // data

let city1Name = "CLT"; // default value
let city2Name = "CQT"; // default value

// Bounds for x and y axes
let recMaxTemp;
let recMinTemp;
let earliestDay;
let latestDay;
let recPrecipitation;

let svg = d3.select("svg.chartSvg");
var svgWidth = +svg.attr('width');
var svgHeight = +svg.attr('height');

let chartG = svg.append("g")
  .classed("chartG", true);
let x;
let y;
let radius;

let cloudText;

var padding = {t: 30, r: 40, b: 30, l: 40};

// Compute chart dimensions
var chartWidth = svgWidth - padding.l - padding.r;
var chartHeight = svgHeight - padding.t - padding.b;

// To handle dates in datasets
var parseDate = d3.timeParse('%Y-%m-%e');

// Tooltip global variables
let tooltipG;
let tooltipDate;
let tooltipTemp;
let tooltipRain;


// scrolling interaction
let scrolling = false;
let initialLoading = true;
window.addEventListener('scroll',(event) => {
     scrolling = true;
});

setInterval(() => {
    if (scrolling) {
        scrolling = false;
        if(window.scrollY >= 500 & initialLoading){
          csvProcessing(city1Name, true);
          csvProcessing(city2Name, false);
        }
    }
},300);



// Handle Tooltip
function callTooltip(){
  tooltipG = chartG.append("g")
    .classed("tooltipG", true)
    .attr("opacity", "0");
  tooltipG.append("rect")
    .attr("fill", "white")
    .attr("stroke", "black")
    .attr("x", "0")
    .attr("y", "0")
    .attr("width", "100px")
    .attr("height", "40px");
  tooltipDate = tooltipG.append("text")
    .attr("font-size", "9px")
    .attr("x", "2")
    .attr("y", "12");
  tooltipTemp = tooltipG.append("text")
    .attr("font-size", "9px")
    .attr("x", "2")
    .attr("y", "23");
  tooltipRain = tooltipG.append("text")
    .attr("font-size", "9px")
    .attr("x", "2")
    .attr("y", "33");
}

// Event Handling for changing first city
function onCity1Change(){
  var select = d3.select('#city1Selector').node();
  var newCity1Name = select.options[select.selectedIndex].value;
  csvProcessing(newCity1Name, true);
}

// Event Handling for changing second city
function onCity2Change(){
  var select = d3.select('#city2Selector').node();
  var newCity2Name = select.options[select.selectedIndex].value;
  csvProcessing(newCity2Name, false);
}

// Helper function to set the scales used each time the visualization is drawn
function setScalesAndAxes(){
  y = d3.scaleLinear()
    .domain([recMinTemp, recMaxTemp])
    .range([chartHeight, 0]);
  chartG.append("g")
    .classed("axis", true)
    .attr("transform", "translate(" + padding.l+", "+ padding.t +")")
    .call(d3.axisLeft(y))

  x = d3.scaleTime()
    .domain([earliestDay, latestDay])
    .range([0, chartWidth]);
  chartG.append("g")
    .classed("axis", true)
    .attr("transform", "translate("+ padding.l+", " + (padding.t + chartHeight) + ")")
    .call(d3.axisBottom(x));

  chartG.append("text")
    .classed("axis", true)
    .attr("text-anchor", "middle")
    .attr("font-size", "14")
    .attr("transform", "translate("+ svgWidth/2 + ", " + (svgHeight - 2)+ ")")
    .text("Date");
  chartG.append("text")
    .classed("axis", true)
    .attr("text-anchor", "middle")
    .attr("font-size", "14")
    .attr("transform", "translate(14, " + (svgHeight/2)+ ") rotate(270)")
    .text("Temperature (Degrees Fahrenheit)");

  radius = d3.scaleLinear()
    .domain([0, Math.sqrt(recPrecipitation)])
    .range([0, 20]);

  let formattedEarliest = formatDate(earliestDay);
  let formattedLatest = formatDate(latestDay);
  let formattedText = "From " + formattedEarliest + " to " + formattedLatest;

  cloudText = d3.select(".dateTitle")
    .text(formattedText);
  }

// Helper function to format dates to be displayed
function formatDate(date){
  let localeString = date.toLocaleString();
  let indexOfComma = localeString.indexOf(",");
  let formattedString = localeString.substr(0, indexOfComma);
  return formattedString;
}

// Used to process data correctly (numbers as numbers not strings)
function dataPreprocessor(row) {
    return {
        date: row.date,
        actual_mean_temp: +row.actual_mean_temp,
        actual_min_temp: +row.actual_min_temp,
        actual_max_temp: +row.actual_max_temp,
        average_min_temp: +row.average_min_temp,
        average_max_temp: +row.average_max_temp,
        record_min_temp: +row.record_min_temp,
        record_max_temp: +row.record_max_temp,
        record_min_temp_year: row.record_min_temp,
        record_max_temp_year: row.record_max_temp,
        actual_precipitation: +row.actual_precipitation,
        average_precipitation: +row.average_precipitation,
        record_precipitation: +row.record_precipitation
    };
}

// Called whenever data needs to be loaded
function csvProcessing(newCityName, isCity1){
  if(newCityName != "NoCity"){ // If the selected city is not no city
    let csvName = "/data/" + newCityName + ".csv";
    d3.csv(csvName, dataPreprocessor).then(function(data) {
      // determine where to save data
      if(isCity1){
        // save new data
        city1 = data;
        // process dates
        city1.forEach((d, i) => {
          d.date = parseDate(d.date);
        });
      } else {
        // save new data
        city2 = data;
        // process dates
        city2.forEach((d, i) => {
          d.date = parseDate(d.date);
        });
      }

      if(!initialLoading){ // Not the first time loading in city1 data
        // Determine scales
        if(city1 && city2){ // both cities exist
          let city1RecMinTemp = d3.min(city1.map(function(d){
            return d.record_min_temp;
          }));
          let city1RecMaxTemp = d3.max(city1.map(function(d){
            return d.record_max_temp;
          }));

          let city2RecMinTemp = d3.min(city2.map(function(d){
            return d.record_min_temp;
          }));
          let city2RecMaxTemp = d3.max(city2.map(function(d){
            return d.record_max_temp;
          }));

          if(city1RecMinTemp <= city2RecMinTemp){
            recMinTemp = city1RecMinTemp;
          } else {
            recMinTemp = city2RecMinTemp;
          }

          if(city1RecMaxTemp >= city2RecMaxTemp){
            recMaxTemp = city1RecMaxTemp;
          } else {
            recMaxTemp = city2RecMaxTemp;
          }

          let city1EarliestDay = d3.min(city1.map(function(d){
            return d.date;
          }));

          let city1LatestDay = d3.max(city1.map(function(d){
            return d.date;
          }));
          let city2EarliestDay = d3.min(city1.map(function(d){
            return d.date;
          }));

          let city2LatestDay = d3.max(city1.map(function(d){
            return d.date;
          }));

          if(city1EarliestDay <= city2EarliestDay){
            earliestDay = city1EarliestDay;
          } else {
            earliestDay = city2EarliestDay;
          }

          if(city1LatestDay < city2LatestDay){
            latestDay = city2LatestDay;
          } else {
            latestDay = city1LatestDay;
          }

          let city1RecPrecip = d3.max(city1.map(function(d){
            return d.record_precipitation;
          }));
          let city2RecPrecip = d3.max(city2.map(function(d){
            return d.record_precipitation;
          }));
          if(city1RecPrecip >= city2RecPrecip){
            recPrecipitation = city1RecPrecip;
          } else {
            recPrecipitation = city2RecPrecip;
          }


        } else if(city1 && !initialLoading){ // city1 being loaded, city2 does not exist
          let city1RecMinTemp = d3.min(city1.map(function(d){
            return d.record_min_temp;
          }));
          let city1RecMaxTemp = d3.max(city1.map(function(d){
            return d.record_max_temp;
          }));

          recMinTemp = city1RecMinTemp;
          recMaxTemp = city1RecMaxTemp;

          earliestDay = d3.min(city1.map(function(d){
            return d.date;
          }));

          latestDay = d3.max(city1.map(function(d){
            return d.date;
          }));

          recPrecipitation = d3.max(city1.map(function(d){
            return d.record_precipitation;
          }));
        } else { // city2 being loaded, city1 does not exist
          let city2RecMinTemp = d3.min(city2.map(function(d){
            return d.record_min_temp;
          }));
          let city2RecMaxTemp = d3.max(city2.map(function(d){
            return d.record_max_temp;
          }));

          recMinTemp = city2RecMinTemp;
          recMaxTemp = city2RecMaxTemp;

          earliestDay = d3.min(city2.map(function(d){
            return d.date;
          }));

          latestDay = d3.max(city2.map(function(d){
            return d.date;
          }));
          recPrecipitation = d3.max(city2.map(function(d){
            return d.record_precipitation;
          }));
        }

        // Remove all data currently on graph, so new data can be displayed
        chartG.selectAll(".chartG1").remove();
        chartG.selectAll(".chartG2").remove();
        chartG.selectAll(".axis")
          .remove();
        chartG.selectAll(".tooltipG").remove();

        setScalesAndAxes();
        // if currently loading in city2 and city1 exists, draw city1 first
        if(!isCity1 && city1){
          updateChart(true);
        }
        // draw the chart we are currently working with
        updateChart(isCity1);
        // if currently loading city1 and city2 exists, draw city2
        if(isCity1 && city2){
          updateChart(false);
        }

        callTooltip();
      } else { // is first time loading in city1 data, change boolean value
        initialLoading = false;
      }
    });
  } else { // at least one of the cities has been selected with no city selected
    if(isCity1){ // determine which city to make undefined
      city1 = undefined;
    } else {
      city2 = undefined;
    }

    if(isCity1 && city2 != undefined){ // still have city2 data to display
      // Remove all data currently on graph, so new data can be displayed
      chartG.selectAll(".chartG1").remove();
      chartG.selectAll(".chartG2").remove();
      chartG.selectAll(".axis").remove();
      chartG.selectAll(".tooltipG").remove();

      let city2RecMinTemp = d3.min(city2.map(function(d){
        return d.record_min_temp;
      }));
      let city2RecMaxTemp = d3.max(city2.map(function(d){
        return d.record_max_temp;
      }));

      recMinTemp = city2RecMinTemp;
      recMaxTemp = city2RecMaxTemp;

      earliestDay = d3.min(city2.map(function(d){
        return d.date;
      }));

      latestDay = d3.max(city2.map(function(d){
        return d.date;
      }));
      recPrecipitation = d3.max(city2.map(function(d){
        return d.record_precipitation;
      }));
      setScalesAndAxes();
      updateChart(false);
      callTooltip();
    } else if(!isCity1 && city1 != undefined){ // still have city1 data to display
      // Remove all data currently on graph, so new data can be displayed
      chartG.selectAll(".chartG1").remove();
      chartG.selectAll(".chartG2").remove();
      chartG.selectAll(".axis")
        .remove();
      chartG.selectAll(".tooltipG").remove();

      let city1RecMinTemp = d3.min(city1.map(function(d){
        return d.record_min_temp;
      }));
      let city1RecMaxTemp = d3.max(city1.map(function(d){
        return d.record_max_temp;
      }));

      recMinTemp = city1RecMinTemp;
      recMaxTemp = city1RecMaxTemp;

      earliestDay = d3.min(city1.map(function(d){
        return d.date;
      }));

      latestDay = d3.max(city1.map(function(d){
        return d.date;
      }));

      recPrecipitation = d3.max(city1.map(function(d){
        return d.record_precipitation;
      }));
      setScalesAndAxes();
      updateChart(true);
      callTooltip();
    } else { // Neither city has data to be displayed
      chartG.selectAll(".chartG1").remove();
      chartG.selectAll(".chartG2").remove();
      chartG.selectAll(".axis")
        .remove();
      chartG.selectAll(".tooltipG").remove();

      chartG.append("text")
        .classed("chartG1", true)
        .attr("x", svgWidth / 2)
        .attr("y", svgHeight / 2)
        .attr("text-anchor", "middle")
        .text("Please select a city below")
        .style("font-size","50px")
        .style("fill", "#4C8BD7");
    }
  }
}


// Called whenever lollipops need to be drawn
function updateChart(isCity1){
  let currentChartG; // will store chart group
  let color;
  let currentCity; // will store data

  if(isCity1){
    currentChartG = chartG.append("g")
      .classed("chartG1", true);
    color = "#5e50b5";
    currentCity = city1;
  } else {
    currentChartG = chartG.append("g")
      .classed("chartG2", true);
    color = "#00d4d4";
    currentCity = city2;
  }


  // Building lollipops
  let lollipopsG = currentChartG.append("g")
    .classed("lollipops", true)
    .attr("transform", "translate("+padding.l+", "+padding.t+")");
  // Lines
  let lines = lollipopsG.selectAll("myline")
     .data(currentCity)
     .join("line")
       .attr("x1", function(d) { return x(d.date); })
       .attr("x2", function(d) { return x(d.date); })
       .attr("y1", "0")
       .attr("y2", "0")
       .attr("stroke", color)
       .attr("stroke-width", "1px")
       .style("opacity", "0.7");
  lines.transition()
    .duration(1000)
    .delay((d, i) => i * 10)
    .attr("y1", function(d) { return y(d.actual_min_temp); })
    .attr("y2", function(d) { return y(d.actual_max_temp); });

  // Circles for min temp
  let minPrecipCircles = lollipopsG.selectAll("mycircle")
    .data(currentCity)
    .join("circle")
      .attr("cx", function(d) { return x(d.date); })
      .attr("cy", "0")
      .attr("r", function(d){ return radius(d.actual_precipitation); })
      .style("fill", color)
      .style("opacity", "0");
  minPrecipCircles.transition()
    .duration(1000)
    .delay((d, i) => i * 10)
    .attr("cy", function(d) { return y(d.actual_min_temp); })
    .style("opacity", "0.4");

  let minCircles = lollipopsG.selectAll("mycircle")
        .data(currentCity)
        .join("circle")
          .attr("cx", function(d) { return x(d.date); })
          .attr("cy", "0")
          .attr("r", "4")
          .style("fill", color)
          .attr("opacity", "0");

    function hoveringMinTransition(){
      minCircles.on('mouseover', function (d, i) {
          d3.select(this).transition()
              .duration('50')
              .attr('opacity', '1');
              tooltipG.transition()
                  .duration('50')
                  .attr("opacity", '1');
              tooltipG.attr("transform", "translate("+ (x(d.date)+padding.l + 3) + ", " + (y(d.actual_min_temp)+padding.t + 3) +")");
              tooltipDate.text(formatDate(d.date));
              tooltipTemp.text("Min Temperature: " + d.actual_min_temp);
              tooltipRain.text("Precipitation: " + d.actual_precipitation);
      })
      .on('mouseout', function (d, i) {
          d3.select(this).transition()
            .duration('50')
            .attr('opacity', '0.6');
          tooltipG.transition()
            .duration('50')
            .attr("opacity", '0');
      });
    };

    minCircles.transition()
      .duration(1000)
      .delay((d, i) => i * 10)
      .attr("cy", function(d) { return y(d.actual_min_temp); })
      .attr("opacity", "0.6")
      .end().then(hoveringMinTransition);
  // Circles for max temp
  let maxPrecipCircles = lollipopsG.selectAll("mycircle")
        .data(currentCity)
        .join("circle")
          .attr("cx", function(d) { return x(d.date); })
          .attr("cy", "0")
          .attr("r", function(d){ return radius(d.actual_precipitation); })
          .style("fill", color)
          .style("opacity", "0");
  maxPrecipCircles.transition()
    .duration(1000)
    .delay((d, i) => i * 10)
    .attr("cy", function(d) { return y(d.actual_max_temp); })
    .style("opacity", "0.4");

  let maxCircles = lollipopsG.selectAll("mycircle")
          .data(currentCity)
          .join("circle")
              .classed("test", true)
              .attr("cx", function(d) { return x(d.date); })
              .attr("cy", "0" )
              .attr("r", "4")
              .attr("opacity", "0")
              .style("fill", color);

  function hoveringMaxTransition(){
    maxCircles.on('mouseover', function (d, i) {
        d3.select(this).transition()
            .duration('50')
            .attr('opacity', '1');
        tooltipG.transition()
            .duration('50')
            .attr("opacity", '1');
        tooltipG.attr("transform", "translate("+ (x(d.date)+padding.l + 3) + ", " + (y(d.actual_max_temp)+padding.t + 3) +")");
        tooltipDate.text(formatDate(d.date));
        tooltipTemp.text("Max Temperature: " + d.actual_max_temp);
        tooltipRain.text("Precipitation: " + d.actual_precipitation);
    })
    .on('mouseout', function (d, i) {
        d3.select(this).transition()
          .duration('50')
          .attr('opacity', '0.6');
        tooltipG.transition()
          .duration('50')
          .attr("opacity", '0');
    });
  }

  maxCircles.transition()
    .duration(1000)
    .delay((d, i) => i * 10)
    .attr("cy", function(d) { return y(d.actual_max_temp); })
    .attr("opacity", "0.6")
    .end().then(hoveringMaxTransition);
}
