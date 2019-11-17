
"use strict"
function getTheGraphs(graphSize) {
    // var termGraph = benterm2Document(myVsearch.searchResults);
    let tempDict = {};
    let subTermsGraph = null;
    if (graphSize) {
        subTermsGraph = myVsearch.termsAllArrs.slice(0, graphSize);
    } else {
        subTermsGraph = myVsearch.termsAllArrs;
    }
    for (let oneTerm of subTermsGraph) {
        tempDict[oneTerm.text] = oneTerm.doc;
    }
    var documentGraph = doc2Document(tempDict);

    var interactGraph = interactionGraph(documentGraph);

    return interactGraph;
}

function benterm2Document(searchResult) {
    var res = {term2Doc: {}};
    var tempTestList = [];

    var index, len, index2, len2, key, tempList, tempTerm;

    var checkArr = []


    for (key in myVsearch.searchResults) {
        tempList = myVsearch.searchResults[key].contentList();

        for (index = 0, len = tempList.length; index < len; index += 1) {
            tempTerm = tempList[index];
            if (tempTerm === '') {
                continue;
            }
            if (res.term2Doc[tempTerm]) {
                res.term2Doc[tempTerm].push(key);
            } else {
                res.term2Doc[tempTerm] = [key]
            }
        }
    }

    return res;

}

function filterTerms(data, checkedTerms) {
    
}

function filterTerm2DocGraph(tdGraph, termsFilter) {
    let term2Docfiltered = {};
    for (let oneTerm in tdGraph) {
        if (termsFilter[oneTerm] !== undefined) {
            term2Docfiltered[oneTerm] = tdGraph[oneTerm]
        }
    };
    let documentGraph = doc2Document(term2Docfiltered);
    let interGraph = interactionGraph(documentGraph);
    return interGraph;
}

function doc2Document(term2docDict) {
    var term, docs,
        index, len, indice,
        index2, docs2, indice2;
    var result = [];
    var tempCheckDic = {};
    var tempCheckString;
    var i = 0;
    for (term in term2docDict) {
        docs = term2docDict[term];
        len = docs.length;
        for (index = 0; index < len - 1; index += 1) {
            indice = docs[index];
            for (index2 = index + 1; index2 < len; index2 += 1) {
                indice2 = docs[index2];
                tempCheckString = indice + "-" + indice2;
                if (!tempCheckDic.hasOwnProperty(tempCheckString)) {
                    result.push({source:indice, target:indice2, terms: [term]});
                    tempCheckDic[tempCheckString] = i;
                    i += 1;
                } else {
                    result[tempCheckDic[tempCheckString]].terms.push(term);
                }
            }
        }
    }
    return result;
}

function getConIndex(a, b, interGraph) {
    var i, len, oneLink, index;
    len = interGraph.links.length;
    index = 0;
    for (i = 0; i < len; i += 1) {
        oneLink = interGraph.links[i];
        if ((oneLink.source == a && oneLink.target == b) || (oneLink.source == b && oneLink.target == a)) {
            index = oneLink.value;
        }
    }
    return index;
}

function getInterMatrix(interGraphSource) {
    var result = interGraphSource;
    result.matrix = [];
    result.forceData = [];
    result.neighbourDict = {};
    var index1, index2;
    var len = result.sizeOfMatrix;
    var tempArray, tempIndex, tempVerIndex, tempAy;
    for (index1 = 0; index1 < len; index1 += 1) {
        tempArray = [];
        tempVerIndex = [];
        tempAy = [];
        for (index2 = 0; index2 < len; index2 += 1) {
            if (index2 === index1) {
                tempAy.push(index2);
                tempIndex = result.nodes[index1].termIndex / result.sumLinks;
            } else {
                tempIndex = getConIndex(index1, index2, result);
                tempIndex /= result.nodes[index2].termIndex;
                if (tempIndex > 0) {
                    tempVerIndex.push(index2);
                    tempAy.push(index2);
                }
            }
            tempArray.push(parseFloat(tempIndex.toFixed(10)));
        }
        result.forceData.push(tempVerIndex);
        result.matrix.push(tempArray);
        result.neighbourDict[index1] = tempAy;
    }
}

