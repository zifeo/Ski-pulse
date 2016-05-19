var currentWeather = null;

var initialDate = new Date("2015-12-28T06:00:00.000+01:00");
var currentDate = initialDate;

var currentTimeForDate;

$(function () {
	
	function ticketDay() {
		return ds.ticketing.filter(function(x) {
			var d = new Date(x[0].start)
			return d.getDay() == currentDate.getDay() && d.getMonth() == currentDate.getMonth();
		})[0];
	}
				
	function refresh(station) {
		
		//console.log("refresh for "+station);
		
		if (station == null) {
		    hydrateStats(ds.stations);
		} else {
		    hydrateStats(ds.stations.filter(function(x) {
			    return x.name == station;
		    }));
		}
		
		var hist = new Array(45).fill(0);
	    ticketDay().forEach(function(s) {
		    //console.log(s)
		    if (station == null || s.station == station) {
				for (var i = 0; i < 90; ++i) {
		    		hist[i / 2] += i < s.entries.length ? s.entries[i]: 0;
	    		}
	    	}
	    });
	    
	    $('#hist').empty();
		Plotly.newPlot('hist', [{
		    y: hist,
		    type: 'bar'
		  }], {
			margin: {
		    l: 40,
		    r: 0,
		    b: 9,
		    t: 0,
		    pad: 4
		  },
		}, {
			staticPlot: true
		});

	}

    function load(url) {
        var ret;
        $.ajaxSetup({
            async: false
        });
        $.getJSON(url, function (data) {
            ret = data;
        });
        $.ajaxSetup({
            async: false
        });
        return ret;
    }

    var ds = load('js/ds.json');
    refresh(null);

    
    function hydrateStats(arr) {
    	var vdist = arr
		    .map(function(a) {
			    return a.deniv;
			})
			.reduce(function(a, b) {
			    return a + b;
		    });
		var hdist = arr
		    .map(function(a) {
			    return a.length;
			})
			.reduce(function(a, b) {
			    return a + b;
		    });
		var capa = arr
		    .map(function(a) {
			    return a.capacity;
			})
			.reduce(function(a, b) {
			    return a + b;
		    });
		var flow = arr
		    .map(function(a) {
			    return a.flow;
			})
			.reduce(function(a, b) {
			    return a + b;
		    });
		$('#vdist').html(vdist);
		$('#hdist').html(hdist);
		$('#capa').html(capa);
		$('#flow').html(flow);
    }
    
    $('#calendar').calendar({
        type: 'date',
        inline: true,
        firstDayOfWeek: 1,
        initialDate: initialDate,
        minDate: new Date("2015-11-30T06:00:00.000+01:00"),
        maxDate: new Date("2016-04-23T20:50:00.000+02:00"),
        onChange: function (date) {
            currentDate = date;
            frame = 0;
            d3.select("g").remove();
            loadDate();
            refresh();
            updateWeather();
        }
    });


    function getDateString( date ) {
        var dateJSON = date.toJSON();
        return dateJSON.substr(0, dateJSON.indexOf("T"));
    }

    function getTimeString( date ) {
        var dateJSON = date.toJSON();
        return dateJSON.substr(dateJSON.indexOf("T") + 1, dateJSON.indexOf("."))
    }

    function toCelcius(far){
        return (far-32)*5/9;
    }

    function updateWeather() {
        function updateCurrentWeather() {
            function isCloseTo(date1, date2) {
                var diff = Math.abs(date1.getTime()*1000 - date2.getTime());
                return diff < 30 * 60 * 1000;
            }
            function getWeatherForHour(allDayWeather, time) {
                if (isCloseTo(new Date(allDayWeather.currently.time), time)){
                    return allDayWeather.currently
                }
                else{
                    var last = null;
                    var res = null;
                    $.each(allDayWeather.hourly.data, function (key, val) {
                        last = val;
                        if (isCloseTo(new Date(val.time), time)){
                            res = val
                        }
                    });
                    if (res != null) {
                        return res
                    }
                    return last;
                }
            }
            $.getJSON( "weather/weather.json", function( data ) {
                var currentDateString = getDateString(currentDate);
                //var currentTimeString = getTimeString(currentDate);
                $.each( data, function( key, val ) {
                    if (key == currentDateString) {
                        currentWeather = getWeatherForHour(val, currentDate);
                    }
                });
            });
            updateWeatherInfos();
        }

        function updateWeatherInfos() {
            var clear = {name:"clear-day", src:"./weather/icons/sunny.png"};
            var clearnight = {name:"clear-night", src:"./weather/icons/full moon.png"};
            var rain = {name:"rain", src:"./weather/icons/heavy rain.png"};
            var snow = {name:"snow", src:"./weather/icons/snowy.png"};
            var sleet = {name:"sleet", src:"./weather/icons/snowy.png"};
            var wind = {name:"wind", src:"./weather/icons/windy.png"};
            var fog = {name:"fog", src:"./weather/icons/fog.png"};
            var cloudy = {name:"cloudy", src:"./weather/icons/cloudy.png"};
            var partlyCloudyDay = {name:"partly-cloudy-day", src:"./weather/icons/sunny to cloudy.png"};
            var partlyCloudyNight = {name:"partly-cloudy-night", src:"./weather/icons/overcast.png"};
            var unknowSrc = "./weather/icons/unknown.png";

            var map = [
                clear, clearnight, rain, snow, sleet, wind, fog, cloudy, partlyCloudyDay, partlyCloudyNight
            ];
            var current = currentWeather.icon;
            var found = false;
            $.each(map, function (idx, elem) {
                if (elem.name == current) {
                    $('#weatherimage').attr("src", elem.src);
                    $('#weathersummary').html(currentWeather.summary);
                    $('#weathermeta').html("As seen at " + new Date(currentWeather.time*1000) + ".");
                    $('#weathertemp').html(parseInt(toCelcius(currentWeather.temperature)) + "°");
                    found = true;
                }
            });
            if (!found) {
                $('#weatherimage').attr("src", unknowSrc);
                $('#weathersummary').html("Pas d'informations météorologique");
            }
        }

        updateCurrentWeather();
    }

    updateWeather();

    // max capacity in 10 min
    var data_max = 460;
    var color = ["#00FF00", "#FFCC66", "#FF0000"];

    var play = false;

    // Animation
    var anim;

    var minToSimTime = 150;
    var msPerFrame = 4 * minToSimTime;
    var msPerData = 10 * minToSimTime;
    var dataPerFrame = msPerFrame / msPerData;
    var maxData = (15 * 6);
    var maxFrame = maxData / dataPerFrame;

    // Init SVG window
    svg_width = $(window).width();
    svg_height = $(window).height() - 350;
    image_width = 2976;
    image_height = 1500;
    ratio = 1;

    // needed for visualization
    var visu_rmt;
    var flow;
    var flowData = [];
    var passagePerRmt;

    function loadDate() {
        // Data
        var rmt_data = [];
        var rmt = 30;
        passagePerRmt = ticketDay();
        
        passagePerRmt.sort(function (a, b) {
            if (a.station > b.station)
                return 1;
            if (a.station < b.station)
                return -1;
            // a doit être égale à b
            return 0;
        });
        
        var ratio2 = svg_height / image_height;

        var zoomBehaviour = d3.behavior.zoom().scaleExtent([ratio2, 8]).on("zoom", zoom);

        var svg = d3.select("svg")
            .attr("width", svg_width)
            .attr("height", svg_height)
            .append("g")
            .call(zoomBehaviour)
            .append("g")
            .attr("id", "end");

        svg.append('image')
            .attr("xlink:href", "img/domaine_verbier.jpg")
            .attr("x", 0)
            .attr("y", 0)
            .attr("width", image_width)
            .attr("height", image_height);

        svg.append("rect")
            .attr("class", "overlay")
            .attr("width", image_width)
            .attr("height", image_height);


        function zoom() {
            svg.attr("transform", function () {
                t = d3.event.translate;
                s = d3.event.scale;

                if (image_width * s >= svg_width) {
                    if (t[0] < 0 && t[0] + image_width * s < svg_width)
                        t[0] = svg_width - image_width * s;
                    if (t[0] > 0) {
                        t[0] = 0;
                    }
                } else {
                    if (t[0] < 0)
                        t[0] = 0;
                    else if (t[0] + image_width * s > svg_width)
                        t[0] = svg_width - image_width * s;
                }

                if (image_height * s >= svg_height) {
                    if (t[1] < 0 && t[1] + image_height * s < svg_height)
                        t[1] = svg_height - image_height * s;
                    if (t[1] > 0) {
                        t[1] = 0;
                    }
                } else {
                    if (t[1] < 0)
                        t[1] = 0;
                    else if (t[1] + image_height * s > svg_height)
                        t[1] = svg_height - image_height * s;
                }

                zoomBehaviour.translate(t);

                return "translate(" + t + ")scale(" + s + ")";
            });
        }

        visu_rmt = svg.selectAll("cirlce#rmt");
        flow = svg.selectAll("cirlce#flow");

        // Init ski lift
        $.ajax({
            url: "../datasets/positions_remontees.rmt"
        }).done(function (response) {
            var lines = response.split("\n");
            lines.forEach(function (line) {
                line = line.split(" ");
                rmt_start = {
                    name: line[1],
                    type: "start",
                    delay: ((60 * line[6] / line[7]) * minToSimTime / msPerFrame),
                    x: Number(line[2]),
                    y: Number(line[3]),
                    x_end: Number(line[4]),
                    y_end: Number(line[5])
                };
                rmt_stop = {
                    name: line[1],
                    type: "stop",
                    delay: (60 * line[6] / line[7] * minToSimTime / msPerFrame),
                    x: Number(line[4]),
                    y: Number(line[5])
                };
                rmt_data.push(rmt_start);
                rmt_data.push(rmt_stop);
            });
            rmt_data.sort(function (a, b) {
                if (a.name > b.name)
                    return 1;
                if (a.name < b.name)
                    return -1;
                // a doit être égale à b
                return 0;
            });

            // Init rmt
            visu_rmt = visu_rmt.data(rmt_data).enter().append("circle")
                .attr("id", "rmt")
                .attr("cx", function (d) {
                    return d.x * ratio;
                })
                .attr("cy", function (d) {
                    return d.y * ratio;
                }).attr({
                  stroke: "black",
                })
                .attr("r", function (d) {
                    return 10;
                });

            d3.selectAll("circle#rmt")
                .on("click", setStation);

        });

        next_time(msPerFrame, 1);
    }

    var prec;
    function setStation(d, i) {
        refresh(d.name);
    }

    function next_time(msPerFrame, frame) {
        var size = [];

        currentTimeForDate = frame * msPerFrame / minToSimTime / 60 + 6;
        currentDate.setHours(parseInt(currentTimeForDate));
        updateWeather();

        var tmp = frame * 900 / maxFrame;

        if (play) {
            $("#timeline").data("ionRangeSlider").update({
                min: 0,
                max: 880,
                from: tmp / 20
            });
        }
        visu_rmt.transition()
            .duration(msPerFrame)
            .attr("r", function (d, i) {
                size.push(0);

                passage = passagePerRmt[Math.floor(i / 2)].entries;
                var index;

                if (d.type == "start") {
                    index = Math.floor(frame * dataPerFrame);
                    if (frame + d.delay < maxFrame && passage[index] != 0) {
                        var newFlowData = {
                            x: d.x,
                            y: d.y,
                            x_end: d.x_end,
                            y_end: d.y_end,
                            delay: d.delay,
                            startFrame: frame,
                            endFrame: frame + 1,
                            ind: i
                        };

                        flowData.push(newFlowData);
                    }

                } else {
                    index = Math.floor((frame - d.delay) * dataPerFrame);

                    if ((frame * msPerFrame) % msPerData > d.delay) {
                        index += 1;
                    }

                    if (index < 0) {
                        index = 0;
                    }
                }

                if (index >= passage.length) {
                    return 0;
                }

                if (index > -1) {
                    size[i] = passage[index] * dataPerFrame / (data_max * dataPerFrame);
                }

                return 5 + 40 * size[i];
            })
            .attr("fill", function (d, i) {
                return color[Math.floor(((3 * size[i])))];
            });

        dataflow = flow.data(flowData).enter()
            .append("circle")
            .attr("id", "flow")
            .attr("cx", function (d) {
                return d.x;
            })
            .attr("cy", function (d) {
                return d.y;
            })
            .attr("r", function (d, i) {
                return size[d.ind] * 40;
            })
            .transition()
            .duration(function (d) {
                return msPerFrame;
            })
            .attr("cx", function (d) {
                return d.x_end;
            })
            .attr("cy", function (d) {
                return d.y_end;
            })
            .ease("linear")
            .remove();

        flowData = [];
    }

    $("#timeline").ionRangeSlider({
        grid: true,
        min: 0,
        max: 880,
        step: 20,
        hide_min_max: true,
        hide_from_to: true,
        values: ['06:00', '06:20', '06:40',
            '07:00', '07:20', '07:40',
            '08:00', '08:20', '08:40',
            '09:00', '09:20', '09:40',
            '10:00', '10:20', '10:40',
            '11:00', '11:20', '11:40',
            '12:00', '12:20', '12:40',
            '13:00', '13:20', '13:40',
            '14:00', '14:20', '14:40',
            '15:00', '15:20', '15:40',
            '16:00', '16:20', '16:40',
            '17:00', '17:20', '17:40',
            '18:00', '18:20', '18:40',
            '19:00', '19:20', '19:40',
            '20:00', '20:20', '20:40'],
        onChange: function (value) {
            var tmp =  20 * value.from;
            frame = tmp * minToSimTime / msPerFrame;
            next_time(msPerFrame, frame);
        }
    });

    var frame = 0;

    $("#playButton").click(function (e) {
        play = true;
        anim = setInterval(function () {
            next_time(msPerFrame, frame);
            frame++;
            if (frame >= maxFrame) {
                frame = 0;
            }
        }, msPerFrame);
    });

    $("#pauseButton").click(function (e) {
        play = false;
        clearInterval(anim);
        flow.data(flowData).exit().remove();
    });

    $("#stepFwdButton").click(function (e) {
        frame += Math.floor(20 * minToSimTime / msPerFrame);
        frame %= maxFrame;
        next_time(msPerFrame, frame);
        var tmp = frame * 900 / maxFrame;
        $("#timeline").data("ionRangeSlider").update({
            min: 0,
            max: 880,
            from: tmp / 20
        });
    });

    $("#stepBwdButton").click(function (e) {
        frame -= Math.floor(20 * minToSimTime / msPerFrame);
        frame = frame < 0 ? 0 : frame;
        next_time(msPerFrame, frame);
        var tmp = frame * 900 / maxFrame;

        $("#timeline").data("ionRangeSlider").update({
            min: 0,
            max: 880,
            from: tmp / 20
        });
    });

    $("#dayBwdButton").click(function (e) {
        currentDate.setDate(currentDate.getDate() - 1);
        $('#calendar').calendar('set date', currentDate);

        $("#timeline").data("ionRangeSlider").update({
            min: 0,
            max: 880,
            from: 0
        });
        frame = 0;
        next_time(msPerFrame, frame);
    });

    $("#dayFwdButton").click(function (e) {
        currentDate.setDate(currentDate.getDate() + 1);
        $('#calendar').calendar('set date', currentDate);

        $("#timeline").data("ionRangeSlider").update({
            min: 0,
            max: 880,
            from: 0
        });
        frame = 0;
        next_time(msPerFrame, frame);
    });

    loadDate();
});

