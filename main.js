"use strict";

//var fps = 30;
var fps = 1;
var spf = 1 / fps;
function svg(elem) {
    var funcs;
    var objectElem;
    var canvasElem;
    var contentDocument;
    var timeUpdate = $.noop;

    function onFrame(callback) {
        if(callback === null) {
            callback = $.noop;
        }
        timeUpdate = callback;
        return funcs;
    }

    var loadingDeferred = null;;
    function setURL(imgURL) {
        loadingDeferred = $.Deferred();
        objectElem.on("load", function() {
            loaded(imgURL);
        }).on("error", function() {
            console.error("Couldn't load \"" + imgURL + "\"");
            loadingDeferred.reject();
        }).attr("data", imgURL);
        return loadingDeferred.promise();
    }

    function playAnimation() {
        return showAnimation();
    }
    
    function stopAnimation() {
        playing = false;
    }
    
    function encodeAnimation() {
        return renderAnimation();
    }

    function loaded(imgURL) {
        contentDocument = objectElem.get(0).contentDocument;
        var scriptURL = imgURL.replace('.svg', '.js');
        $('<script></script>')
                .insertAfter(objectElem)
                .on('load', scriptLoaded)
                .attr('src', scriptURL);
    }
    var encoder = null;
    var svgDocument = null;
    var frameFunction = null;
    var time = null;
    function scriptLoaded(evt) {
        if($(this).data().hasOwnProperty('_READY_FN') && 
                $(this).data().hasOwnProperty('_FRAME_FN')) {
            
            svgDocument = objectElem.get(0).contentDocument;
            frameFunction = $(this).data()._FRAME_FN;
            time = 0;
            loadingDeferred.resolve($(this).data()._READY_FN(svgDocument));
        } else {
            loadingDeferred.resolve(null);
        }
    }
    
    var renderDeferred = null;
    function renderAnimation() {
        renderDeferred = $.Deferred();
        encoder = new Whammy.Video(fps);
        renderFrame();
        return renderDeferred.promise();
    }
    
    function renderFrame() {
        timeUpdate(time);
        if(!frameFunction(svgDocument, time)) {
            time += spf;
            var svgText = objectElem.get(0).contentDocument.documentElement.outerHTML;
            var data = btoa(svgText);
            var imgElem = $('<img style=\'display:none;\'/>').insertAfter(objectElem).on('load', function(evt) {
                var img = imgElem.get(0);
                var canvas = canvasElem.get(0);
                canvas.width = img.width;
                canvas.height = img.height;
                var ctx = canvas.getContext("2d");
                ctx.drawImage(img, 0, 0);
                encoder.add(canvas);
                imgElem.remove();
                renderFrame();
            }).attr('src', 'data:image/svg+xml;base64,' + data);
        } else {
            encoder.compile(false, function(output){
                var url = window.URL.createObjectURL(output);
                $('<video src="'+url+'" controls></video>')
                        .insertAfter(objectElem);
                renderDeferred.resolve(url);
            });
        }
    }
    
    var playDeferred = null;
    var playing = false;
    var firstTimestamp = null;
    function showAnimation() {
        playDeferred = $.Deferred();
        playing = true;
        firstTimestamp = null;
        window.requestAnimationFrame(showFrame);
        return playDeferred.promise();
    }
    
    function showFrame(timestamp) {
        if(firstTimestamp === null) {
            firstTimestamp = timestamp;
            window.requestAnimationFrame(showFrame);
        } else {
            timeUpdate(time);
            if(playing && !frameFunction(svgDocument, time)) {
                time = ((timestamp - firstTimestamp) / 1000);
                window.requestAnimationFrame(showFrame);
            } else {
                playDeferred.resolve();
            }
        }
    }
    
    function gotoTime(time) {
        timeUpdate(time);
        frameFunction(svgDocument, time);
    }

    funcs = {
        setURL: setURL,
        playAnimation: playAnimation,
        stopAnimation: stopAnimation,
        encodeAnimation: encodeAnimation,
        gotoTime: gotoTime,
        onFrame: onFrame
    };

    $(elem)
            .append(objectElem = $('<object type=\'image/svg+xml\'>SVG not supported</object>'))
            .append(canvasElem = $('<canvas style=\'display:none;\'></canvas>'))
            .data(funcs);

    return funcs;
}

var animatorElem = $('div.image');
var animator = svg(animatorElem.get(0));

var prevBtn = $('#prev-btn');
var nextBtn = $('#next-btn');
var playBtn = $('#play-btn');
var stopBtn = $('#stop-btn').attr('disabled', true);
var encodeBtn = $('#encode-btn');
var timeControl = $('#time-control');
var timeControlText = $('#time-control-text');

function play() {
    prevBtn.attr('disabled', true);
    nextBtn.attr('disabled', true);
    playBtn.attr('disabled', true);
    stopBtn.removeAttr('disabled');
    encodeBtn.attr('disabled', true);
    timeControl.attr('disabled', true);
    //timeControlText.attr('disabled', true);
    animator.playAnimation()
            .done(function() {
                prevBtn.removeAttr('disabled');
                nextBtn.removeAttr('disabled');
                playBtn.removeAttr('disabled');
                stopBtn.attr('disabled', true);
                encodeBtn.removeAttr('disabled');
                timeControl.removeAttr('disabled');
                //timeControlText.removeAttr('disabled');
            });
}

function stop() {
    animator.stopAnimation();
}

function encode() {
    prevBtn.attr('disabled', true);
    nextBtn.attr('disabled', true);
    playBtn.attr('disabled', true);
    encodeBtn.attr('disabled', true);
    timeControl.attr('disabled', true);
    //timeControlText.attr('disabled', true);
    animator.encodeAnimation()
            .done(function() {
                prevBtn.removeAttr('disabled');
                nextBtn.removeAttr('disabled');
                playBtn.removeAttr('disabled');
                encodeBtn.removeAttr('disabled');
                timeControl.removeAttr('disabled');
                //timeControlText.removeAttr('disabled');
            });
}

function timeUpdate(time) {
    timeControl.val(time);
    updateTimeText();
}

function gotoTime(time) {
    animator.gotoTime(time);
}

function updateTimeSlider() {
    timeControl.val(timeControlText.val());
}

function updateTimeText() {
    timeControlText.val(timeControl.val());
}

playBtn.on('click', play);
stopBtn.on('click', stop);
encodeBtn.on('click', encode);
timeControl.on('input', function() {
    gotoTime(timeControl.val());
});
prevBtn.on('click', function() {
    timeControl.val(Number(timeControl.val()) - spf);
    gotoTime(timeControl.val());
});
nextBtn.on('click', function() {
    timeControl.val(Number(timeControl.val()) + spf);
    gotoTime(timeControl.val());
});

animator.onFrame(timeUpdate).setURL(animatorElem.data('url')).done(function(animDetails) {
    timeControl.attr('min', animDetails.start);
    timeControlText.attr('min', animDetails.start);
    timeControl.attr('max', animDetails.end);
    timeControlText.attr('max', animDetails.end);
    timeControl.attr('step', spf);
    timeControlText.attr('step', spf);
    
    gotoTime(0);
});