function interactionGraph(doc2DocGraph) {
    var result = {nodes:[], links: []}, termList, index, len, index2,
        indice1, indice2, term1, term2, k, tempCheckString = "",
        tempCheckDic = {}, tempCheckList = {}, linkCheck = {}, i = 0, j = 0;
    var leng = doc2DocGraph.length;
    var eCount = 0;
    for (k = 0; k < leng; k += 1) {
        termList = doc2DocGraph[k].terms;
        len = termList.length;
        for (index = 0; index < len; index += 1) {
            term1 = termList[index];
            if (len < 2) {
                continue;
            }
            if (!tempCheckList.hasOwnProperty(term1)) {
                // if (len == 1) {
                    // if (!linkCheck.hasOwnProperty(term1)) {
                    //     linkCheck[term1] = 1;
                    // } else {
                    //     linkCheck[term1] += 1;
                    // }
                    // continue;
                // } else {
                    // if (!linkCheck.hasOwnProperty(term1)) {
                        result.nodes.push({text:term1, termIndex: 1});
                    // } else {
                    //     result.nodes.push({text:term1, termIndex: linkCheck[term1]});
                    //     delete linkCheck[term1];
                    // }
                // }
                tempCheckList[term1] = i;
                i += 1;
            } else {
                // if (len > 1) {
                    result.nodes[tempCheckList[term1]].termIndex += 1;
                // }
            }
            indice1 = tempCheckList[term1];
            for (index2 = index + 1; index2 < len; index2 += 1) {
                term2 = termList[index2];
                if (!tempCheckList.hasOwnProperty(term2)) {
                    result.nodes.push({text:term2, termIndex: 0});
                    tempCheckList[term2] = i;
                    i += 1;
                }
                indice2 = tempCheckList[term2];
                if (term1 > term2) {
                    tempCheckString = term2 + "-" + term1;    
                } else {
                    tempCheckString = term1 + "-" + term2;
                }
                if (!tempCheckDic.hasOwnProperty(tempCheckString)) {
                    result.links.push({"source":indice1,"target":indice2,"value":1});
                    tempCheckDic[tempCheckString] = j;
                    j += 1;
                } else {
                    result.links[tempCheckDic[tempCheckString]].value += 1;
                }
                eCount += 1;
            }
        }
    }
    result.sumLinks = eCount;//result.links.length;
    result.sizeOfMatrix = result.nodes.length; 
    getInterMatrix(result);
    getNodesDegree(result);
    return result;
}

function getMaxOfArray(dataIn) {
    var result = {value: 0, indice: 0};
    dataIn.forEach(function(i,t) {
        if (i > result.value) {
            result.value = i;
            result.indice = t;
        }
    })
    return result;
}

function getNodesDegree(interGraph) {
    var i, j, len, degreeNum;
    if (interGraph.hasOwnProperty("forceData")) {
        for (i = 0; i < interGraph.sizeOfMatrix; i += 1) {
            degreeNum = interGraph.forceData[i].length;
            interGraph.nodes[i].degree = degreeNum;
            interGraph.nodes[i].nodeSize = degreeNum;
        }
    } else {
        for (i = 0; i < interGraph.sizeOfMatrix; i += 1) {
            degreeNum = -1;
            for (j = 0; j < interGraph.sizeOfMatrix; j += 1) {
                if (interGraph.matrix[i][j] != 0) {
                    degreeNum += 1;
                }
            }
            interGraph.nodes[i].degree = degreeNum;
            interGraph.nodes[i].nodeSize = degreeNum;
        }
    }
}

