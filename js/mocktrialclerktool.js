/******************\
|    Mock Trial    |
|    Clerk Tool    |
| @author Anthony  |
| @version 0.1     |
| @date 2015/01/08 |
| @edit 2015/01/08 |
\******************/

var MTClerkTool = (function() {
    /**********
     * config */

    /*************
     * constants */

    /*********************
     * working variables */
    var timers;

    /******************
     * work functions */
    function initMTClerkTool() {
        timers = [];
        timers.push(
            new Timer(61, function(self) {
                $s('#time').innerHTML = self.format();
            })
        );
        timers[0].countDown();
        testTimer(5);
        testTimer(10);
        testTimer(60);
    }

    function testTimer(g) { //g is goal in seconds
        var start = +new Date();
        var tmr = new Timer(g, (function(s) {
            return function(self) {
                if (self.timeLeft === 0) {
                    var actual = ((+new Date())-s)/1000;
                    console.log(
                        'Goal: '+g+'s; '+'Actual: '+actual
                    );
                }
            };
        })(start));
        tmr.countDown();
    }

    /***********
     * objects */
    function Timer(t, f) {
        this.timeLeft = t+1;
        this.func = f || false;
    }
    Timer.prototype.countDown = function() {
        var self = this;
        if (this.timeLeft > 0) {
            this.timeLeft -= 1;
            if (this.func) this.func(self);
            setTimeout(function() {
                self.countDown();
            }, 1000);
        }
    };
    Timer.prototype.format = function() {
        var m = Math.floor(this.timeLeft/60);
        var s = this.timeLeft-60*m;
        return forceLen(m+'', '0', 2, true)+':'+forceLen(s+'', '0', 2, true);
    };

    /********************
     * helper functions */
    function $s(id) { //for convenience
        if (id.charAt(0) !== '#') return false;
        return document.getElementById(id.substring(1));
    }
    function getRandInt(low, high) { //output is in [low, high)
        return Math.floor(low + Math.random()*(high-low));
    }
    function forceLen(str, padding, len, padFront) {
        if (str.length > len) return;
        var ret = str;
        for (var ai = 0; ai < len - str.length; ai++) {
            if (padFront) ret = padding+ret;
            else ret = ret+padding;
        }
        return ret;
    }
    function round(n, places) {
        var mult = Math.pow(10, places);
        return Math.round(mult*n)/mult;
    }

    return {
        init: initMTClerkTool
    };
})();

window.addEventListener('load', function() {
    MTClerkTool.init();
});