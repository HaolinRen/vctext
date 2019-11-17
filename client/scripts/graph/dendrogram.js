;(function() {

function dendrogram(divName) {
	if (!(this instanceof dendrogram)) {
		return new dendrogram(divName);
	}
	this.tagID = divName;
	this.isDisplayed = false;
}

utilObj.extendInstance(dendrogram, OneWindow);

dendrogram.fn = dendrogram.prototype;

dendrogram.fn.getData = function() {
    this.myData = this.buildGraph();

	// var instance = getTheGraphs();
 //    makeGroup.groupTheGraph(instance, 1);
 //    this.myData = getDendrogram(instance);
 //    this.height = 11 * instance.sizeOfMatrix;

 //    if (this.myData.children) {
 //        var lg = this.myData.children.length;
 //        var tempArr = [];
 //        for (var i = 0; i < lg; i += 1) {
 //            if (this.myData.children[i].degree > 1) {
 //                tempArr.push(this.myData.children[i])
 //            }
 //        }
 //        this.myData.children = tempArr;
 //    };
}

dendrogram.fn.buildGraph = function() {
    let res = {}
    let cluster = myVsearch.cluster;

    let rootIndex = cluster.dendrogram.root;
    let rootText = cluster.graph['nodes'][rootIndex].term;
    res = {
        'text' : rootText
    }

    let count = 0;

    function addChildren(parentIndex, parent) {
        count += 1;
        if (count >= paraTree.num) {
            return
        }
        if (cluster.dendrogram[parentIndex]) {
            parent.children = [];

            for (let child in cluster.dendrogram[parentIndex]['children']) {
                let temp = {
                    'text': cluster.graph['nodes'][child].term,
                    'parent': parent
                }
                addChildren(child, temp)
                parent.children.push(temp);
            }
            
        }
    }
    addChildren(rootIndex, res);
    this.height = 10 * count;

    return res;
}

dendrogram.fn.showMethod = function() {

    let diagonal = d3.svg.diagonal()
                    .projection(function(d) { return [d.y, d.x]; });

    let svg = d3.select('#'+this.tagID).append("svg")
                .attr("width", this.width)
                .attr("height", this.height)
                .append("g")
                .attr("transform", "translate(100,0)");

	let cluster = d3.layout.cluster()
                    .size([this.height, this.width-300]);

	var nodes = cluster.nodes(this.myData),
    	links = cluster.links(nodes);

	svg.selectAll(".denlink")
            .data(links)
            .enter().append("path")
            .attr("class", "denlink")
            .attr("d", diagonal);

    var nodeEle = svg.selectAll(".dennode")
                    .data(nodes)
                    .enter().append("g")
                    .attr("class", "dennode")
                    .attr("transform", function(d) { return "translate(" + d.y + "," + d.x + ")"; });

    nodeEle.append("circle")
        .attr("r", 4.5);

    nodeEle.append("text")
        .attr("dx", function(d) { return d.children ? -8 : 8; })
        .attr("dy", 3)
        .attr("class", "dentext")
        .style("font-size", function(d) { return d.children ? "14px" : "12px"; })
        .style("text-anchor", function(d) { return d.children ? "end" : "start"; })
        .text(function(d) { return d.text; })
        .on("click", function(d) {
            reOrderList.whichElement(d.text);
        });
}

window.dendrogram = dendrogram;

}(window))