/******************\
|    Mock Trial    |
|    Clerk Tool    |
| @author Anthony  |
| @version 1.0     |
| @date 2015/01/08 |
| @edit 2015/01/08 |
\******************/

var MTClerkTool = (function() {
    /**********
     * config */
    var calibTime = 5; //seconds spent calibrating
    var timerDefns = [
        [4*60, 'Def-Pret Stmt'],
        [4*60, 'Pro-Pret Stmt'],
        [2*60, 'Def-Pret Rbtl'],
        [2*60, 'Pro-Pret Rbtl'],

        [9*60, 'Pro-Opng/Clsn'],
        [9*60, 'Def-Opng/Clsn'],

        [14*60, 'Pro-Direct'],
        [10*60, 'Def-Cross'],
        [14*60, 'Def-Direct'],
        [10*60, 'Pro-Cross'],

        [1*60, 'Pro-Clsn Rbtl'],
        [1*60, 'Def-Clsn Rbtl']
    ];
    var gapLen = 3000; //ms gap inserted halfway when testing the timer

    /*************
     * constants */

    /*********************
     * working variables */
    var timers;
    var calibratedDelay;

    /******************
     * work functions */
    function initMTClerkTool() {
        //populate the select
        for (var ti = 0; ti < timerDefns.length; ti++) {
            var option = document.createElement('option');
            option.value = ti;
            option.innerHTML = timerDefns[ti][1];
            $s('#section').appendChild(option);
        }

        //calibrate the timers
        testTimer(calibTime, function(g, a) {
            var errPerSec = (a-g)/g;
            calibratedDelay = Math.floor(1000*(1-errPerSec));

            //clear "calibrating..."
            $s('#controls').removeChild($s('#calib-notice'));

            //init timers
            timers = [];
            for (var ti = 0; ti < timerDefns.length; ti++) {
                //the html
                var div = document.createElement('div');
                div.id = 'timer'+ti;
                div.className = 'timer';
                div.innerHTML = '<div>'+timerDefns[ti][1]+'</div>'+
                    '<input id="time'+ti+
                    '" type="button" value="00:00">';
                $s('#container').appendChild(div);

                //the js
                timers.push(
                    new Timer(timerDefns[ti][0], calibratedDelay,
                        (function(idx) {
                            return function(self) {
                                $s('#time'+idx).value = self.format();
                            };
                        })(ti)
                    )
                );

                //user control
                $s('#time'+ti).addEventListener('click', (function(idx) {
                    return function() {
                        var cns = $s('#time'+idx).className;
                        if (cns.indexOf('unlocked') !== -1) {
                            $s('#time'+idx).className = 'locked';
                        } else {
                            $s('#time'+idx).className = 'unlocked';
                        }
                        timers[idx].startStop();
                    };
                })(ti));
            }

            //timer control
            $s('#set-time-btn').addEventListener('click', function() {
                var m = parseInt($s('#min').value || 0);
                if (m >= 100) { //reset condition
                    //reset all the times
                    for (var ti = 0; ti < timerDefns.length; ti++) {
                        timers[ti].timeLeft = timerDefns[ti][0];
                        $s('#time'+ti).value = timers[ti].format();
                    }
                } else {
                    var s = parseInt($s('#sec').value || 0);
                    var numSec = 60*m + s;
                    if (numSec < 0 || numSec === undefined) numSec = 0;
                    var idx = parseInt($s('#section').value);
                    timers[idx].timeLeft = numSec;
                    $s('#time'+idx).value = timers[idx].format();
                }
            });

            //tests
            testTimer(5);
            testTimer(10);
            testTimer(60);
        });
    }

    function testTimer(g, callback) { //g is goal in seconds
        callback = callback || false;

        var start = +new Date();
        var tmr = new Timer(g, 1000, (function(s) {
            return function(self) {
                if (self.timeLeft === 0) {
                    var actual = ((+new Date())-s)/1000 - gapLen/1000;
                    if (callback) callback(g, actual);
                    else {
                        console.log(
                            'Goal: '+g+'s; '+'Actual: '+actual
                        );
                    }
                }
            };
        })(start));
        tmr.startStop();

        setTimeout(function() {
            tmr.startStop();
            setTimeout(function() {
                tmr.startStop();
            }, gapLen);
        }, g/(2+0.3*Math.random()));
    }

    /***********
     * objects */
    function Timer(t, d, f) {
        this.timeLeft = t;
        this.delay = d || 1000;
        this.func = f || false;
        this.locked = true;
        this.secBeganAt = -1;
        this.lockedAt = -1;

        var self = this;
        this.func(self); //first function call
    }
    Timer.prototype.startStop = function() {
        var self = this;
        if (this.locked) { //stopped? then start it
            this.timeLeft += 1;
            this.locked = false;
            self.countDown(this.delay - (this.lockedAt - this.secBeganAt));
        } else { //currently counting down? stop it
            this.locked = true;
            this.lockedAt = +new Date();
        }
    };
    Timer.prototype.countDown = function(delay) {
        delay = delay || this.delay;

        var self = this;
        if (this.timeLeft > 0 && !this.locked) {
            this.secBeganAt = +new Date();
            this.timeLeft -= 1;
            var funStart = +new Date();
            if (this.func) this.func(self);
            var funEnd = +new Date();
            setTimeout(function() {
                self.countDown();
            }, delay - (funEnd - funStart));
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

window.addEventListener('beforeunload', function(e) {
    var message = 'Are you sure you want to exit this timer page? '+
        'All times will be erased.';
    e = e || window.event;
    if (e) {
        e.returnValue = message;
    }
    return message;
});