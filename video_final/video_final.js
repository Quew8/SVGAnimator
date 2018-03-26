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
    
    function setOpacity(targetElem, to) {
        targetElem.setAttribute('opacity', to);
    }

    function wrapElem(d, elem) {
        var parent = elem.parentNode;
        var g = d.createElement('g');
        parent.insertBefore(g, elem);
        parent.removeChild(elem);
        g.appendChild(elem);
        return g;
    }
    
    function linear(time, start, end) {
        if(time <= start) {
            return 0;
        } else if(time >= end) {
            return 1;
        } else {
            return (time - start) / (end - start);
        }
    }
    
    var speed = 600;
    var endTime = 5;
    
    var gear1 = null;
    var gear2 = null;
    var gear3 = null;
    var gear4 = null;
    var gear5 = null;
    var gear6 = null;
    var title = null;
    var byline = null;
    function ready(d) {
        gear1 = d.getElementById('gear1');
        gear2 = d.getElementById('gear2');
        gear3 = d.getElementById('gear3');
        gear4 = d.getElementById('gear4');
        gear5 = d.getElementById('gear5');
        gear6 = d.getElementById('gear6');
        title = d.getElementById('title');
        byline = d.getElementById('byline');
        return {
            start: 0,
            end: endTime
        };
    }
    
    function frame(d, time) {
        setRotation(gear1, time * speed * (1/20), null);
        setRotation(gear2, time * speed * -(1/15), null);
        setRotation(gear3, time * speed * (1/10), null);
        setRotation(gear4, time * speed * -(1/10), null);
        setRotation(gear5, time * speed * (1/15), null);
        setRotation(gear6, time * speed * -(1/10), null);
        setOpacity(title, linear(time, 0.5, 4));
        setOpacity(byline, linear(time, 0.5, 4));
        return time >= endTime;
    }
    
    $(selfTag).data('_READY_FN', ready);
    $(selfTag).data('_FRAME_FN', frame);
})();