function getTermsGroups(interGraphSource) {
    var termsGroups = {},
        bgstIndex, root, leaf;
    for (bgstIndex in interGraphSource.maxEle) {
        root = interGraphSource.maxEle[bgstIndex];
        leaf = bgstIndex.toString();
        if (termsGroups.hasOwnProperty(root)) {
            if (leaf === root) {
                continue;
            } else {
                termsGroups[root].push(leaf);
            }
        } else {
            if (leaf == root) {
                termsGroups[root] = [];
            } else {
                termsGroups[root] = [leaf];
            }
        }
    }
    interGraphSource.termsGroup = termsGroups;
    delete interGraphSource.maxEle;
}

function optimiseGroup(interGraphVersion1) {
    var isChanged, tempRoot, tempList, i, len, leafList, initialGroup, leaf, leafGroup, indice1, indice2;
    initialGroup = interGraphVersion1.termsGroup;
    for (tempRoot in initialGroup) {
        leafList = initialGroup[tempRoot];
        tempList = [];
        len = leafList.length;
        isChanged = false;
        for (i = 0; i < len; i += 1) {
            leaf = leafList[i];
            if (initialGroup.hasOwnProperty(leaf)) {
                if (len == 1) {
                    leafGroup = initialGroup[leaf];
                    if (leafGroup.length == 1 && leafGroup[0] == tempRoot) {
                        indice1 = interGraphVersion1.matrix[tempRoot][tempRoot];
                        indice2 = interGraphVersion1.matrix[leaf][leaf];
                        if (indice1 < indice2) {
                            isChanged = true;
                            delete initialGroup[tempRoot];
                        } else {
                            tempList.push(leaf);
                            delete initialGroup[leaf];
                        }
                    } else {
                        continue;
                    }
                } else {
                    continue;
                }
            } else {
                tempList.push(leaf);
            }
        }
        if (!isChanged) {
            initialGroup[tempRoot] = tempList;
        }
    }
}

function getMatrixVertiMax(interGraph) {
    var res = {}, i, len, index1, tempForce, maxForceID, maxForce, nbList, nbIndex;
    for (index1 = 0; index1 < interGraph.sizeOfMatrix; index1 += 1) {
        nbList = interGraph.forceData[index1];
        maxForce = 0;
        for (i = 0, len = nbList.length; i < len; i += 1) {
            nbIndex = nbList[i];
            tempForce = interGraph.matrix[nbIndex][index1] * interGraph.matrix[index1][nbIndex];
            if (tempForce > maxForce) {
                maxForceID = nbIndex;
                maxForce = tempForce;
            }
        }
        res[index1] = maxForceID;
    }
    interGraph.maxEle = res;
}

function getSubInterGraph(connectedTerms, interGraphOriginal) {
    var key, term, i, len = connectedTerms.length,
        newDocuGraph = {},
        tempRes = {},
        result = {};
    if (len == 0) {
        console.log("no terms selected");
        return 0;
    }
    for (i = 0; i < len; i += 1) {
        key = connectedTerms[i];
        term = interGraphOriginal.nodes[key].text;
        tempRes[term] = myVsearch.termGraph.term2Doc[term];
    }
    newDocuGraph = doc2Document(tempRes);
    result = interactionGraph(newDocuGraph);
    return result;
}

function reduceInterGraph(startPosit, sumTerms, interGraph) {
    var endPosit = sumTerms;
    if (endPosit >= interGraph.sizeOfMatrix) {
        return interGraph;
    }

    var unKickList = [];
    var i, newInterGraph;
    for (i = startPosit; i < endPosit; i += 1) {
        unKickList.push(i);
    }
    // interGraph.nodes.sort(function(a, b) {
    //     return b.degree - a.degree;
    // })
    newInterGraph = getSubInterGraph(unKickList, interGraph);
    return newInterGraph;
}

