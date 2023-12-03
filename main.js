let city1;

let city1Name = "CLT";

let recMaxTemp;
let recMinTemp;
let earliestDay;
let latestDay;

let svg = d3.select("svg");
var svgWidth = +svg.attr('width');
var svgHeight = +svg.attr('height');

var padding = {t: 60, r: 40, b: 30, l: 40};

// Compute chart dimensions
var chartWidth = svgWidth - padding.l - padding.r;
var chartHeight = svgHeight - padding.t - padding.b;

var parseDate = d3.timeParse('%Y-%m-%e');


function onCity1Change(){
  var select = d3.select('#city1Selector').node();
  var newCity1Name = select.options[select.selectedIndex].value;
  csvProcessing(newCity1Name);
}

/*
function formatNumberStrings(data){
  let formattedData = data;
  formattedData.
}
*/
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


function csvProcessing(newCity1Name){

  svg.select(".chartG").remove();

  let csvName = "/data/" + newCity1Name + ".csv";
  d3.csv(csvName, dataPreprocessor).then(function(data) {
    city1 = data;
    recMinTemp = d3.min(city1.map(function(d){
      return d.record_min_temp;
    }));
    recMaxTemp = d3.max(city1.map(function(d){
      return d.record_max_temp;
    }));

    city1.forEach((d, i) => {
      d.date = parseDate(d.date);
    });

    earliestDay = d3.min(data.map(function(d){
      return d.date;
    }));

    latestDay = d3.max(data.map(function(d){
      return d.date;
    }));

    updateChart(recMinTemp, recMaxTemp, earliestDay, latestDay);

  });
}

csvProcessing(city1Name);



function updateChart(recMinTemp, recMaxTemp, earliestDay, latestDay){

  let chartG = svg.append("g")
    .classed("chartG", true);


  var y = d3.scaleLinear()
    .domain([recMinTemp, recMaxTemp])
    .range([chartHeight, 0]);
  chartG.append("g")
    .attr("transform", "translate(" + padding.l+", "+ padding.t +")")
    .call(d3.axisLeft(y))

  var x = d3.scaleTime()
    .domain([earliestDay, latestDay])
    .range([0, chartWidth]);
  chartG.append("g")
    .attr("transform", "translate("+ padding.l+", " + (padding.t + chartHeight) + ")")
    .call(d3.axisBottom(x));

  // Building lollipops
  let lollipopsG = chartG.append("g")
    .classed("lollipops", true)
    .attr("transform", "translate("+padding.l+", "+padding.t+")");

  // Lines
  lollipopsG.selectAll("myline")
     .data(city1)
     .join("line")
       .attr("x1", function(d) { return x(d.date); })
       .attr("x2", function(d) { return x(d.date); })
       .attr("y1", function(d) { return y(d.actual_min_temp); })
       .attr("y2", function(d) { return y(d.actual_max_temp); })
       .attr("stroke", "#69b3a2")
       .attr("stroke-width", "1px");

  // Circles for min temp
  lollipopsG.selectAll("mycircle")
    .data(city1)
    .join("circle")
      .attr("cx", function(d) { return x(d.date); })
      .attr("cy", function(d) { return y(d.actual_min_temp); })
      .attr("r", "6")
      .style("fill", "#69b3a2")
      .style("opacity", "0.7");

  // Circles for min temp
  lollipopsG.selectAll("mycircle")
        .data(city1)
        .join("circle")
          .attr("cx", function(d) { return x(d.date); })
          .attr("cy", function(d) { return y(d.actual_max_temp); })
          .attr("r", "6")
          .style("fill", "#69b3a2")
          .style("opacity", "0.7");
}
