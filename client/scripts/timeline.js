"use strict"
function activityIndex(ele, width, type) {
	this.ele = ele;
	this.type = type;
	this.margin = {top:10, right: 30, bottom: 20, left: 30, titleSpace: 30};
	this.width = width - this.margin.left - this.margin.right;;
	if (this.width < 600) {
		this.width = 600;
	}
	this.height = 80 ;
	this.dataFormat = 'm';
	this.linkDate = false;
	this.dateParser = d3.time.format('%Y%m%d').parse;
	this.monthParse = d3.time.format('%Y%m').parse;
	this.yearParse = d3.time.format('%Y').parse;
	this.atFormat = false;
	this.drawPathInterval = 1000;
	// let that = this;
	// this.backgroundColor = [
	// 	["Abe2", '20121226', '20141224', '#1f78b4'],
	// 	["Noda", '20110902', '20121226', '#33a02c'],
	// 	["Kan", '20100608', '20110902', '#fb9a99'],
	// 	["Hatoyama", '20090916', '20100608', '#cab2d6'],
	// 	["Aso", '20080904', '20090916', '#b2df8a'],
	// 	["Fukuda", '20070926', '20080904', '#e31a1c'],
	// 	["Abe1", '20060926', '20070926', '#a6cee3'],
	// 	["Koizumi3", '20050921', '20060926', '#ff7f00'],
	// 	["Koizumi2", '20031119', '20050921', '#fdbf6f'],
	// 	["Koizumi1", '20010426', '20031119', '#ffff99'],
	// 	["Mori2", '20000704', '20010426', '#6a3d9a'],
	// 	["Abe3", '20141224', '20170426', '#00008B']
	// ].map(function(d) {
	// 	let a = d;
	// 	a[1] = that.dateParser(d[1]);
	// 	a[2] = that.dateParser(d[2]);
	// 	return a;
	// })
};

activityIndex.fn = activityIndex.prototype;

activityIndex.fn.init = function(pm) {
	this.pm = pm;
	this.drawAxis();
	this.updateYDomain([0, 1]);
	this.updateXDomain([this.monthParse('200001'), this.monthParse('201712')]);
	this.addBrush();
	let that = this;
	// $('#rtTm').on('click', function() {
	// 	that.returnOriginalPath();
	// 	reOrderList.allData();
	// 	that.clearBrush();
	// 	myVsearch.clearSearchDate();
	// 	if (that.callback) {
	// 		that.callback(0, 0);
	// 	}
	// });
};

activityIndex.fn.hideSelf = function() {
	this.ele.css('display', 'none');
}

activityIndex.fn.showSelf = function() {
	this.ele.css('display', 'block');
}

activityIndex.fn.clearSelf = function() {
	// this.ele.html('');
}

activityIndex.fn.updateInfoPane = function(info) {
	this.infoPane.html(info);
}

activityIndex.fn.clearInfoPane = function() {
	if (this.infoPane) {
		this.infoPane.empty();
	}
}

activityIndex.fn.updateXDomain = function(dateDomain) {
	this.x.domain(dateDomain);
	// this.updateBackgroundColor(dateDomain);
	this.xrange.transition().call(this.xAxis);
}

activityIndex.fn.updateYDomain = function(valDomain) {
	this.y.domain(valDomain);
	this.yrange.transition().call(this.yAxis);
}

activityIndex.fn.getStrDate = function(d) {
	var year = d.getFullYear().toString();
	var month = (d.getMonth() + 1).toString();
	var day = d.getDate().toString();
	if (day == 0) {
		console.log('bad')
	}
	if (month.length === 1) {
		month = '0' + month;
	}
	if (day.length === 1) {
		day = '0' + day;
	}
	return year  + month  + day;
}

activityIndex.fn.brushend = function() {
	
	var ex = this.brush.extent();

	this.lastExtent = ex;
	var d1 = ex[0];
	var d2 = ex[1];
	var date1 = this.getStrDate(d1);
	var date2 = this.getStrDate(d2);
	this.selectCertainInterval(date1, date2);
}