function buildDendrogram(interGraph) {
    var tempRoot, leaf, leafList, i, len, oneChild;
    interGraph.dendrogram = {};
    for (tempRoot in interGraph.termsGroup) {
        interGraph.dendrogram[tempRoot] = {};
        interGraph.dendrogram[tempRoot]["text"] = interGraph.nodes[tempRoot].text;
        interGraph.dendrogram[tempRoot]["index"] = tempRoot;
        interGraph.dendrogram[tempRoot]["degree"] = interGraph.nodes[tempRoot].degree;
        interGraph.dendrogram[tempRoot]["children"] = [];
        leafList = interGraph.termsGroup[tempRoot];
        for (i = 0, len = leafList.length; i < len; i += 1) {
            leaf = leafList[i];
            oneChild = {};
            oneChild["text"] = interGraph.nodes[leaf].text;
            oneChild["index"] = leaf;
            oneChild["degree"] = interGraph.nodes[leaf].degree;
            interGraph.dendrogram[tempRoot]["children"].push(oneChild);
        }
    }    
}

function getDendrogram(myData) {
    var myCluster, reLen, oneRoot, dendrogramResult;
    myCluster = myData.dendrogram;
    reLen = Object.keys(myCluster).length;
    if (reLen > 1) {
        dendrogramResult = {};
        dendrogramResult["text"] = " ";
        dendrogramResult["children"] = [];
    }
    for (oneRoot in myCluster) {
        if (reLen > 1) {
            dendrogramResult.children.push(myCluster[oneRoot]);
        } else {
            dendrogramResult = myCluster[oneRoot];
        }
    }
    return dendrogramResult;
}

function getGroupOriginOrder(interGraph, kind) {
    var tempRoot, leaf, leafList, i = 1, index, len;
    for (tempRoot in interGraph.termsGroup) {
        interGraph.nodes[tempRoot][kind] = i;
        leafList = interGraph.termsGroup[tempRoot];
        for (index = 0, len = leafList.length; index < len; index += 1) {
            leaf = leafList[index];
            interGraph.nodes[leaf][kind] = i;
        }
        i += 1;
    }
}

function getforceFromTermToTerm(interGraphIn, t1, t2) {
    var forceValue;
    
    forceValue = interGraphIn.matrix[t2][t1] * interGraphIn.matrix[t1][t2];
    if (forceValue == 0) {
        forceValue = - (interGraphIn.matrix[t2][t2] + interGraphIn.matrix[t1][t1]);
    }
    return forceValue;
}

function getForceFromTermToOneGroup(interGraphIn, t1, rootName) {
    if (!interGraphIn.termsGroup.hasOwnProperty(rootName)) {
        return 0;
    } else {
        var leaf, leafList, len, forceValue, memberNum;
        memberNum = 1;
        forceValue = getforceFromTermToTerm(interGraphIn, t1, rootName);
        leafList = interGraphIn.termsGroup[rootName];
        for (var i = 0, len = leafList.length; i < len; i += 1) {
            leaf = leafList[i];
            if (leaf === t1) {
                continue;
            };
            memberNum += 1;
            forceValue += getforceFromTermToTerm(interGraphIn, t1, leaf);
        }

        return forceValue/memberNum;
    }
}

function getForceGroupToGroup(interGraphIn, g1, g2, isRe) {
    var i, j, arr1, arr2, len1, len2, leaf1, leaf2, forceValue, tempValue;
    forceValue = 0;
    arr1 = interGraphIn.termsArrs[g1];
    arr2 = interGraphIn.termsArrs[g2];
    len1 = arr1.length;
    len2 = arr2.length;
    for (i = 0; i < len1; i += 1) {
        leaf1 = arr1[i];
        for (j = 0; j < len2; j += 1) {
            leaf2 = arr2[j];
            if (!isRe) {
                tempValue= getforceFromTermToTerm(interGraphIn, leaf1, leaf2);
            } else {
                tempValue = interGraphIn.matrix[leaf1][leaf2] * interGraphIn.matrix[leaf2][leaf1];
                if (tempValue == 0) {
                    // tempValue = -interGraphIn.matrix[leaf1][leaf1] * interGraphIn.matrix[leaf2][leaf2];
                }
            }
            forceValue += tempValue;
        }
    };

    if (isRe) {
        return forceValue/(len1+len2)*2;
    } else {
        return forceValue;
    };
}

