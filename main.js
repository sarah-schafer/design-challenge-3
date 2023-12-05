let city1;
let city2;
console.log("test");

let city1Name = "CLT";
let city2Name = "CQT";

let recMaxTemp;
let recMinTemp;
let earliestDay;
let latestDay;

let svg = d3.select("svg");
var svgWidth = +svg.attr('width');
var svgHeight = +svg.attr('height');

let chartG = svg.append("g")
  .classed("chartG", true);
let x;
let y;

var padding = {t: 60, r: 40, b: 30, l: 40};

// Compute chart dimensions
var chartWidth = svgWidth - padding.l - padding.r;
var chartHeight = svgHeight - padding.t - padding.b;

var parseDate = d3.timeParse('%Y-%m-%e');


function onCity1Change(){
  var select = d3.select('#city1Selector').node();
  var newCity1Name = select.options[select.selectedIndex].value;
  csvProcessing(newCity1Name, true);
}

function onCity2Change(){
  var select = d3.select('#city2Selector').node();
  var newCity2Name = select.options[select.selectedIndex].value;
  csvProcessing(newCity2Name, false);
}


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


function csvProcessing(newCityName, isCity1){

  let csvName = "/data/" + newCityName + ".csv";
  d3.csv(csvName, dataPreprocessor).then(function(data) {

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


    } else if(city1){ // city1 being loaded, city2 does not exist
      let city1RecMinTemp = d3.min(city1.map(function(d){
        return d.record_min_temp;
      }));
      let city1RecMaxTemp = d3.max(city1.map(function(d){
        return d.record_max_temp;
      }));
      if(recMinTemp){
        if(recMinTemp > city1RecMinTemp){
          recMinTemp = city1RecMinTemp;
        }
      } else {
        recMinTemp = city1RecMinTemp;
      }
      if(recMaxTemp){
        if(recMaxTemp < city1RecMaxTemp){
          recMaxTemp = city1RecMaxTemp;
        }
      } else {
        recMaxTemp = city1RecMaxTemp;
      }

      earliestDay = d3.min(city1.map(function(d){
        return d.date;
      }));

      latestDay = d3.max(city1.map(function(d){
        return d.date;
      }));
    } else { // city2 being loaded, city1 does not exist
      let city2RecMinTemp = d3.min(city2.map(function(d){
        return d.record_min_temp;
      }));
      let city2RecMaxTemp = d3.max(city2.map(function(d){
        return d.record_max_temp;
      }));

      if(recMinTemp){
        if(recMinTemp > city2RecMinTemp){
          recMinTemp = city2RecMinTemp;
        }
      } else {
        recMinTemp = city2RecMinTemp;
      }
      if(recMaxTemp){
        if(recMaxTemp < city2RecMaxTemp){
          recMaxTemp = city2RecMaxTemp;
        }
      } else {
        recMaxTemp = city2RecMaxTemp;
      }


      earliestDay = d3.min(city2.map(function(d){
        return d.date;
      }));

      latestDay = d3.max(city2.map(function(d){
        return d.date;
      }));
    }


    chartG.selectAll(".chartG1").remove();
    chartG.selectAll(".chartG2").remove();
    chartG.selectAll(".axis")
      .remove();

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


    if(!isCity1 && city1){
      updateChart(true);
    }


    updateChart(isCity1);

    if(isCity1 && city2){
      updateChart(false);
    }

  });
}

csvProcessing(city1Name, true);
csvProcessing(city2Name, false);



function updateChart(isCity1){

  let currentChartG;
  let color;
  let currentCity;

  if(isCity1){
    console.log("In questionable if statement");
    currentChartG = chartG.append("g")
      .classed("chartG1", true);
    color = "#69b3a2";
    currentCity = city1;
  } else {
    currentChartG = chartG.append("g")
      .classed("chartG2", true);
    color = "#4C4082";
    currentCity = city2;
  }


  // Building lollipops
  let lollipopsG = currentChartG.append("g")
    .classed("lollipops", true)
    .attr("transform", "translate("+padding.l+", "+padding.t+")");

  // Lines
  lollipopsG.selectAll("myline")
     .data(currentCity)
     .join("line")
       .attr("x1", function(d) { return x(d.date); })
       .attr("x2", function(d) { return x(d.date); })
       .attr("y1", function(d) { return y(d.actual_min_temp); })
       .attr("y2", function(d) { return y(d.actual_max_temp); })
       .attr("stroke", color)
       .attr("stroke-width", "1px");

  // Circles for min temp
  lollipopsG.selectAll("mycircle")
    .data(currentCity)
    .join("circle")
      .attr("cx", function(d) { return x(d.date); })
      .attr("cy", function(d) { return y(d.actual_min_temp); })
      .attr("r", "6")
      .style("fill", color)
      .style("opacity", "0.7");

  // Circles for min temp
  lollipopsG.selectAll("mycircle")
        .data(currentCity)
        .join("circle")
          .attr("cx", function(d) { return x(d.date); })
          .attr("cy", function(d) { return y(d.actual_max_temp); })
          .attr("r", "6")
          .style("fill", color)
          .style("opacity", "0.7");
}