activityIndex.fn.selectCertainInterval = function(date1, date2) {

	myVsearch.setSearchDate(date1, date2);
	if (this.callback) {
		if (date1 === date2) {
			this.clearBrush();
			this.clearHoverLine();
			// this.updateTitleInfo('');
			myVsearch.clearSearchDate();
		} else {

			// this.updateTitleInfo('From ' + date1 + ' to ' + date2);
		}
		var info = '';

		info = this.callback(date1, date2);
		// if (info === '') {
		// 	this.clearBrush();
		// } else {
			// this.updateInfoPane(info);
		// }
	}
}

activityIndex.fn.addBrush = function() {
	var that = this;
	var arc = d3.svg.arc()
				.outerRadius(this.height / 6)
				.startAngle(0)
				.endAngle(function(d, i) { return i ? -Math.PI : Math.PI; });
				
	this.brushPane = this.context.append("g")
		.attr("class", "x brush")
		.call(this.brush);

	this.brushPane.on('click', function(argument) {
		console.log('f')
	})
		
	this.brushPane.selectAll(".resize").append("path")
		.attr('stroke', '#6495ED')
		.attr('fill-opacity', .125)
		.attr("transform", "translate(0," +  this.height/2 + ")")
		.attr("d", arc);

	this.brushPane.selectAll("rect")
		.attr("height", this.height)
		.attr('shape-rendering', 'crispEdges')
		.attr('fill-opacity', .125);
}

activityIndex.fn.removeBrushPane = function() {
	this.brushPane.remove();
}

activityIndex.fn.clearBrush = function() {
	this.brush.clear();
	this.brush.extent();
	this.clearInfoPane();
	this.brushPane.call(this.brush);
}

activityIndex.fn.drawAxis = function() {
	var that = this;
	this.x = d3.time.scale().range([0, this.width]);

	this.y = d3.scale.linear().range([this.height, 0]);

	this.xAxis = d3.svg.axis()
					.scale(that.x)
					.orient("bottom")
					.tickFormat(d3.time.format("%Y-%m-%d"));

	this.yAxis = d3.svg.axis()
					.scale(that.y)
					.orient("left")
					.tickFormat(d3.format('d'));

	this.brush = d3.svg.brush()
					.x(this.x)
					.on('brushstart', function() {
						d3.event.sourceEvent.stopPropagation();
					})
					.on('brush', function() {
						d3.event.sourceEvent.stopPropagation();
					})
					.on("brushend", function() {
						that.brushend();
					});

	var svg = d3.select(this.ele.get(0)).append("svg")
				.attr("width", this.width + this.margin.left + this.margin.left)
				.attr("height", this.height + this.margin.top + this.margin.bottom + this.margin.titleSpace);

	this.context = svg.append("g")
				.attr("transform", "translate(" + that.margin.left + "," + (that.margin.top + this.margin.titleSpace) + ")")
				.on('mousemove', function() {
					// console.log()
				});

	this.bgcs = this.context.append('g');

	this.xrange = svg.append("g")
		.attr("class", "x axis")
		.attr("transform", "translate(" + this.margin.left + ',' + (this.height + this.margin.top + this.margin.titleSpace) + ")");

	this.titleInfo = svg.append('text')
						.attr('font-size', 14)
						.attr("transform", "translate("+ (this.width/2 + this.margin.left) + ',15)')
						.attr('text-anchor', 'middle');

	this.yrange = svg.append("g")
			.attr("transform", "translate(" + this.margin.left +", " + (this.margin.top + this.margin.titleSpace) + ")")
			.attr("class", "y axis");

	this.yrange.append("text")
		.attr("transform", "rotate(-90)")
		.attr("y", 6)
		.attr("dy", ".71em")
		.style("text-anchor", "end")
		.text("#Results");

	this.linePath = this.context.append("path")
						.attr("class", "line")
						.attr('fill', 'steelblue')
						.attr('stroke', 'steelblue')
						.attr('stroke-width', '1.5px');

	this.hoverPath = this.context.append('path')
											.attr('class', 'line')
											.attr('fill', 'none')
											.attr('stroke', 'red')
											.attr('stroke-width', '1.5px');

	this.hoverRectPane = this.context.append('g');

}

