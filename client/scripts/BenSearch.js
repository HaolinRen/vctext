"use strict"
var utilObj = {
    hidePara : function(divId) {
        document.getElementById(divId).style.display = "none";
    },
    showInlineBlockPara : function(divId) {
        document.getElementById(divId).style.display = "inline-block";
    },
    showPara: function(divId) {
        document.getElementById(divId).style.display = 'inline';
    },
    setBackgroundColor : function(divId, color) {
        document.getElementById(divId).style.backgroundColor = color;
    },
    clone : function(obj) {
        if (null == obj || "object" != typeof obj) return obj;
        if (obj instanceof Array) {
            var copy = [];
            var i, len;
            for (i = 0, len = obj.length; i < len; ++i) {
                copy[i] = utilObj.clone(obj[i]);
            }
            return copy;
        }
        if (obj instanceof Object) {
            var copy = {};
            for (var attr in obj) {
                if (obj.hasOwnProperty(attr)) copy[attr] = utilObj.clone(obj[attr]);
            }
            return copy;
        }
        throw new Error("Unable to copy obj! Its type isn't supported.");
    },
    purge : function(d) {
        var a = d.attributes, i, l, n;
        if (a) {
            for (i = a.length - 1; i >= 0; i -= 1) {
                n = a[i].name;
                if (typeof d[n] === 'function') {
                    d[n] = null;
                }
            }
        }
        a = d.childNodes;
        if (a) {
            l = a.length;
            for (i = 0; i < l; i += 1) {
                utilObj.purge(d.childNodes[i]);
            }
        }
    },
    extendInstance : function (child, parent) {
        let F = function() {};
        F.prototype = parent.prototype;
        child.prototype = new F();
        child.prototype.constructor = child;
        child.prototype.uber = parent.prototype;
    },
    clearContent : function(tag_Name) {
        var tagRef = document.getElementById(tag_Name);
        utilObj.purge(tagRef);
        tagRef.innerHTML = "";
    },
    setContent : function(tag_Name, content) {
        if (typeof content !== "string") {
            utilObj.clearContent(tag_Name);
        } else {
            var tagRef = document.getElementById(tag_Name);
            utilObj.purge(tagRef);
            tagRef.innerHTML = content;
        }
    },
    //Define the function of adding event listener to element
    addEventMethod : function(ele, evnt, funct) {
        if (typeof ele.addEventListener === "function") {
            utilObj.addEventMethod = function(ele, evnt, funct) {
                ele.addEventListener(evnt, funct, false);
            }
        } else if (ele.attachEvent === "function") {
            utilObj.addEvent = function(evnt, funct) {
                ele.attachEvent('on'+evnt, funct);
            }
        } else {
            utilObj.addEvent = function(evnt, funct) {
                ele['on'+evnt] = funct;
            }
        };
        utilObj.addEvent(ele, evnt, funct);
    },
    addEvent : function(divName, evnt, funct){
        var thElement = document.getElementById(divName);
        if (typeof thElement.addEventListener === "function") {
            utilObj.addEvent = function(divName, evnt, funct) {
                var sElement = document.getElementById(divName);
                sElement.addEventListener(evnt, funct, false);
            }
        } else if (thElement.attachEvent === "function") {
            utilObj.addEvent = function(divName, evnt, funct) {
                var sElement = document.getElementById(divName);
                sElement.attachEvent('on'+evnt, funct);
            }
        } else {
            utilObj.addEvent = function(divName, evnt, funct) {
                var sElement = document.getElementById(divName);
                sElement['on'+evnt] = funct;
            }
        };
        utilObj.addEvent(divName, evnt, funct);
    },
    //add submit event listener to search request button
    addFormListener : function(divName, method) {
        utilObj.addEvent(divName, "submit", function(event) {  
            event.preventDefault();
            method(this.elements);
        })
    },
    addClickFunc : function(divName, funct) {
        var tagName = document.getElementById(divName);
        tagName.onclick = funct;
    },
    requestData : function(med, sendData, callback, isSyn) {
        var xhttp, textData;
        textData = JSON.stringify(sendData);
        if (window.XMLHttpRequest) {
            xhttp = new XMLHttpRequest();
        } else {
            xhttp = new ActiveXObject("Microsoft.XMLHTTP");
        }
        xhttp.onreadystatechange = function() {
            if (xhttp.readyState == 4 && xhttp.status == 200) {
                var res = [];
                try {
                    res = JSON.parse(xhttp.responseText);

                    callback(res);
                } catch(err) {
                    //console.log(xhttp.responseText);
                    console.log("can't process response data.", err);
                    callback(false)
                }
            }
        };
        xhttp.open("POST", med, isSyn);
        xhttp.setRequestHeader("Content-type", "application/json;charsetUTF-8")
        xhttp.send(textData);
    }
}

function oneDoc(d, order) {
    this.order = order;
    for (let oneProp in d) {
        this[oneProp] = d[oneProp];
    }
}

