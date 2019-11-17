"use strict"
var paraTree = {
        num: 50
    }

var OneWindow = function(divName, parameter) {
    this.tagID = divName;
    this.parameters = parameter;
    this.isDisplayed = false;
}

OneWindow.prototype.init = function(divName, parameter) {
    this.tagID = divName;
    this.parameters = parameters;
    this.isDisplayed = false;
}
OneWindow.prototype.updateGroupParameters = function() {};
OneWindow.prototype.updateGraphParameters = function() {};

OneWindow.prototype.showMethod = function() {};
OneWindow.prototype.initialMethod = function() {
    this.width = parseInt($('#graphContent').width())-30;
    this.originalWidth = this.width;
    var that = this;
    if (!this.parameters) {
        return;
    }
    if (this.parameters.paraTag) {
        utilObj.showPara(this.parameters.paraTag);
    }
    if (this.parameters.groupPara && this.parameters.graphPara) {
        this.groupParaPane = $('#'+that.parameters.groupPara.tagId);
        this.graphParaPane = $('#'+that.parameters.graphPara.tagId);
        
        if (this.parameters.groupPara) {
            let that = this;
            $('#'+this.parameters.groupPara.toggleId).on('click', function() {
                $(this).addClass('active').siblings().removeClass('active');
                that.groupParaPane.show();
                that.graphParaPane.hide();
            });
        }
        if (this.parameters.graphPara) {
            let that = this;
            $('#'+this.parameters.graphPara.toggleId).on('click', function() {
                $(this).addClass('active').siblings().removeClass('active');
                that.graphParaPane.show();
                that.groupParaPane.hide();
            });
        }
    }
};
OneWindow.prototype.formListener = function() {
    let that = this;
    if (!this.parameters) {
        return;
    }
    if (this.parameters.graphPara) {
        this.graphFormElements = $('#'+this.parameters.graphPara.formTagID);
    }
    if (this.parameters.groupPara) {
        this.groupFormElements = $('#'+this.parameters.groupPara.formTagID);
    }
};

OneWindow.prototype.hideWin = function() {
    utilObj.hidePara(this.tagID);
    this.displayParameters(false);
    this.isShowing = false;
}

OneWindow.prototype.optimiseSize = function(inputSize, upperSize) {
    if (!this.parameters.biggestSize) return 0;
    var preRes, normalSize;
    var upBoundSize = upperSize;
    normalSize = inputSize > upBoundSize ? upBoundSize : inputSize;
    if (inputSize < 1 || upperSize < 1) {
        this.parameters.graphPara.scale = "sqrt";
    }
    switch (this.parameters.graphPara.scale) {
        case "log":
            preRes = Math.log(normalSize)/Math.log(upBoundSize);
            break;
        case "sqrt":
            preRes = Math.sqrt(normalSize)/Math.sqrt(upBoundSize);
            break;
        default :
            preRes = normalSize/upBoundSize;
    }
    return preRes*(this.parameters.biggestSize-this.parameters.smallSize)+this.parameters.smallSize;
}

OneWindow.prototype.displayParameters = function(isShow) {
    if (!this.parameters || !this.parameters.paraTag) return 0;
    if (isShow) {
        utilObj.showPara(this.parameters.paraTag);
    } else {
        utilObj.hidePara(this.parameters.paraTag);
    }
}

OneWindow.prototype.showWin = function() {

    utilObj.showInlineBlockPara(this.tagID);
    this.displayParameters(true);

    if (!this.isDisplayed) {
        this.initialMethod();
        this.formListener();
        this.isDisplayed = true;
    };
    if (!this.hasGraph) {
        this.getData();
        
        this.showMethod(this);
        this.hasGraph = true;
    };
    this.isShowing = true;     
}

OneWindow.prototype.clearGraphContent = function() {
    utilObj.clearContent(this.tagID);
    this.hasGraph = false;
}

OneWindow.prototype.getCheckList = function() {

    let nodesDict = {};
    let lg = this.myData.length;
    for (let i = 0; i < lg; i += 1) {
        nodesDict[this.myData[i].text] = 0;
    }

    popModal.updateTermsList(nodesDict);
}

OneWindow.prototype.showCheckData = function(checkedterms) {
   // let instance = filterTerm2DocGraph(myVsearch.termGraph.term2Doc, checkedterms);
   this.clearGraphContent();
   this.getData(instance);
   this.showMethod(this);
   this.hasGraph = true;
   this.isShowing = true;
}


function graphRequest(tag_Name) {
    if (tag_Name === "gdg") {
        return new dendrogram('gdg');
    } else if (tag_Name === "gwi") {
        return new myFaceCloud('gwi');
    }
}
