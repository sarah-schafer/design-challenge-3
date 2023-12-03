let city1;

let svg = d3.select("svg");
var svgWidth = +svg.attr('width');
var svgHeight = +svg.attr('height');

var padding = {t: 60, r: 40, b: 30, l: 40};

// Compute chart dimensions
var chartWidth = svgWidth - padding.l - padding.r;
var chartHeight = svgHeight - padding.t - padding.b;

var parseDate = d3.timeParse('%Y-%m-%e');

d3.csv("/data/CLT.csv").then(function(data) {
  city1 = data;
  let recMinTemp = d3.min(city1.map(function(d){
    return d.record_min_temp;
  }));
  let recMaxTemp = d3.max(city1.map(function(d){
    return d.record_max_temp;
  }));


  city1.forEach((d, i) => {
    d.date = parseDate(d.date);
  });

  let earliestDay = d3.min(city1.map(function(d){
    return d.date;
  }));

  let latestDay = d3.max(city1.map(function(d){
    return d.date;
  }));

  var y = d3.scaleLinear()
    .domain([recMinTemp, recMaxTemp])
    .range([chartHeight, 0]);
  svg.append("g")
    .attr("transform", "translate(" + padding.l+", "+ padding.t +")")
    .call(d3.axisLeft(y))

  var x = d3.scaleTime()
    .domain([earliestDay, latestDay])
    .range([0, chartWidth]);
  svg.append("g")
    .attr("transform", "translate("+ padding.l+", " + (padding.t + chartHeight) + ")")
    .call(d3.axisBottom(x));

  // Building lollipops
  let lollipopsG = svg.append("g")
    .classed("lollipops", true)
    .attr("transform", "translate("+padding.l+", "+padding.t+")");

  // Lines
  lollipopsG.selectAll("myline")
     .data(data)
     .join("line")
       .attr("x1", function(d) { return x(d.date); })
       .attr("x2", function(d) { return x(d.date); })
       .attr("y1", function(d) { return y(d.actual_min_temp); })
       .attr("y2", function(d) { return y(d.actual_max_temp); })
       .attr("stroke", "#69b3a2")
       .attr("stroke-width", "1px");

  // Circles for min temp
  lollipopsG.selectAll("mycircle")
    .data(data)
    .join("circle")
      .attr("cx", function(d) { return x(d.date); })
      .attr("cy", function(d) { return y(d.actual_min_temp); })
      .attr("r", "6")
      .style("fill", "#69b3a2")
      .style("opacity", "0.7");

  // Circles for min temp
  lollipopsG.selectAll("mycircle")
        .data(data)
        .join("circle")
          .attr("cx", function(d) { return x(d.date); })
          .attr("cy", function(d) { return y(d.actual_max_temp); })
          .attr("r", "6")
          .style("fill", "#69b3a2")
          .style("opacity", "0.7");




});