activityIndex.fn.updateBackgroundColor = function(dm) {
	
	let maxHeight = this.y.domain()[1];

	let that = this;
	this.bgcs.selectAll('*').remove();

	let tempArr = [];

	this.backgroundColor.forEach(function(d) {
		let tempVal = [];
		if (d[2] <= dm[1] && d[1] >= dm[0]) {
			tempVal = d;
			tempArr.push(tempVal);
		} else if (d[2] > dm[1] && d[1] < dm[1]){
			tempVal.push(d[0]);
			tempVal.push(d[1]);
			tempVal.push(dm[1]);
			tempVal.push(d[3]);
			tempArr.push(tempVal);
		} else if (d[1] < dm[0] && d[2] > dm[0]) {
			tempVal.push(d[0]);
			tempVal.push(dm[0]);
			tempVal.push(d[2]);
			tempVal.push(d[3]);
			tempArr.push(tempVal);
		}
	})
	let labelsArr = [];
	this.bgcs.selectAll('rect')
			.data(tempArr)
			.enter()
			.append('rect')
			.attr('width', function(d) {
				let x1 = that.x(d[1]);
				let x2 = that.x(d[2]);
				let w = x2 - x1;
				labelsArr.push({
					'label': d[0],
					'px': x1 + (w>>1),
					'py': -3,
					'd1': d[1],
					'd2': d[2]
				})
				return w;
			})
			.attr('height', this.y(0))
			.attr('x', function(d, i) {
				return that.x(d[1])
			})
			.attr('y', 0)
			.attr('fill', function(d) {
				return d[3];
			})
			.attr('opacity', 0.3);

	this.bgcs.selectAll('text')
			.data(labelsArr)
			.enter()
			.append('text')
			.text(function(d) {
				return d.label;
			})
			.attr('opacity', 1)
			.attr('font-size', 14)
			.attr('transform', function(d) {
				return 'translate('+ d.px + ',' + d.py + ')';
			})
			.attr('cursor', 'pointer')
			.attr('text-anchor', 'middle')
			.on('click', function(d) {
				let startDate = that.getStrDate(d.d1);
				let endDate = that.getStrDate(d.d2);
				that.clearBrush();
				that.selectCertainInterval(startDate, endDate);
			});
}

activityIndex.fn.myLineDrawer = function(data) {

	let lg = data.length;
	let d = 'M ' + this.x(data[0].date) + ' ' + this.y(0) + ' ';
	d += 'L ' + this.x(data[0].date) + ' ' + this.y(data[0].num) + ' ';
	for (let i = 0; i < lg-1; i += 1) {
		d += 'L ' + this.x(data[i+1].date) + ' ' + this.y(data[i].num) + ' ';
		d += 'L ' + this.x(data[i+1].date) + ' ' + this.y(data[i+1].num) + ' ';
	}
	d += 'L ' + (this.x(data[lg-1].date) + this.ticksWidth) + ' ' + this.y(data[lg-1].num) + ' ';
	if (data[lg-1].num !== 0) {
		d += 'L ' + (this.x(data[lg-1].date) + this.ticksWidth) + ' ' + this.y(0);
	}
	return d;
}

activityIndex.fn.updateGraph = function(tempData) {
	var that = this;
	this.clearHoverLine();
	this.ticksWidth = this.width/tempData.length;
	this.linePath.transition()
				.duration(this.drawPathInterval)
				.attrTween('d', pathTween);

	function pathTween() {
		var interpolate = d3.scale.quantile()
							.domain([0,1])
							.range(d3.range(1, tempData.length+1));
		return function(t) {
			return that.myLineDrawer(tempData.slice(0, interpolate(t)));
		}
	};
};

