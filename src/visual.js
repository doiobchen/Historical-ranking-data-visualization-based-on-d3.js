/**
 * @type Jannchie
 * @email jannchie@gmail.com
 * @create date 2018-05-02 13:17:10
 * @modify date 2018-11-29 13:03:59
 * @desc 可视化核心代码
 */

d3.text("has0score.csv").then(function(csvString){
    var data = d3.csvParse(csvString);
    try {
        draw(data);
    } catch (error) {
        alert(error)            
    }
});

function draw(data) {
    console.log(data);
    var time = getDatesList(data); 
    var name_list = getNameList(data);
    var divide_by = config.divide_by;

    var colorRange = d3.interpolateCubehelix("#003AAB", "#01ADFF")
    // 选择颜色
    function getColor(d) {
        var r = 0.00;

        if (d[divide_by] in config.color)
            return config.color[d[divide_by]]
        else {
            return d3.schemeCategory10[Math.floor((d[divide_by].charCodeAt() % 10))]
        }
    }

    var showMessage = config.showMessage;
    var interval_time = config.interval_time;
    var text_y = config.text_y;
    var itemLabel = config.itemLabel;
    var typeLabel = config.typeLabel;
    // 长度小于display_barInfo的bar将不显示barInfo
    var display_barInfo = config.display_barInfo;
    // 显示类型
    if (divide_by != 'name') {
        var use_type_info = true;
    } else {
        var use_type_info = false;
    }
    // 使用计数器
    var use_counter = config.use_counter;
    // 每个数据的间隔日期
    var step = config.step;

    var format = config.format
    var left_margin = config.left_margin;
    var right_margin = config.right_margin;
    var top_margin = config.top_margin;
    var bottom_margin = config.bottom_margin;
    var timeFormat = config.timeFormat
    var item_x = config.item_x;
    var max_number = config.max_number;
    var reverse = config.reverse;
    var text_x = config.text_x;
    var offset = config.offset;
    var animation = config.animation;
    const margin = {
        left: left_margin,
        right: right_margin,
        top: top_margin,
        bottom: bottom_margin
    };

    var enter_from_0 = config.enter_from_0;
    interval_time /= 3;
    var currentdate = time[0].toString();
    var currentData = [];
    var lastname;
    
    
    const svg = d3.select('svg');

    const width = svg.attr('width');
    const height = svg.attr('height');
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom - 32;
    var dateLabel_y = height - margin.top - margin.bottom - 32;;
    const xValue = d => Number(d.value);
    const yValue = d => d.name;

    const g = svg.append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);
    const xAxisG = g.append('g')
        .attr('transform', `translate(0, ${innerHeight})`);
    const yAxisG = g.append('g');

    xAxisG.append('text')
        .attr('class', 'axis-label')
        .attr('x', innerWidth / 2)
        .attr('y', 100);

    var xScale = d3.scaleLinear()
    const yScale = d3.scaleBand()
        .paddingInner(0.3)
        .paddingOuter(0);

    const xTicks = 10;
    const xAxis = d3.axisBottom()
        .scale(xScale)
        .ticks(xTicks)
        .tickPadding(20)
        .tickFormat(d => {
            if (d == 0) {
                return '';
            }
            return d;
        })
        .tickSize(-innerHeight);

    const yAxis = d3.axisLeft()
        .scale(yScale)
        .tickPadding(5)
        .tickSize(-innerWidth);

    var dateLabel = g.insert("text")
        .data(currentdate)
        .attr("class", "dateLabel")
        .attr("x", innerWidth)
        .attr("y", innerHeight).attr("text-anchor", function () {
            return 'end';
        })

        .text(currentdate);

    var topLabel = g.insert("text")
        .attr("class", "topLabel")
        .attr("x", item_x)
        .attr("y", text_y)

    function dataSort() {
        if (reverse) {
            currentData.sort((a, b) => { return (Number(a.value) - Number(b.value)); });
        } else {
            currentData.sort((a, b) => { return (Number(b.value) - Number(a.value)); });
        }
    }

    if (showMessage) {

        // 左1文字
        var topInfo = g.insert("text")
            .attr("class", "growth")
            .attr("x", 0)
            .attr("y", text_y).text(itemLabel);

        // 右1文字
        g.insert("text")
            .attr("class", "growth")
            .attr("x", text_x)
            .attr("y", text_y).text(typeLabel);

        // 榜首日期计数
        if (use_counter == true) {
            var days = g.insert("text")
                .attr("class", "days")
                .attr("x", text_x + offset)
                .attr("y", text_y);
        } else {
            // 显示榜首type
            if (use_type_info == true) {
                var top_type = g.insert("text")
                    .attr("class", "days")
                    .attr("x", text_x + offset)
                    .attr("y", text_y);
            }
        }
    }
    var counter = {
        "value": 1
    };

    function redraw() {

        if (currentData.length == 0) return;
        yScale.domain(currentData.map(d => d.name))
              .range([0, innerHeight]);
        xScale.domain([0, d3.max(currentData, xValue) + 1])
              .range([0, innerWidth]);
        dateLabel.data(currentData).transition().duration(3000 * interval_time).ease(d3.easeLinear).tween(
                "text",
                function (d) {
                    var self = this;
                    var i = d3.interpolateDate(new Date(self.textContent), new Date(d.date))
                    return function (t) {
                        var dateformat = d3.timeFormat(timeFormat)
                        self.textContent = dateformat(i(t));
                    };
        });

        xAxisG.transition().duration(3000 * interval_time).ease(d3.easeLinear).call(xAxis);
        yAxisG.transition().duration(3000 * interval_time).ease(d3.easeLinear).call(yAxis);

        yAxisG.selectAll('.tick').remove();

        var bar = g.selectAll(".bar")
            .data(currentData, function (d) {
                return d.name;
            });

        if (showMessage) {
            // 榜首文字
            topLabel.data(currentData).text(function (d) {
                if (lastname == d.name) {
                    counter.value = counter.value + step;
                } else {
                    counter.value = 1;
                }
                lastname = d.name
                return d.name;
            });


            if (use_counter == true) {
                // 榜首持续时间更新
                days.data(currentData).transition().duration(3000 * interval_time).ease(d3.easeLinear).tween(
                    "text",
                    function (d) {
                        var self = this;
                        var i = d3.interpolate(self.textContent, counter.value),
                            prec = (counter.value + "").split("."),
                            round = (prec.length > 1) ? Math.pow(10, prec[1].length) : 1;
                        return function (t) {
                            self.textContent = d3.format(format)(Math.round(i(t) * round) / round);
                        };
                    });
            } else if (use_type_info == true) {
                // 榜首type更新
                top_type.data(currentData).text(function (d) {
                    return d['type']
                });
            }
        }


        var barEnter = bar.enter().insert("g", ".axis")
            .attr("class", "bar")
            .attr("transform", function (d) {
                return "translate(0," + yScale(yValue(d)) + ")";
            });

        barEnter.append("rect").attr("width",
                function (d) {
                    if (enter_from_0) {
                        return 0;
                    } else {
                        return xScale(currentData[currentData.length - 1].value);
                    }
                }).attr("fill-opacity", 0)
            .attr("height", 80).attr("y", 50)
            .style("fill", d => getColor(d))
            .transition()
            .delay(500 * interval_time)
            .duration(2490 * interval_time)
            .attr("y", 0).attr(
                "width", d =>
                xScale(xValue(d)))
            .attr("fill-opacity", 1);

        barEnter.append("text").attr("y", 50).attr("fill-opacity", 0).style('fill', d => getColor(d)).transition().delay(500 * interval_time).duration(
                2490 * interval_time)
            .attr(
                "fill-opacity", 1).attr("y", 0)
            .attr("class", function (d) {
                return "label "
            })
            .attr("x", -15)
            .attr("y", 20)
            .attr("text-anchor", "end")
            .text(function (d) {
                return d.name;
            })
        // bar上文字
        var barInfo = barEnter.append("text").attr("x",
                function (d) {
                    if (enter_from_0) {
                        return 0;
                    } else {
                        return xScale(currentData[currentData.length - 1].value);
                    }
                })
            .attr("stroke", d => getColor(d))
            .attr("class", function () {
                return "barInfo"
            })
            .attr("y", 50).attr("stroke-width", "0px").attr("fill-opacity",
                0).transition()
            .delay(500 * interval_time).duration(2490 * interval_time).text(
                function (d) {
                    if (use_type_info) {
                        return d[divide_by] + "-" + d.name;
                    }
                    return d.name;
                })
            .attr("x", d => {
                return xScale(xValue(d)) - 10
            }).attr(
                "fill-opacity",
                function (d) {
                    if (xScale(xValue(d)) - 10 < display_barInfo) {
                        return 0;
                    }
                    return 1;
                })
            .attr("y", 2)
            .attr("dy", ".5em")
            .attr("text-anchor", function () {
                return 'end';
            })
            .attr("stroke-width", function (d) {
                if (xScale(xValue(d)) - 10 < display_barInfo) {
                    return "0px";
                }
                return "1px";
            });

        barEnter.append("text").attr("x",
                function () {
                    if (enter_from_0) {
                        return 0;
                    } else {
                        return xScale(currentData[currentData.length - 1].value);
                    }
                }).attr("y", 50).attr("fill-opacity", 0).style('fill', d => getColor(d)).transition()
            .duration(2990 * interval_time).tween(
                "text",
                function (d) {
                    var self = this;
                    var i = d3.interpolate(self.textContent, Number(d.value)),
                        prec = (Number(d.value) + "").split("."),
                        round = (prec.length > 1) ? Math.pow(10, prec[1].length) : 1;
                    return function (t) {
                        self.textContent = d3.format(format)(Math.round(i(t) * round) / round);
                        value = self.textContent
                    };
                }).attr(
                "fill-opacity", 1).attr("y", 0)
            .attr("class", function (d) {
                return "value"
            }).attr("x", d => {
                return xScale(xValue(d)) + 10
            })
            .attr("y", 22)
        


        var barUpdate = bar.transition().duration(2990 * interval_time).ease(d3.easeLinear);

        barUpdate.select("rect").style('fill', d => getColor(d))
            .attr("width", d => xScale(xValue(d)))

        barUpdate.select(".label").attr("class", function (d) {
                return "label ";
            }).style('fill', d => getColor(d))
            .attr("width", d => xScale(xValue(d)))

        barUpdate.select(".value").attr("class", function (d) {
                return "value"
            }).style('fill', d => getColor(d))
            .attr("width", d => xScale(xValue(d)))

        barUpdate.select(".barInfo").attr("stroke", function (d) {
            return getColor(d);
        })

        var barInfo = barUpdate.select(".barInfo")
            .text(
                function (d) {
                    if (use_type_info) {
                        return d[divide_by] + "-" + d.name;
                    }
                    return d.name;
                })
            .attr("x", d => {
                return xScale(xValue(d)) - 10
            })
            .attr(
                "fill-opacity",
                function (d) {
                    if (xScale(xValue(d)) - 10 < display_barInfo) {
                        return 0;
                    }
                    return 1;
                }
            )
            .attr("stroke-width", function (d) {
                if (xScale(xValue(d)) - 10 < display_barInfo) {
                    return "0px";
                }
                return "1px";
            })

        barUpdate.select(".value").tween("text", function (d) {
            var self = this;
            var i = d3.interpolate((self.textContent), Number(d.value)),
                prec = (Number(d.value) + "").split("."),
                round = (prec.length > 1) ? Math.pow(10, prec[1].length) : 1;
            return function (t) {
                self.textContent = d3.format(format)(Math.round(i(t) * round) / round);
                d.value = self.textContent;
            };
        }).duration(2990 * interval_time).attr("x", d => xScale(xValue(d)) + 10)

        var barExit = bar.exit().attr("fill-opacity", 1).transition().duration(2500 * interval_time)

        barExit.attr("transform", function (d) {
                return "translate(0," + "880" + ")";
            })
            .remove().attr("fill-opacity", 0);
        barExit.select("rect").attr("fill-opacity", 0).attr("width", xScale(currentData[currentData.length - 1]["value"]))

        barExit.select(".value").attr("fill-opacity", 0).attr("x", () => {
            return xScale(currentData[currentData.length - 1]["value"]

            )
        })
        barExit.select(".barInfo").attr("fill-opacity", 0).attr("stroke-width", function (d) {
            return "0px";
        }).attr("x", () => {
            return (xScale(currentData[currentData.length - 1]["value"] - 10)

            )
        })
        barExit.select(".label").attr("fill-opacity", 0)
    }


    function change() {
        yScale.domain(currentData.map(d => d.name).reverse())
              .range([innerHeight, 0]);

        g.selectAll(".bar")
            .data(currentData, d => d.name)
            .transition().duration(3000 * update_rate * interval_time)
            .attr("transform", function (d) {
                return "translate(0," + yScale(yValue(d)) + ")";
            })
    }

    var i = 0;
    var update_rate = config.update_rate
    var inter = setInterval(function next() {

        currentdate = time[i];
        currentData = dataOnDate(data, time[i]);
        d3.transition()
            .each(redraw)
            .each(change);
        i++;

        if (i >= time.length) {
            window.clearInterval(inter);
        }

    }, 3000 * interval_time);
};

function getDatesList(data) {
    let dates = [];
    data.forEach(element => {
        if (dates.indexOf(element["date"]) == -1) {
            dates.push(element["date"]);
        }
    });
    dates.sort((x, y) => new Date(x) - new Date(y));
    return dates;
}

function getNameList(data) {
    let nameList = [];

    data.forEach(e => {
        if (nameList.indexOf(e.name) == -1) {
            nameList.push(e.name)
        }
    });
    return nameList;
}

function dataOnDate(data, date) {
    let dataOnDate = [];
    data.forEach(element => {
        if (element["date"] == date) {
            dataOnDate.push(element);
        }
    });
    return dataOnDate;
}
