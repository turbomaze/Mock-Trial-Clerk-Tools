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
        //init timers
        timers = [];
        timers.push(
            new Timer(61, function(self) {
                $s('#time').innerHTML = self.format();
            })
        );
        timers[0].start();

        //user control
        $s('#start').addEventListener('click', function() {
            timers[0].start();
        });
        $s('#stop').addEventListener('click', function() {
            timers[0].stop();
        });

        //tests
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
        tmr.start();
    }

    /***********
     * objects */
    function Timer(t, f) {
        this.timeLeft = t;
        this.func = f || false;
        this.locked = true;
    }
    Timer.prototype.start = function() {
        var self = this;
        if (this.locked) { //only if it's currently stopped
            this.timeLeft += 1;
            this.locked = false;
            self.countDown();
        }
    };
    Timer.prototype.countDown = function() {
        var self = this;
        if (this.timeLeft > 0 && !this.locked) {
            this.timeLeft -= 1;
            if (this.func) this.func(self);
            setTimeout(function() {
                self.countDown();
            }, 1000);
        }
    };
    Timer.prototype.stop = function() {
        if (!this.locked) this.locked = true;
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