activityIndex.fn.processData = function(dateDict, keepData) {

	if (Object.keys(dateDict).length === 0) {
		this.clearIndex();
		return
	}
	if (!this.sourceDict || keepData) {
		this.sourceDict = dateDict;
	}

	let tempData = this.initData(dateDict);

	let tickNum = tempData.length;
	let xDomain;

	function getDistDate(date, dist) {
		var someDate = new Date(date);
		someDate.setDate(someDate.getDate() + dist);
		return someDate;
	}

	if (tickNum > 2) {

		xDomain = [getDistDate(tempData[0].date, -5), getDistDate(tempData[tickNum-1].date, 5)];
	} else {
		let yearPrevious = getDistDate(tempData[0].date, -30);
		let yearAfter = getDistDate(tempData[tickNum-1].date, 60);
		xDomain = [yearPrevious, yearAfter];
	}
	
	let	maxVal = 0;

	tempData.forEach(function(d) {
		if (d.num > maxVal) {
			maxVal = d.num;
		}
	})

	this.updateXDomain(xDomain);
	this.updateYDomain([0, maxVal]);

	let fullMonthData = this.getFullDate(tempData);

	if (fullMonthData.length === 0) {
		this.clearIndex();
	} else {
		this.updateGraph(fullMonthData);
	}

};

activityIndex.fn.getFullDate = function(tempData) {

	var oneDay = d3.map(tempData, function(d) {
		return d.date;
	})

	let res = this.x.ticks(d3.time.day).map(function(bucket) {
		return oneDay.get(bucket) || {date: bucket, num : 0};
	})
	return res;
}

activityIndex.fn.initData = function(dateDict) {
	var tempData;

	tempData = this.formatDataArr(dateDict);
	tempData.sort(function(a, b) {
		return a.date - b.date;
	});
	return tempData;
}

activityIndex.fn.showHoverLine = function(dateDict) {
	let tempData = this.initData(dateDict);

	// let fullMonthData = this.getFullDate(tempData);
	// this.hoverPath.attr('d', '');
	let that = this;

	this.hoverRectPane.selectAll('rect')
										.data(tempData)
										.enter()
										.append('rect')
										.attr('x', function(d) {
											let dm = that.x.domain();
											if (d.date < dm[0] || d.date > dm[1]) {
												return 0;
											} else {
												return that.x(d.date);
											}
											return xp;
										})
										.attr('y', function(d) {
											return that.y(d.num);
										})
										.attr('fill', '#F08080')
										.attr('width', this.ticksWidth)
										.attr('height', function(d) {
											return that.y(0) - that.y(d.num);
										})
}

activityIndex.fn.clearHoverLine = function() {
	this.hoverRectPane.selectAll('rect').remove();
}

activityIndex.fn.receiveExtent = function(extent) {
	this.brush.extent(extent);
	this.brushPane.transition().duration(100).call(this.brush);
}

activityIndex.fn.formatDataArr = function(dateDict) {
	var tempDateDict = {};
	var arr = [];
	var originDate, tempVal;
	function normData(oneDate) {

		let res = '';
		let year = oneDate.substring(0, 4);
		let month = oneDate.substring(4, 6);
		let day = oneDate.substring(6, 8);
		if (year) {
			res += year
		} else {
			res += '2015'
		}
		if (month) {
			res += month
		} else {
			res += '01'
		}
		if (day) {
			res += day
		} else {
			res += '01'
		}
		return res;
	}

	for (let oneTitle in dateDict) {
		originDate = normData(oneTitle);
		if (originDate === '') {
			continue
		}
		if (tempDateDict.hasOwnProperty(originDate)) {
			tempDateDict[originDate] += dateDict[oneTitle];
		} else {
			tempDateDict[originDate] = dateDict[oneTitle];
		}
	}


	for (let oneDate in tempDateDict) {
		tempVal = tempDateDict[oneDate];
		
		arr.push({
			date: this.dateParser(oneDate),
			num: tempVal
		})
	}

	return arr;
}  

activityIndex.fn.updateTitleInfo = function(info) {
	this.titleInfo.text(info);
}

activityIndex.fn.returnOriginalPath = function() {
	if (this.sourceDict) {
		this.processData(this.sourceDict);
	}
	this.updateTitleInfo('');
}


activityIndex.fn.clearIndex = function() {
	this.linePath.attr('d', '');
	this.clearBrush();
	if (this.clearCallback) {
		this.clearCallback();
	}
}