oneDoc.prototype.contentList = function() {
    let res = [];
    for (let oneProp in this.topics) {
        if (myVsearch.topicDict[oneProp]) {
            for (let p of this.topics[oneProp]) {
                res.push(p)
            }
        }
    }
    return res;
}

function oneDocFactory(d, order) {
    return new oneDoc(d, order);
}


var displayMethod = {
    listTag : document.getElementById("resultsList"),
    infoTag : document.getElementById("ri"),
    groupShowed : false,
    singleShowed : false,
    changeInfoTag : function(numToShow) {
        this.infoTag.innerHTML = numToShow + " results";
    },
    getChildIndex : function(child){
        var parent = child.parentNode.parentNode;
        var children = this.listTag.children;
        var i = children.length - 1;
        for (; i >= 0; i--){
            if (parent == children[i]){
                break;
            }
        }
        parent.remove();
        return i;
    },
    listOneResult : function(results) {
        // var re = new RegExp(query, "gi");
        var tableOutput = '';
        
        var i, len;
        var cut_size = 200;

        var replace_with_image = function(concepts){

            let textWithImg = '';
            for (let i = 0; i < concepts.length; i++) {
                if (concepts[i] === '') {
                    continue;
                }
                textWithImg += '<a class="ui label keywords">' + concepts[i] + '</a>';
            }
            return textWithImg;
        }

        for (i = 0, len = results.length; i < len; i++) {
           
            tableOutput += '<div class="item oneDoc">'
                // + '<div class="content"><a class="header" ' + 'href="' + results[i].link + '" target="_blank" id="link_'+i+'">'
                + '<div class="content"><a class="header" id="'+i+'">'

                + results[i].title + '</a><button class="ui right floated mini basic red icon button rmdoc" id="' + results[i].order

                + '">remove</button><div class="meta"><span>' + results[i].date + '</span></div>'
                + '<div class="ui labels topics">';


            for (let oneTopic in results[i].topics) {
                tableOutput += '<strong>' + oneTopic + '</strong>' + replace_with_image(results[i].topics[oneTopic]) + '<br>';
            }

            tableOutput += '</div><div class="captions"><strong>Detail:</strong>: ' + results[i].content + '</div>';

            tableOutput += '</div></div>';
        }
        this.listTag.innerHTML = tableOutput;

        let lbs = this.listTag.getElementsByClassName('keywords');
        let lbSize = lbs.length;
        for (i = 0; i < lbSize; i += 1) {
            
            lbs[i].addEventListener('click', function() {
                let clickedTerm = this.innerText || this.textContent;
                myVsearch.setSearchKeyword(clickedTerm);
                let matchingSnippetsNum = reOrderList.whichElement(clickedTerm);
                // myTimeline.updateTitleInfo(clickedTerm);
                myTimeline.clearHoverLine();
                myTimeline.showHoverLine(matchingSnippetsNum);
                // myTimeline.processData(matchingSnippetsNum);
            })

            lbs[i].addEventListener('dblclick', function(){
                let clickedTerm = this.innerText || this.textContent;
                myVsearch.searchKeyword(clickedTerm)
            })
        }
        let castList = this.listTag.getElementsByClassName('cast');
        let castListSize = castList.length;
        for (i = 0; i < castListSize; i += 1) {
            castList[i].addEventListener('click', function() {
                let clickedTerm = this.innerText || this.textContent;
                myVsearch.setsearchPerson(clickedTerm);
                let matchingSnippetsNum = reOrderList.whichElement(clickedTerm);
                myTimeline.clearHoverLine();
                myTimeline.showHoverLine(matchingSnippetsNum);
            })

            castList[i].addEventListener('dblclick', function(){
                let clickedTerm = this.innerText || this.textContent;
                myVsearch.serchPerson(clickedTerm)
            })
        }

        let rmbList = this.listTag.getElementsByClassName('rmdoc');

        let rmbSize = rmbList.length;
        for (i = 0; i < rmbSize; i += 1) {
            rmbList[i].addEventListener('click', d=>{

                let eindex = displayMethod.getChildIndex(d.target);
                delete myVsearch.searchResults[d.target.id];

                myVsearch.totalNum -= 1;
                // myVsearch.getTermsTitleDict();
                myVsearch.countTimeDict();
                reOrderList.allData();

                myTimeline.processData(myVsearch.titleDict);
                windowControl.reopenWindow();
            })
        }

        let hdList = this.listTag.getElementsByClassName('header');

        let hdSize = hdList.length;
        for (i = 0; i < hdSize; i += 1) {
            hdList[i].addEventListener('click', d=>{
                let order = +d.target.id;
                flowBox.updateLink(results[order])
                // console.log(results[order].title)
            })
        }
    }
}

