
"use strict"

;(function() {

const BORDER_SIZE = 8;
let faceCloudPara = {
    paraTag : "tpp",
    graphPara : {
        tagId : "tppg",
        toggleId: 'gs1',
        formTagID : "tfw",
        scale : "log",
        maxTagsNum : window.TERMS_NUM,
        showImageLabel : false,
    },
    'font-family': 'times',
    biggestSize : 46,
    smallSize : 16,
    isHeatView : false,
    isListView : false,
};

const FEEBLE_OPACITY = 0.1;

function myFaceCloud(divName) {

    if (!(this instanceof myFaceCloud)) {
        return new myFaceCloud(divName);
    }

    this.tagID = divName;
    this.parameters = faceCloudPara;
    this.isDisplayed = false;
};

utilObj.extendInstance(myFaceCloud, OneWindow);

myFaceCloud.fn = myFaceCloud.prototype;

myFaceCloud.fn.initialMethod = function(tagID) {

    this.uber.initialMethod.call(this, tagID);
    
    this.heatColorScale = ["#FF1400","#FF2800","#FF3200","#FF4600","#FF5a00","#FF6e00","#FF8200","#FF9600","#FFaa00",
                            "#FFbe00","#FFd200","#FFe600","#FFfa00","#fdff00","#d7ff00","#b0ff00","#8aff00","#65ff00",
                            "#17ff00","#00ff36","#00ff83","#00ffd0","#00fff4", "#00e4ff"];
    this.colorHeat = d3.scale.quantile().range(this.heatColorScale.reverse());
    this.groupFill = d3.scale.category10();

    this.getData();

    this.height = parseInt(Math.max(Math.max(this.width * 0.5, 500) * (this.myData.length/80), 400));
    this.initGraphBoard();

};
myFaceCloud.fn.getData = function(instance) {
    if (!instance) {
        this.myData = myVsearch.cluster;
    } else {
        this.myData = instance;
    }
    // this.groupMyGraph();
    // this.initData();
}

myFaceCloud.fn.groupMyGraph = function() {
    makeGroup.groupTheGraph(this.myData, this.parameters.groupPara.groupNum);
};

// myFaceCloud.fn.hideListPane = function() {
//     if (this.parameters.isListView) {
//         this.parameters.isListView = false;
//         if (this.hasHeatData) {
//             $("#htmap").removeClass('disabled');
//         }
//     }
// };

myFaceCloud.fn.formListener = function() {
    this.uber.formListener.call(this);
    let that = this;

    $('#fontfm').dropdown({
        'onChange': d=>{
            that.parameters['font-family'] = d;
            that.updateWords();
        }
    })

    $('#aspratio').dropdown({
        'onChange': d=>{
            if (d === '0') {
                that.width = that.height;
            } else if (d === '1') {
                that.width = parseInt((4/3) * that.height);
            } else if (d === '2') {
                that.width = parseInt((16/9) * that.height);
            } else if (d === '3') {
                that.width = parseInt((16/10) * that.height);
            } else if (d === '4') {
                that.width = parseInt((21/9) * that.height);
            } else {
                that.width = this.originalWidth;
                that.height = parseInt(Math.max(Math.max(that.width * 0.5, 500) * (that.myData.sizeOfMatrix/80), 400));
            }
            that.removeGraphBoard();
            // that.initData();
            that.initGraphBoard();
            that.showMethod();
        }
    })

    let formArr = this.graphFormElements.find('.checkbox');
    formArr.eq(0).checkbox({
        'onChecked': function() {
            if (this.value !== that.parameters.graphPara.scale) {
                that.parameters.graphPara.scale = this.value;
                that.updateWords();
            }
        }
    });
    formArr.eq(1).checkbox({
        'onChecked': function() {
            if (this.value !== that.parameters.graphPara.scale) {
                that.parameters.graphPara.scale = this.value;
                that.updateWords();
            }
        }
    })
    formArr.eq(2).checkbox({
        'onChecked': function() {
            if (this.value !== that.parameters.graphPara.scale) {
                that.parameters.graphPara.scale = this.value;
                that.updateWords();
            }
        }
    })
    formArr.eq(3).checkbox({
        'onChange': function() {
            that.parameters.graphPara.showImageLabel = !that.parameters.graphPara.showImageLabel;
            that.updateWords();
        }
    });
};

myFaceCloud.fn.clearGraphContent = function() {

    this.wordPane.selectAll('*').remove();
    this.borderPane.selectAll('*').remove();
    this.clearImages();
    this.hasGraph = false;
}

myFaceCloud.fn.initData = function() {
    if (this.myData.nodes.length > 0) {
        wordCluster.dendrogramPosition(this.width, this.height, this.myData);

        let that = this;
        let wordDict = this.myData;
        try {
            utilObj.requestData("/get", wordDict.matrix, function(data) {
                let eigenInfo = data;
                that.heatUpper = function() {
                    let mxv = Math.max.apply(null, eigenInfo[1]);
                    return Math.sqrt(mxv);
                }();
                that.colorHeat.domain([0, that.heatUpper])
                wordDict.nodes.forEach(function(d, i) {
                    d.entangIndex = eigenInfo[1][i] !== 0 ? eigenInfo[1][i] : 0.00001;
                });
                // that.hasHeatData = true;
            }, false);
        } catch (err) {
            // that.hasHeatData = false;
            alert("Can't connect to server, some function can't accomplish!");
        };
    }
}

myFaceCloud.fn.removeGraphBoard = function() {
    $("#gwicl").empty();
    $('#heatBK').empty();
}

myFaceCloud.fn.initGraphBoard = function() {
    let width = this.width,
        height = this.height,
        middleX = width >> 1,
        middleY = height >> 1;

    this.svg = d3.select("#gwicl").append("svg")
                .attr("width", width)
                .attr("height", height);
    
    this.heatContext = d3.select("#heatBK")
                            .append("canvas")
                            .attr("width", width)
                            .attr("height", height)
                            .style("width", width + "px")
                            .style("height", height + "px")
                            .node()
                            .getContext("2d");

    // this.heatMap = this.svg.append("g").attr("id", "heatMapBack");
 
    this.wordPane = this.svg.append("g")
                    .attr("transform", "translate("
                        + middleX + ", " + middleY + ")");

    this.borderPane = this.svg.append("g")
                    .attr("transform", "translate("
                        + middleX + ", " + middleY + ")");

    this.imagesPane = this.svg.append("g")
                    .attr("transform", "translate("
                        + middleX + ", " + middleY + ")");
}

myFaceCloud.fn.reCloud = function() {
    this.hideListPane();
    this.wordPane.selectAll(".windex").remove();
    this.wordPane.selectAll(".ental").remove();
    this.updateWordsCloud();
    this.showImages();
}

myFaceCloud.fn.formatColorDict = function() {
    this.groupColorDict = {};
    let that = this;
    this.myData.nodes.forEach(function(n) {
        that.groupColorDict[n.text] = n.group;
    })
}

myFaceCloud.fn.keepColorStable = function() {
    let groupMapper = {};
    let inverseMapper = {};
    const MAX_NUM = 10;

    for (let oneTerm of this.myData.nodes) {
        if (groupMapper[this.groupColorDict[oneTerm.text]] === undefined) {
            groupMapper[this.groupColorDict[oneTerm.text]] = [oneTerm.group];
        } else {
            if (groupMapper[this.groupColorDict[oneTerm.text]].indexOf(oneTerm.group) === -1) {
                groupMapper[this.groupColorDict[oneTerm.text]].push(oneTerm.group);
            }
        }
    }

    for (let oneGroup in groupMapper) {
        let arr = groupMapper[oneGroup];
        let lg = arr.length;
        inverseMapper[arr[0]] = +oneGroup;
        for (let i = 1; i < lg; i += 1) {
            if (groupMapper[arr[i]] !== undefined) {
                inverseMapper[arr[i]] = groupMapper[arr[i]][0];
            } else {
                inverseMapper[arr[i]] = arr[i];
            }
        }
    }
    for (let oneTerm of this.myData.nodes) {
        oneTerm.group = inverseMapper[oneTerm.group];
    }
    // this.formatColorDict();
}

myFaceCloud.fn.updateWordsCloud = function() {
    // this.keepColorStable();
    let that = this;
    const DEMI_BORDER_SIZE = 4;
    this.wordPane.selectAll("text")
        .transition()
        .duration(600)
        .attr("transform", function(d) {
            if (!d.isImage) {
                return "translate(" + [d.x, d.y] + ")rotate(0)";
            } else {
                return "translate(" + [d.x+20, d.y] + ")rotate(0)";
            }
        })
        .attr("class", "words")
        .attr("font-family", this.parameters['font-family'])
        .attr("text-anchor", "middle")
        .style("fill", function(d, i) {
            return that.fillControl(d, i);
        })
        .style("font-size", function(d) { 
            if (d.isImage) {
                return '14px';
            } else {
                return d.size + "px";
            }
        })

}

myFaceCloud.fn.spritTags = function() {
    let that = this;

    d3.layout.cloud()
            .size([this.width-20, this.height])
            .words(this.myData)
            .font(this.parameters['font-family'])
            .rotate(0)
            // .showImageLabel(this.parameters.graphPara.showImageLabel)
            .fontSize(function(d) {
                return that.optimiseSize(d.termIndex, 200); })
            .start();
}

myFaceCloud.fn.drawWords = function() {
    let that = this;
    that.imagesDict = {};
    that.borderDict = {};

    this.wordPane.selectAll("text")
        .data(this.myData)
        .enter()
        .append("text")
        .style("font-size", function(d) { 
            if (d.isImage) {
                return '14px';
            } else {
                return d.size + "px";
            }
        })
        .style("fill", function(d, i) {
            return that.fillControl(d, i);
        })
        .attr("font-family", this.parameters['font-family'])
        .attr("text-anchor", "middle")
        .attr("transform", function(d) {
            if (!d.isImage) {
                return "translate(" + [d.x, d.y] + ")rotate(0)";
            } else {
                return "translate(" + [d.x+20, d.y] + ")rotate(0)";
            }
        })
        .attr("class", "words")
        .text(function(d) { return d.text; })
        .on("click", function(d) {
            that.termClickEvent(d);
        })
}

myFaceCloud.fn.clearImages = function() {
    this.imagesPane.selectAll('image').remove();
}

myFaceCloud.fn.showImages = function() {
    this.imagesPane.selectAll('image').attr('display', null);
    this.borderPane.selectAll('rect').attr('display', null);
}

myFaceCloud.fn.hideImges = function() {
    this.imagesPane.selectAll('image').attr('display', 'none');
    this.borderPane.selectAll('rect').attr('display', 'none');
}

myFaceCloud.fn.reListWords = function() {
    // this.hideHeat();
    
    // $("#htmap").addClass('disabled');
    
    var cordX, cordY, tranResult;
    var colorForOrder = ["#6363FF", "#6373FF", "#63A3FF", "#63E3FF", "#63FFFB", "#63FFCB",
                       "#63FF9B", "#63FF6B", "#7BFF63", "#BBFF63", "#DBFF63", "#FBFF63", 
                       "#FFD363", "#FFB363", "#FF8363", "#FF7363", "#FF6364"]; 

    let that = this;
    let middleX = this.width >> 1;
    let middleY = this.height >> 1;

    if (this.listOrdered.length == 0) {
        this.listOrdered = utilObj.clone(that.myData.nodes);
        this.listOrdered.sort(function(a, b) {
            return b.entangIndex - a.entangIndex;
        });
    }
    var arrayForIndex = [];
    for (let i = 0, len = this.listOrdered.length; i < len; i += 1) {
        arrayForIndex.push(this.listOrdered[i].text);
    }
    var maxRectWidth = 100, minRectWidth = 15, tempWidth, scaleM = arrayForIndex.length;
    var colorScale = d3.scale.quantile()
                        .domain([0, scaleM])
                        .range(colorForOrder);
    
    this.parameters.isListView = true;

    let perRow = middleY / 10;

    this.hideImges();

    let X_DIST = 260,
        Y_DIST = 16;

    this.wordPane.selectAll(".words")
        .transition()
        .duration(600)
        .attr("class", "liW")
        .style("font-size", "14px")
        .attr("text-anchor", "end")
        .style("fill", "black")
        .attr('display', null)
        .attr("transform", function(d, i) {
            cordX = Math.floor(arrayForIndex.indexOf(d.text) / perRow) * X_DIST - middleX + X_DIST;
            cordY = Math.floor(arrayForIndex.indexOf(d.text) % perRow) * Y_DIST - middleY + 38;
            tranResult = "translate(" + [cordX, cordY] + ")rotate(0)";
            return tranResult;
        })
        .attr('display', null);

    this.wordPane.selectAll(".windex")
        .data(arrayForIndex)
        .enter()
        .append("rect")
        .transition()
        .duration(600)
        .attr("transform", function(d, i) {
            cordX = Math.floor( i / perRow) * X_DIST - middleX + X_DIST;
            cordY = Math.floor( i % perRow) * Y_DIST - middleY + 26;
            tranResult = "translate(" + [cordX, cordY] + ")rotate(0)";
            return tranResult;
        })
        .attr("class", "windex")
        .attr("height", 14)
        .attr("width", function(d, i) {
            if (that.listOrdered[0].termIndex !== 1) {
                tempWidth = (Math.log(that.listOrdered[i].termIndex) / Math.log(that.listOrdered[0].termIndex))
                                * (maxRectWidth - minRectWidth) + minRectWidth;
            } else {
                tempWidth = minRectWidth;
            }

            return tempWidth;
        })
        .attr("fill", function(d, i) {
            return colorScale(scaleM - i);
        });

    this.wordPane.selectAll(".ental")
        .data(that.myData.nodes)
        .enter().append("text")
        .transition()
        .duration(800)
        .attr("class","ental")
        .attr("text-anchor", "start")
        .attr("font-size", 11)
        .text(function(d) { return d.entangIndex.toFixed(4); })
        .attr("transform", function(d, i) {
            cordX = Math.floor(arrayForIndex.indexOf(d.text) / perRow) * X_DIST - middleX + X_DIST;
            cordY = Math.floor(arrayForIndex.indexOf(d.text) % perRow) * Y_DIST - middleY + 38;
            tranResult = "translate(" + [cordX, cordY] + ")rotate(0)";
            return tranResult;
        });
}


myFaceCloud.fn.fillControl = function(d, i) {
    var res = this.groupFill(i);
    if (res === '#ff7f0e') {
        res = '#17becf'
    }
    return res;
}

myFaceCloud.fn.termClickEvent = function(d) {
    let matchingSnippetsNum = reOrderList.whichElement(d.text);
    clickedTermsBox.addTerm(d.text);
    // myTimeline.updateTitleInfo(d.text);
    // myTimeline.processData(matchingSnippetsNum);
}

myFaceCloud.fn.showMethod = function() {

    this.spritTags();

    this.drawWords();
    let that = this;
    // this.formatColorDict();
    this.listOrdered = [];
    // myTimeline.processData(myVsearch.titleDict);
}

myFaceCloud.fn.updateWords = function() {
    this.spritTags();
    this.updateWordsCloud();
}

window.myFaceCloud = myFaceCloud;

}(window))