function getMaxForceTermToGroup(interGraph, termID) {
    // console.log(interGraph);
    var leaf, i, len, leafList, tempForce,
        tempRoot, forceNeighbour, maxForce, maxForceID, maxForceValue = 0;
    for (tempRoot in interGraph.termsGroup) {

        tempForce = getForceFromTermToOneGroup(interGraph, termID, tempRoot);

        if (tempForce > maxForceValue) {
            maxForceValue = tempForce;
            maxForceID = tempRoot;
        }
        
        leafList = interGraph.forceData[termID];
        for (i = 0, len = leafList.length; i < len; i += 1) {
            leaf = leafList[i];
            if (interGraph.termsGroup.hasOwnProperty(leaf)) {
                continue;
            } else {
                forceNeighbour = interGraph.matrix[leaf][termID] * interGraph.matrix[termID][leaf];
                if (forceNeighbour > maxForceValue) {
                    maxForceValue = forceNeighbour;
                    maxForceID = leaf;
                }
            }
        }
    }
    maxForce = {rootID: maxForceID, value: maxForceValue};
    return maxForce;
}

function regroupTerms(interGraphVersion2) {
    var tempRoot, leaf, leafList, i, len, maxForceRoot, maxForce, addNewRoot = true, groupNum;
    while(addNewRoot) {
        optimiseGroup(interGraphVersion2);
        addNewRoot = false;
        groupNum = Object.keys(interGraphVersion2.termsGroup).length;
        for (tempRoot in interGraphVersion2.termsGroup) {
            leafList = interGraphVersion2.termsGroup[tempRoot];
            i = 0;
            while (i < leafList.length) {
                leaf = leafList[i];

                maxForce = getMaxForceTermToGroup(interGraphVersion2, leaf);
                if (maxForce.value > 0 && maxForce.rootID != tempRoot) {
                    if (interGraphVersion2.termsGroup.hasOwnProperty(maxForce.rootID)) {
                        interGraphVersion2.termsGroup[maxForce.rootID].push(leaf);
                    } else {
                        interGraphVersion2.termsGroup[maxForce.rootID] = [leaf];
                        addNewRoot = true;
                    }
                    leafList.splice(i, 1);
                } else {
                    i += 1;
                }
            }
        }
    }
    buildDendrogram(interGraphVersion2);
}

function createTermsArr(interGraphIn) {
    var i, j, tempArr, leafList;
    interGraphIn.termsArrs = [];
    for (var og in interGraphIn.termsGroup) {
        tempArr = [];
        tempArr.push(parseInt(og));
        leafList = interGraphIn.termsGroup[og];
        for (i = 0, j = leafList.length; i < j; i += 1) {
            tempArr.push(parseInt(leafList[i]));
        }
        interGraphIn.termsArrs.push(tempArr);
    }
    delete interGraphIn.termsGroup;
}

function getMaxForceFromOneGroupToGroup(interGraphIn, g1) {
    var j, len, tempForceValue, maxForceValue;
    maxForceValue = 0;
    len = interGraphIn.termsArrs.length;
    for (j = 0; j < len; j += 1) {
        if (j === g1) {
            continue;
        } else {
            tempForceValue = getForceGroupToGroup(interGraphIn, g1, j);
            if (tempForceValue > maxForceValue) {
                maxForceValue = tempForceValue;
                groupNum = j;
            }
        }
    }
}

function getMaxForceGroupToGroup(interGraphIn, isRe) {
    var i, j, len, g1, g2, maxForceValue, tempForceValue, flag;
    len = interGraphIn.termsArrs.length;
    flag = true;
    for (i = 0; i < len; i += 1) {
        for (j = 0; j < len; j += 1) {
            if (i === j) {
                continue;
            } else {
                tempForceValue = getForceGroupToGroup(interGraphIn, i, j, false);
                if (tempForceValue > maxForceValue || flag) {
                    maxForceValue = tempForceValue;
                    flag = false;
                    g1 = i;
                    g2 = j;
                }
            }
        }
    };
    return {
        forceValue : maxForceValue,
        group1 : g1,
        group2 : g2
    }
}

