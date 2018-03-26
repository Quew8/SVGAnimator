var selfTag = document.currentScript;
(function() {
    function setRotation(targetElem, to, aboutElem) {
        if(aboutElem === null) {
            aboutElem = targetElem;
        }
        var bb = aboutElem.getBBox();
        var centreX = bb.x + (bb.width / 2);
        var centreY = bb.y + (bb.height / 2);
        targetElem.setAttribute('transform', 'rotate(' + to + ' ' + centreX + ' ' + centreY + ')');
    };
    
    var speed = 1;
    var endTime = (12 * 60 * 60);
    
    var clockFace = null;
    var secondClockFace = null;
    var hourHand = null;
    var minuteHand = null;
    var secondHand = null;
    function ready(d) {
        clockFace = d.getElementById('clock-face');
        secondClockFace = d.getElementById('second-clock-face');
        hourHand = d.getElementById('hour-hand');
        minuteHand = d.getElementById('minute-hand');
        secondHand = d.getElementById('second-hand');
        return {
            start: 0,
            end: endTime / speed
        };
    }
    
    function frame(d, time) {
        time = time * speed;
        var seconds = time % 60;
        var minutes = ((time - seconds) / 60) % 60;
        var hours = (time - seconds - (minutes * 60)) / (60 * 60);
        
        hours += (minutes / 60.0);
        
        setRotation(secondHand, seconds*6, secondClockFace);
        setRotation(minuteHand, minutes*6, clockFace);
        setRotation(hourHand, hours*30, clockFace);
        
        return time >= endTime;
    }
    
    $(selfTag).data('_READY_FN', ready);
    $(selfTag).data('_FRAME_FN', frame);
})();
