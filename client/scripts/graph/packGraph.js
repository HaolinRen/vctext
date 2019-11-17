!(function() {

function packGraph(divName) {
    if (!(this instanceof packGraph)) {
        return new packGraph(divName); 
    }
    this.tagID = divName;
    this.isDisplayed = false;

}

utilObj.extendInstance(packGraph, OneWindow);

packGraph.fn = packGraph.prototype;

const MAX_TAG_NUM = 20;
const GROUP_NUM = 5;

packGraph.fn.getData = function(instance) {
    if (instance) {
        this.myData = instance;
    } else {
        this.myData = getTheGraphs();  
    }
    makeGroup.groupTheGraph(this.myData, GROUP_NUM);

}

packGraph.fn.initialMethod = function() {
    this.uber.initialMethod.call(this);

    this.height = this.width-100;
    this.svg = d3.select('#' + this.tagID)
                .append('svg')
                .attr('width', this.width)
                .attr('height', this.height)
                .append('g')
                .attr('transform', 'translate(10, 10)');
}

packGraph.fn.showMethod = function() {
    let packPos = d3.layout.pack()
                    .size([this.width, this.height])
                    .value(function(d) { if (d.text === "") {
                        return 1;
                      } else {
                        return d.degree/10 + 4;
                      }; })
                    .nodes(getDendrogram(this.myData));

    var node = this.svg.selectAll('.node')
                .data(packPos)
                .enter().append('g')
                .attr('class', function(d) {return d.children ? 'node' : 'leaf node'})
                .attr('transform', function(d) {
                  return 'translate(' + d.x + ',' + d.y + ')';
                });

    node.append('title')
      .text(function(d) { return d.text;})

    node.append('circle')
      .attr('class','tcircle')
      .attr('r', function(d) {return d.r; });

    this.svg.selectAll('text')
        .data(packPos)
        .enter()
        .append("text")
        .attr('transform', function(d, i) {
            let p = 1;
            if (i%3 === 0) {
                p = -1;
            } else if (i%3 === 1) {
                p = 0;
            }
          return 'translate(' + d.x + ',' + (d.y + p * 8) + ')';
        })
        .attr("dy", ".3em")
        .style("text-anchor", "middle")
        .attr('font-size', '11px')
        .text(function(d) { return d.text; });
}

packGraph.fn.clearGraphContent = function() {
    this.svg.selectAll('*').remove();
    this.hasGraph = false;
}

window.packGraph = packGraph;
}(window))