function Vsearch_fd(query) {
    
    windowControl.clearGraph();
    myVsearch.topicDict = {};
    let para = {};
    myVsearch.searchResults = {};
    para.data = query;
    para.maxSnpNum = sidebarPane.maxSnippetsNum;
    para.maxTermsNum = sidebarPane.maxTermsNum;

    myVsearch.updateLoadingBoard(true);

    utilObj.requestData('/ben', para, function(data) {
        console.log(data)
        myVsearch.cluster = data.terms;
        let searchResults = data.res;
        myVsearch.updateLoadingBoard(false);
        let k = 0;

        let propDict = {}

        for (let ind of searchResults) {
            let doc = oneDocFactory(ind, k);

            for (let oneTopic in ind.topics) {
                if (!myVsearch.topicDict[oneTopic]) {

                    myVsearch.topicDict[oneTopic] = {
                        isChecked: true,
                        terms: {}
                    };
                }
                for (let oneVal of ind.topics[oneTopic]) {
                    myVsearch.topicDict[oneTopic].terms[oneVal] = true;
                }
            }

            for (let oneProp in ind.props) {
                if (!propDict[oneProp]) {
                    propDict[oneProp] = 0;
                }
            }
            myVsearch.searchResults[k] = doc;
            k += 1;
        }

        reOrderList.updateSearchOption(propDict);
        myTimeline.clearBrush();
        myVsearch.totalNum = k;
        if (myVsearch.totalNum > 0) {
            myVsearch.hasData = true;

            // myVsearch.getTermsTitleDict();

            myVsearch.countTimeDict();
            myTimeline.processData(myVsearch.titleDict, true);

            reOrderList.allData();
            windowControl.reopenWindow();
        } else {
            myVsearch.showInfoPane();
        }
    }, true);
};

var reOrderList = {
    newOrderList : [],
    clickedTerm : "",
    numEachPage: 14,
    numPage: 1,
    sortType: 'increase',
    sortMethod: 'date',
    cloneResult : function() {
        this.newOrderList = [];
        for (let d in myVsearch.searchResults) {
            this.newOrderList.push(myVsearch.searchResults[d]);
        }
    },
    updateSearchOption: function(d) {

        let tempText = '<option value="date">Date</option>\
                        <option value="title">Title</option>';

        for (let oneProp in d) {
            tempText += '<option value="' + oneProp + '">' + oneProp + '</option>';
        }
        $('#sortMethod').html(tempText)
                     
    },
    displayTheOrder : function(startP) {
        var endP = startP + reOrderList.numEachPage;
        if (endP > this.newOrderList.length) {
            endP = this.newOrderList.length;
        }
        displayMethod.listOneResult(this.newOrderList.slice(startP, endP));
    },
    allData : function() {
        if (!myVsearch.hasData) {
            return 0;
        }
        reOrderList.cloneResult();
        displayMethod.changeInfoTag(myVsearch.totalNum);
        reOrderList.clickedTerm = "";
        reOrderList.resortSelf();
        pageBar.resetPageNum(Math.ceil(myVsearch.totalNum/reOrderList.numEachPage));
    },
    initial: function() {
        $('#sortMethod').dropdown({
            'onChange': d=>{
                reOrderList.sortMethod = d;
                reOrderList.resortSelf();
            }
        })
        $('#sortType').dropdown({
            'onChange': d=>{
                reOrderList.sortType = d;
                reOrderList.resortSelf();
            }
        })
    }
}

reOrderList.resortSelf = function() {
    this.sortRes(this.newOrderList);
    this.displayTheOrder(0)
}

reOrderList.sortRes = function(data) {

    if (reOrderList.sortMethod === 'date' || reOrderList.sortMethod === 'title') {
        if (this.sortType === 'increase') {
            data.sort(function(a, b) {
                if (a[reOrderList.sortMethod] > b[reOrderList.sortMethod]) {
                    return 1;
                } else {
                    return -1;
                }
            })
        } else {
            data.sort(function(a, b) {
                if (a[reOrderList.sortMethod] < b[reOrderList.sortMethod]) {
                    return 1;
                } else {
                    return -1;
                }
            })
        }
    } else {
        if (this.sortType === 'increase') {
            data.sort(function(a, b) {
                if (a.props[reOrderList.sortMethod] > b.props[reOrderList.sortMethod]) {
                    return 1;
                } else {
                    return -1;
                }
            })
        } else {
            data.sort(function(a, b) {
                if (a.props[reOrderList.sortMethod] < b.props[reOrderList.sortMethod]) {
                    return 1;
                } else {
                    return -1;
                }
            })
        }
    }
}

reOrderList.findSubDocs = function(event_ID) {
    let res = {};
    if (typeof event_ID == "string") {
        if (myVsearch.termGraph.term2Doc.hasOwnProperty(event_ID)) {
            var i, len, index;
            for (i = 0, len = myVsearch.termGraph.term2Doc[event_ID].length; i < len; i++) {
                index = myVsearch.termGraph.term2Doc[event_ID][i];
                let tempSnippet = myVsearch.searchResults[index];
                if (res[tempSnippet.date] === undefined) {
                    res[tempSnippet.date] = 1;
                } else {
                    res[tempSnippet.date] += 1;
                }
            }
        }
    }
    return res;
}