function buildOriginOrder(interGraphIn) {
    var i, len, leafList, leaf, j, leafNum;
    len = interGraphIn.termsArrs.length;
    for (i = 0; i < len; i += 1) {
        leafList = interGraphIn.termsArrs[i];
        leafNum = leafList.length;
        for (j = 0; j < leafNum; j += 1) {
            leaf = leafList[j];
            interGraphIn.nodes[leaf].ogod = i;
        }
    }
}

function mergeTwoGroups(interGraphIn, g1, g2) {
    var root1, root2, groupReduce, groupAppend;
    root1 = interGraphIn.termsArrs[g1][0];
    root2 = interGraphIn.termsArrs[g2][0];
    if (interGraphIn.matrix[root1][root1] < interGraphIn.matrix[root2][root2]) {
        groupReduce = g1;
        groupAppend = g2;
        var tempRoot = root1;
        root1 = root2;
        root2 = tempRoot;
    } else {
        groupReduce = g2;
        groupAppend = g1;
    }
    interGraphIn.dendrogram[root1].children.push(interGraphIn.dendrogram[root2]);
    delete interGraphIn.dendrogram[root2]; 
    interGraphIn.termsArrs[groupAppend] = interGraphIn.termsArrs[groupAppend].concat(interGraphIn.termsArrs[groupReduce]);
    interGraphIn.termsArrs.splice(groupReduce, 1);
}

function getOptiGroup(interGraphIn) {
    var groupInfo;
    while (true) {

        groupInfo = getMaxForceGroupToGroup(interGraphIn, false);   
        if (groupInfo.forceValue <= 0) {
            buildOriginOrder(interGraphIn);
            interGraphIn.optiSize = interGraphIn.termsArrs.length;
            break;
        } else {
            if (interGraphIn.termsArrs.length > 1) {
                mergeTwoGroups(interGraphIn, groupInfo.group1, groupInfo.group2);
            } else {
                break;
            }
        }
    }
}

function getGroupToReduce(interGraphIn, existList) {
    var minLen, i, len, tempLen, res, flag;
    len = interGraphIn.termsArrs.length;
    flag = true;
    for (i = 0; i < len; i += 1) {
        tempLen = interGraphIn.termsArrs[i].length;
        if (tempLen < minLen || flag) {
            if (existList.indexOf(i) == -1) {
                minLen = tempLen;
                res = i;
                flag = false;
            }
        }
    }
    return res;
}

function getMaxForceG2G(interGraphIn, g1) {
    var j, len, tempForceValue, maxForceValue, groupNum, flag;
    len = interGraphIn.termsArrs.length;
    flag = true;
    for (j = 0; j < len; j += 1) {
        if (j === g1) {
            continue;
        } else {
            tempForceValue = getForceGroupToGroup(interGraphIn, g1, j, true);
            if (flag || tempForceValue > maxForceValue) {
                maxForceValue = tempForceValue;
                groupNum = j;
                flag = false;
            }
        }
    }
    return groupNum;
}

function reduceGroup(minGroupSize, interGraphVersion3) {
    var groupSize, tempGroup, groupOrdered, leafList, i = 0, groupReduce, groupMaxForce, groupAppend;
    var checkList = [];

    while (true) {
        groupSize = interGraphVersion3.termsArrs.length;
        
        if (minGroupSize >= groupSize + i || groupSize === 1) {
            break;
        }
        groupReduce = getGroupToReduce(interGraphVersion3, checkList);
        groupAppend = getMaxForceG2G(interGraphVersion3, groupReduce);
        if (groupMaxForce != 0) {
              mergeTwoGroups(interGraphVersion3, groupAppend, groupReduce);
        } else {
            checkList.push(groupReduce);
            i += 1;
        }
    } 
}

