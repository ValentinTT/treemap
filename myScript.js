//https://cdn.rawgit.com/freeCodeCamp/testable-projects-fcc/a80ce8f9/src/data/tree_map/movie-data.json.
//https://cdn.rawgit.com/freeCodeCamp/testable-projects-fcc/a80ce8f9/src/data/tree_map/kickstarter-funding-data.json
//https://cdn.rawgit.com/freeCodeCamp/testable-projects-fcc/a80ce8f9/src/data/tree_map/video-game-sales-data.json
document.addEventListener('DOMContentLoaded', () => {
  const info = "movie"
  const req = new XMLHttpRequest();
  req.open("GET", `https://cdn.rawgit.com/freeCodeCamp/testable-projects-fcc/a80ce8f9/src/data/tree_map/${info}-data.json`, true);
  req.send();
  req.onload = () => drawChart(JSON.parse(req.responseText));
});

const drawChart = (data) => {
  const margin = {
      top: 10,
      right: 10,
      bottom: 10,
      left: 10
    },
    width = 1280 - margin.left - margin.right,
    height = 920 - margin.top - margin.bottom,
    heightLegend = 120,
    heightTree = height - heightLegend;

  //Header 
  const header = d3.select("body").append("header");
  header.append("h1")
    .attr("id", "title")
    .html("Visualize Data with a Treemap Diagram");
  header.append("h4")
    .attr("id", "description")
    .html("Data Visualization Project at Free Code Camp")

  //Container
  const svg = d3.select('body')
    .append("main")
    .append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

  //Create treemap
  const scaleColor = d3.scaleOrdinal(
    [...d3.schemeDark2, ...d3.schemePaired, ...d3.schemeCategory10]);
  const treemap = d3.treemap()
    .size([width, heightTree])
    .paddingInner(1);

  // Root 
  let root = d3.hierarchy(data)
    .eachBefore(d => d.data.id = (d.parent ? d.parent.data.id + "." : "") + d.data.name.replace(/[: '.\\)(]/g, ""))
    .sum(d => d.value)
    .sort((a, b) => b.height - a.height || b.value - a.value);

  treemap(root);
  const getTile = (d) => gTiles.select(".tile").filter(v => v.data.id == d.data.id)
  //Create chart
  const gTiles = svg.append('g')
    .selectAll("g")
    .data(root.leaves())
    .enter()
    .append("g")
    .attr("transform", d => "translate(" + d.x0 + ", " + d.y0 + ")")
    .on("mousemove", (d) => {
      getTile(d).attr("stroke", "#ffffff")
        .attr("stroke-width", "2");
      const aux = [
        ...d.data.name.split(/ - |: |, /g, 2), format(d.data.value)
      ]
      tooltip
        .attr("data-value", d.data.value || 0)
        .style("left", d3.event.pageX + "px")
        .style("top", d3.event.pageY + "px")
        .style("display", "inline-block")
        .html(aux.join("<br/>"));
    })
    .on("mouseout", d => {
      getTile(d).attr("stroke", "none");
      tooltip.style("display", "none");
    })

  gTiles.append("rect")
    .classed("tile", true)
    .attr("id", d => d.data.id)
    .attr("data-name", d => d.data.name)
    .attr("data-category", d => d.data.category)
    .attr("data-value", d => d.data.value)
    .attr("width", d => d.x1 - d.x0)
    .attr("height", d => d.y1 - d.y0)
    .attr("fill", d => scaleColor(d.data.category))

  //avoids text overflow. Check: http://www.d3noob.org/2015/07/clipped-paths-in-d3js-aka-clippath.html
  gTiles.append("clipPath")
    .attr("id", d => "clip-" + d.data.id)
    //duplicates the rects element
    .append("use")
    .attr("href", d => "#" + d.data.id)

  const format = d3.format("$,.2s") //Format for the data-value

  gTiles.append("text")
    .classed("text", true)
    .attr("clip-path", d => "url(#clip-" + d.data.id + ")")
    .selectAll("tspan")
    .data(d => [
      ...d.data.name.split(/ - |: |, /g, 2), format(d.data.value)
    ])
    .enter().append("tspan")
    .text(d => d)
    .attr("x", 2)
    .attr("y", (d, i) => 14 + 14 * i)
    .attr("width", 25)

  //Legend 
  let categories = root.leaves().map(v => v.data.category).filter((v, i, arr) => arr.indexOf(v) == i)

  const gLegend = svg
    .append("g")
    .attr("id", "legend")
    .attr("transform", "translate(0, " + (heightTree + 30) + ")")
  const gLegendItem = gLegend.selectAll("g")
    .data(categories)
    .enter()
    .append("g")
    .attr("transform", (d, i) => "translate(" + (i * 40) + ", 0)");
  gLegendItem
    .append("rect")
    .classed("legend-item", true)
    .attr("x", 0)
    .attr("y", 0)
    .attr("height", 20)
    .attr("width", 20)
    .attr("fill", d => scaleColor(d));
  gLegendItem
    .append("text")
    .classed("legend-item-text", true)
    .attr("x", 30)
    .attr("y", 5)
    .attr("transform", "rotate(45)")
    .text(d => d);

  //Tooltip
  const tooltip = d3.select("body")
    .append("div")
    .attr("id", "tooltip");

}