reOrderList.whichElement = function(event_ID) {

    let res = {};
    if (typeof event_ID == "string") {
        this.newOrderList = [];

        let i = 0;
        for (let title in myVsearch.searchResults) {
            let tempSnippet = myVsearch.searchResults[title];
            let plist = tempSnippet.contentList();
            for (let temp of plist) {
                if (temp === event_ID) {
                    this.newOrderList.push(tempSnippet);
                    if (res[tempSnippet.date] === undefined) {
                        res[tempSnippet.date] = 1;
                    } else {
                        res[tempSnippet.date] += 1;
                    }
                }
            }
        }
        this.clickedTerm = event_ID;
        pageBar.resetPageNum(Math.ceil(this.newOrderList.length / this.numEachPage));

        displayMethod.changeInfoTag(this.newOrderList.length);
        // this.displayTheOrder(0);
        reOrderList.resortSelf();
    }
    return res;
}

reOrderList.dateFilter = function(d1, d2) {
    let termsArrs = [];
    
    this.newOrderList = myVsearch.getResultsInterval(d1, d2);
    pageBar.resetPageNum(Math.ceil(this.newOrderList.length / this.numEachPage));
    displayMethod.changeInfoTag(this.newOrderList.length);
    this.clickedTerm = '';
    reOrderList.resortSelf();
    termsArrs = this.newOrderList.map(function(n) {
        return n.contentList();
    });
}

var flowBox = {
    pageEle: $('#pageseg'),
    propEle: $('#propseg'),
    linkEle: $('#pagelink'),
    updateLink: function(item) {
        
        let tableOutput = '<div class="ui relaxed divided list">';
        for (let oneProp in item.props) {
            if (item.props[oneProp] === '') {
                continue;
            }
            tableOutput += '<div class="item"><div class="content">';
            // tableOutput += '<div class="header">' + oneProp + '</div>';
            tableOutput += '<strong>' + oneProp + ':</strong>&nbsp&nbsp' + item.props[oneProp];
            tableOutput += '</div></div>';
        }
        tableOutput += '</div>';
        this.propEle.html(tableOutput)
    }
}

var notifyier = {
    topics: {},
    subscribe: function(topic, id, func) {
      if (this.topics[topic] === undefined) {
        this.topics[topic] = [];
      }
      this.topics[topic].push({
        id: id,
        method: func
      });
    },
    update: function(topic, paras) {
      let oneTopic = this.topics[topic];
      if (oneTopic !== undefined) {
        let lg = oneTopic.length;
        for (let i = 0; i < lg; i += 1) {
          oneTopic[i].method(paras);
        }
      }
    },
    removeSubscriber: function(topic, id, func) {
      let oneTopic = this.topics[topic];
      if (oneTopic !== undefined) {
        if (id === undefined && func === undefined) {
          delete this.topics[topic];
        } else {
          for (let i = 0, j = oneTopic.length; i < j; i += 1) {
            if (oneTopic[i].id === id || oneTopic[i].method === func) {
              oneTopic.splice(i, 1);
              i -= 1;
              j -= 1;
            }
          }
        }
      }
    }
};

var myVsearch = {
    termGraph : {},
    searchResults : {},
    // documentGraph : {},
    // interactGraph: {},
    topicDict: {},
    // lastQuery : "",
    hasData : false,
    bodyBoard: $('#content'),
    totalNum : 0,
    infoPane: $('#msgPane'),
    searchInputs: $('#searchInput').find('input'),
    showInfoPane: function() {
        this.infoPane.css('display', 'flex');
        setTimeout(function() {
            myVsearch.infoPane.hide();
        }, 2000);
    },
    clearSearch : function() {
        myVsearch.searchInputs.val('');
        this.clearSearchDate();
    },
    setSearchKeyword: function(word) {
        myVsearch.searchInputs.eq(3).attr('placeholder','').val(word);
    },
    updateLoadingBoard: function(isLoading) {
        if (isLoading) {
            this.bodyBoard.addClass('loading')
        } else {
            this.bodyBoard.removeClass('loading')
        }
    },
    setsearchPerson: function(personName) {
        myVsearch.searchInputs.eq(2).attr('placeholder','').val(personName);
    },
    searchKeyword: function(word) {
        // myVsearch.clearSearch();
        myVsearch.setSearchKeyword(word);
        myVsearch.searchRequest();
    },
    serchPerson: function(personName) {
        myVsearch.setsearchPerson(personName);
        myVsearch.searchRequest();
    },
    clearSearchDate : function() {
        myVsearch.searchInputs.eq(0).val('').attr('placeholder', 'Start date');
        myVsearch.searchInputs.eq(1).val('').attr('placeholder', 'End date');
    },
    setSearchDate: function(d1, d2) {
        if (d1 && d1.length > 0) {
            myVsearch.searchInputs.eq(0).attr('placeholder', '').val(d1);
        }
        if (d2 && d2.length > 0) {
            myVsearch.searchInputs.eq(1).attr('placeholder', '').val(d2);
        }
    },
    getSearhContent : function() {

        let startDate = myVsearch.searchInputs.eq(0).val().replace('_', '');

        let endDate = myVsearch.searchInputs.eq(1).val().replace('_', '');

        let keyword = myVsearch.searchInputs.eq(2).val().toLowerCase();

        let input = startDate + '-' + endDate + '-' + keyword;
        
        if (input == "--") {
            return false;
        }
        let res = {}

        if (startDate != '') {
            res.startDate = startDate
        }
        if (endDate != '') {
            res.endDate = endDate
        }

        if (keyword != '') {
            res.keyword = keyword
        }
        return res
    },
    searchRequest: function() {
        /* Start of the program */
        

        // windowControl.clearGraph();
        // if (input !== myVsearch.lastQuery) {
        let query = myVsearch.getSearhContent();
        if (query) {
            query.condition = 'and';

            let para = [query];
            Vsearch_fd(para);

            searchBox.resetQueryBox();
            searchBox.hideQueryBox();
        }
        // Vsearch_fd(startDate, endDate, faceName, keywords);
            // myVsearch.lastQuery = input;
        // } else {
        //     myVsearch.showInfoPane();
        //     myVsearch.updateInfoPane('Same input, please try something else...');
        //     setTimeout(function() {
        //         myVsearch.hideInfoPane();
        //     }, 1000);
        // }
        return false;
    },
    getTermsTitleDict: function() {
        //console.log("here we are constructing the graph", myVsearch.searchResults)
        
        myVsearch.termGraph = benterm2Document(myVsearch.searchResults);

        myVsearch.termsAllArrs = myVsearch.getCloudTerms(myVsearch.termGraph.term2Doc);

        // popModal.updateTermsList(myVsearch.termsAllArrs);
        // myVsearch.documentGraph = doc2Document(myVsearch.termGraph.term2Doc);
        // myVsearch.interactGraph = interactionGraph(myVsearch.documentGraph);

        // myVsearch.checkFaceHasImage(myVsearch.interactGraph);
    },
    getCloudTerms: function(termDict) {
        let termsArrs = [];
        for (let oneTerm in termDict) {
            let dictSize = termDict[oneTerm].length;
            if (dictSize > popModal.miniTermDocNum) {
                termsArrs.push({
                    'text': oneTerm,
                    'doc': termDict[oneTerm],
                    'val': dictSize 
                })
            }
        };

        termsArrs.sort(function(a, b) {
            return b.val - a.val;
        })
        return termsArrs;
    },
    getResultsInterval: function(d1, d2) {
        let docsDuringD1D2 = [];
        for (let oneIndex in myVsearch.searchResults) {
            let oneSnippet = myVsearch.searchResults[oneIndex]
            if (oneSnippet.date >= d1 && oneSnippet.date <= d2) {
                docsDuringD1D2.push(oneSnippet);
            }
        };
        reOrderList.sortRes(docsDuringD1D2);
        return docsDuringD1D2;
    },
    countTimeDict: function() {
        this.titleDict = {};
        for (let oneIndex in this.searchResults) {
            let oneSnippet = this.searchResults[oneIndex]
            let yearStr = oneSnippet.date;
            if (yearStr.length > 0) {
                if (this.titleDict[yearStr] === undefined) {
                    this.titleDict[yearStr] = 1;
                } else {
                    this.titleDict[yearStr] += 1;
                }
            }
        }
    }
}

var popModal = {
    myModal : $('.modal'),
    miniTermDocNum : 3,
    showModal: function() {
        popModal.myModal.modal({
            onApprove: function() {
                windowControl.updateTermsFromCheckList();
            }
        }).modal('show');
    },
    updateTermsList: function(compareDict) {
        let listPane = popModal.myModal.find('.tplist');
        let arrs = myVsearch.termsAllArrs;
        let arrsSize = arrs.length > 60 ? 60: arrs.length;
        let onePieceSize = Math.ceil(arrsSize/3);
        let twoPieceSize = onePieceSize * 2;
        
        function addOneCheck(text, val, isChecked) {
            let res = '<div class="item"><div class="ui checkbox" value="' + text + '"><input type="checkbox"'
            if (isChecked) {
               res += ' checked="true"><label>';
            } else {
                res += '><label>';
            }
            res += text + '</label></div><div class="right floated content">' + val + '</div></div>';
            return res;
        }

        let preList = '';
        let sedList = '';
        let tedList = '';

        for (let i = 0; i < arrsSize; i += 1) {
            let tempText = arrs[i].text;
            let isShowed = false;
            if (compareDict[tempText] !== undefined) {
                isShowed = true;
            }
            if (i < onePieceSize) {
                preList += addOneCheck(tempText, arrs[i].val, isShowed);
            } else if (i < twoPieceSize) {
                sedList += addOneCheck(tempText, arrs[i].val, isShowed);
            } else {
                tedList += addOneCheck(tempText, arrs[i].val, isShowed);
            }
        }
        listPane.eq(0).html(preList);
        listPane.eq(1).html(sedList);
        listPane.eq(2).html(tedList);

        let ckbs = listPane.find('.checkbox');

        let topicText = '';

        for (let oneProp in myVsearch.topicDict) {
            topicText += '<div class="ui item"><div class="ui checkbox"><input type="checkbox" checked="true" value="' + oneProp  
                         + '"><label>' + oneProp + '</label></div></div>'
        }

        let $topics = $(topicText);

        let topicsPane = popModal.myModal.find('#topicsChecker');

        topicsPane.html($topics)

        $topics.find('.checkbox').checkbox({
            onChecked: function() {
                let clickedTerm = this.value;
                let lg = ckbs.length;
                for (let i = 0; i < lg; i += 1) {
                    if (myVsearch.topicDict[clickedTerm].terms[ckbs.eq(i).attr('value')]) {
                        ckbs.eq(i).checkbox('check')                        
                    }
                }
            },
            onUnchecked: function() {
                let clickedTerm = this.value;
                let lg = ckbs.length;
                for (let i = 0; i < lg; i += 1) {
                    if (myVsearch.topicDict[clickedTerm].terms[ckbs.eq(i).attr('value')]) {
                        ckbs.eq(i).checkbox('uncheck')                        
                    }
                }  
            }
        })

        popModal.myModal.find('.master.checkbox').checkbox({
            onChecked: function() {
                ckbs.checkbox('check')
            },
            onUnchecked: function() {
                ckbs.checkbox('uncheck')
            }
        })
        ckbs.checkbox();
    },
    getCheckedTerms: function() {
        let cks = popModal.myModal.find('#termsCks').find('.checkbox');
        let lg = cks.length;
        let checkedTermsDict = {};
        for (let i = 1; i < lg; i += 1) {
            let tempElement = cks.eq(i);
            if (tempElement.checkbox('is checked')) {
                checkedTermsDict[tempElement.text()] = 0;
            }
        }

        return checkedTermsDict;
    },
    initial: function() {
        
        $('#mdlToggle').on('click', function() {
            windowControl.showTermsCheckList();
        })
    }
}

var pageBar = {
    pageNow : 0,
    pageSum : 1,
    firstCall : true,
    pageNumEle: $('#pa2'),
    setPage : function(pageNum) {
        this.pageNumEle.dropdown('set selected', pageNum);
        if (pageNum > 0 && pageNum <= this.pageSum) {
            this.setPageText(pageNum);
        }
    },
    initPageNum: function() {
        this.pageNumEle.dropdown({
            onChange(val, tx) {
                pageBar.changePage(+tx);
                pageBar.setPageText(+tx);
            }
        });
    },
    setPageText: function(num) {
        this.pageNow = num;
        if (this.pageSum < 1) {
            this.pageSum = 1;
        }
        let showInfo = num + '/' + this.pageSum;
        this.pageNumEle.dropdown('set text', showInfo);
    },
    resetPageNum: function(number) {
        this.pageNow = 1;
        this.pageSum = number;
        this.setPageText(this.pageNow);
        let res = '';
        for (let i = 1; i <= number; i += 1) {
            res += '<div class="item">' + i + '</div>'; 
        }
        this.pageNumEle.find('.menu').html(res);
    },
    previousPage : function() {
        pageBar.setPage(pageBar.pageNow-1);
    },
    nextPage : function() {
        pageBar.setPage(pageBar.pageNow+1);
    },
    changePage : function(val) {
        if (val == 0 || pageBar.pageNow === val || typeof val !== 'number') {
            return;
        } else {
            var skip2 = reOrderList.numEachPage * (val - 1);
            if (skip2 > reOrderList.newOrderList.length || skip2 < 0) {
                return 0;
            }
            reOrderList.displayTheOrder(skip2);
            this.pageNow = parseInt(val);
        }
    }
}

var searchBox = {
    dataArr: [],

    jele: $('#multiQueryBox'),
    jBoxEle: $('#queryBox'),
    showQueryBox: function() {
        searchBox.jele.show();
    },
    hideQueryBox: function() {
       searchBox.jele.hide();
    },
    resetQueryBox: function() {
        this.jBoxEle.empty();
        searchBox.dataArr = [];
    },
    addOneQuery: function(para) {
        let hasEle = false;
        let temp = '';
        let isFirst = true;

        temp += '<div class="ui segment searchBox"><div class="ui divided list">';
        
        para.condition = 'and'

        if (para.startDate || para.endDate) {
            temp += '<div class="item"><div class="content"><div class="header">Date:</div>'
            temp += '<div class="description">' + para.startDate + ' - ' + para.endDate + '</div></div></div>'
            hasEle = true;
        }
        if (para.keyword) {
            temp += '<div class="item"><div class="content"><div class="header">Keywords:</div>';
            temp += '<div class="description">' + para.keyword + '</div></div></div>';
            hasEle = true;
        }

        temp += '</div></div>';
        let jq = $(temp);

        if (!isFirst) {
            jq.eq(0).on('click', function() {
                if (this.innerHTML === 'AND') {
                    $(this).removeClass('green')
                            .addClass('blue')
                            .text('OR');
                    para.condition = 'or';
                } else if (this.innerHTML === 'OR') {
                    $(this).removeClass('blue')
                            .addClass('red')
                            .text('NOT');
                    para.condition = 'not';
                } else {
                    $(this).removeClass('red')
                            .addClass('green')
                            .text('AND');
                    para.condition = 'and';
                }
            });
        }
        if (hasEle) {
            searchBox.dataArr.push(para)
            this.jBoxEle.append(jq)
        }
    },
    initial: function() {
        let self = searchBox;

        $('#clearSearchBox').on('click', function() {
            self.resetQueryBox();
        });
        
        $('#addToBox').on('click', function() {
            let searchBoxContent = myVsearch.getSearhContent();
            if (searchBoxContent) {
                self.addOneQuery(searchBoxContent);
                self.showQueryBox();
                myVsearch.clearSearch();
                // myVsearch.searchKeyword();
            }
        });
        $('#commitBoxSearch').on('click', function() {
            Vsearch_fd(self.dataArr);
        })

        function getDate(date) {
            let year = date.getFullYear();
            let month = ('0' + date.getMonth()).substr(-2);
            let day = ('0' + date.getDay()).substr(-2)
            return year + '' +  month + '' + day;
        }


        $('#startDate').calendar({
            type: 'date',
            endCalendar: $('#endDate'),
            formatter: {
                date: getDate
            }
        })

        $('#endDate').calendar({
            type: 'date',
            startCalendar: $('#startDate'),
            formatter: {
                date: getDate
            }
        })
    }
}

var myTimeline = {
    initial: function() {
        let timelinePane = $('#timeline');
        let instance = new activityIndex($('#timeline'), timelinePane.width(), 400);
        instance.init();
        // this.myTimeline.processData(myVsearch.titleDict);
        // let that = this;
        instance.callback = function(d1, d2) {
            notifyier.update('selectedDateInterval', d1, d2);
            if (d1 == d2) {
                reOrderList.allData();
                notifyier.update('clearTermsFilter');
            } else {
                reOrderList.dateFilter(d1, d2);
            }
        }

        return instance;
    },
}

var clickedTermsBox = {
    tag: $('#clcInfo'),
    termsDict: {},
    updateBox: function(txt) {
        this.tag.html(txt);
    },
    clearBox: function() {
        this.termsDict = {};
        this.updateBox('')
    },
    addTerm: function(term) {
        if (this.termsDict[term] === undefined) {
            let temp = $('<a class="ui keywords label">' + term + '<i class="delete icon"></i></a>');
            temp.find('i').on('click', d=>{
                temp.remove();
                delete this.termsDict[term]
            })
            this.tag.append(temp);
            this.termsDict[term] = temp;
        }
    },
    initial: function() {
        let bts = $('#clcButtons').children();
        bts.eq(0).on('click', d=>{
            this.clearBox();
        })
    }
}

var makeGroup = {
    groupsInfo : {},
    groupNum : 0,
    searchGroups : 3,
    docsGrouped : false,
    groupTheGraph : function(initialInterGraph, groupSize) {
        makeGroup.groupsInfo = {};
        var groupFinal = initialInterGraph;

        if (!initialInterGraph.hasOwnProperty('termsArrs') || initialInterGraph.termsArrs.length < groupSize) {
            getMatrixVertiMax(groupFinal);
            getTermsGroups(groupFinal);
            
            optimiseGroup(groupFinal);
            regroupTerms(groupFinal);
            createTermsArr(groupFinal);
            getOptiGroup(groupFinal);
        } 
        reduceGroup(groupSize, groupFinal);

        var i, j, len, term, len2, leaf, leafList, tempInfo = {};

        for (i = 0, len = groupFinal.termsArrs.length; i < len; i += 1) {
            leafList = groupFinal.termsArrs[i];
            for (j = 0, len2 = leafList.length; j < len2; j += 1) {
                leaf = leafList[j];
                term = groupFinal.nodes[leaf];
                tempInfo[term.text] = i + 1;
                term.group = i + 1;
            }
        }
        makeGroup.groupNum = len;
        makeGroup.groupsInfo = tempInfo;
    }
}

var sidebarPane = {
    mySidebar: $('.ui.sidebar'),
    maxSnippetsNum: 200,
    maxTermsNum: 100,
    isTimelineShowed: true,
    showSidebar : function() {
        sidebarPane.mySidebar
                    .sidebar('setting', 'transition', 'overlay')
                    .sidebar('toggle');
    },
    initial: function() {
        const SNIPPETS_NUM_INPUT_INDEX = 1;

        const TERMS_NUM_INPUT_INDEX = 2;

        const TIMELINE_TAGGLE = 3;

        const FILE_PATH_INPUT_INDEX = 4;

        const PROGRESS_BAR_INDEX = 5;

        const CONFIRM_BUTTON_INDEX = 6;


        $('#pageID').on('click', function() {
            sidebarPane.showSidebar();
        });
        sidebarPane.mySidebar.find('.checkbox').checkbox({
            'onChange': function(d) {
                if (sidebarPane.isTimelineShowed) {
                    sidebarPane.isTimelineShowed = false;
                    $('#timeline').hide();
                } else {
                    sidebarPane.isTimelineShowed = true;
                    $('#timeline').show();
                }
            }
        });
        let inputEles = sidebarPane.mySidebar.children();

        let snippetsNumEle = inputEles.eq(SNIPPETS_NUM_INPUT_INDEX).find('input');
        snippetsNumEle.on('input', d=>{
            let snippetsNum = +d.target.value;
            if (snippetsNum > 0) {
                sidebarPane.maxSnippetsNum = snippetsNum;
            } else {
                sidebarPane.maxSnippetsNum = sidebarPane.maxSnippetsNum;
            }
        })

        let termsNumEle = inputEles.eq(TERMS_NUM_INPUT_INDEX).find('input');
        termsNumEle.on('input', d=>{
            let termsNum = +d.target.value;
            if (termsNum > 0) {
                sidebarPane.maxTermsNum = termsNum;
            } else {
                sidebarPane.maxTermsNum = sidebarPane.maxTermsNum;
            }
        })


        let progressBar = inputEles.eq(PROGRESS_BAR_INDEX).find('#pgsbar');
        let progressLabel = inputEles.eq(PROGRESS_BAR_INDEX).find('.label');

        let progressShow = null;

        inputEles.eq(CONFIRM_BUTTON_INDEX).find('.button').on('click', d=>{
            progressLabel.html("Loading")
            clearInterval(progressShow);
            let count = 1;
            progressShow = setInterval(d=>{
                if (count >= 7) {
                    clearInterval(progressShow);
                } else {
                    count += 1;
                    progressBar.progress('set percent', count * 10)
                }
                progressLabel.html(count);
            }, 1000);

            let dataPath = inputEles.eq(FILE_PATH_INPUT_INDEX).find('input').val();

            let para = {
                'dataPath': dataPath
            }

            myVsearch.dataConfig = para;

            utilObj.requestData('/config', para, d=>{

                clearInterval(progressShow);

                if (!d) {
                    progressBar.addClass('error');
                    progressLabel.html('Error')
                } else {
                    myTimeline.processData(d);
                    progressBar.progress('complete')
                    progressLabel.html('Complete')

                    setTimeout(a=>{
                        sidebarPane.showSidebar()
                    }, 600)
                }
            })
        })
    }
}

var windowControl = {
    windowDict : {},
    currentWindow : "",
    lastWindow: '',
    showTermsCheckList: function() {
        if (windowControl.currentWindow !== '') {
            let ctw = windowControl.windowDict[windowControl.currentWindow];
            ctw.getCheckList();
            popModal.showModal();
        }
    },
    reopenWindow: function() {
        if (windowControl.lastWindow !== '') {
            this.clearGraph();
            windowControl.changeWindow(windowControl.lastWindow);
        }
    },
    updateTermsFromCheckList: function() {
        if (windowControl.currentWindow !== '') {
            let checkTerms = popModal.getCheckedTerms();
            if (Object.keys(checkTerms).length > 0) {
                let ctw = windowControl.windowDict[windowControl.currentWindow];
                ctw.showCheckData(checkTerms);
            }
        }
    },
    changeWindow : function(tag_Name) {
        let graphPaneName = 'g' + tag_Name;
        if (!myVsearch.hasData) return false;
        if (windowControl.currentWindow === graphPaneName) {
            return false;
        } else if (graphPaneName === "ghd") {
            windowControl.clearGraph();
            windowControl.lastWindow = '';
            return false;
        }
        windowControl.lastWindow = tag_Name;
        if (windowControl.currentWindow !== "") {
            windowControl.windowDict[windowControl.currentWindow].hideWin();
        }
        var result = windowControl.windowDict[graphPaneName];
        if (!result) {
            result = windowControl.addWindow(graphPaneName);
        };
        windowControl.currentWindow = graphPaneName;
        $(graphPaneName).show();
        result.showWin();
    },
    clearGraph : function() {
        for (var item in windowControl.windowDict) {
            if (windowControl.windowDict[item]) {
                windowControl.windowDict[item].clearGraphContent();
                windowControl.windowDict[item].hideWin();
            }
        };
        windowControl.currentWindow = "";
        $('.tl').removeClass('active');
    },
    addWindow : function(windowName) {
        windowControl.windowDict[windowName] = graphRequest(windowName);
        return windowControl.windowDict[windowName];
    }
};