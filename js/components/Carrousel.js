define(["zepto", "hammer", "style/style", "utils/utils"], function (zepto, Hammer, style, utils) {
    function Carrousel (el, children, options) {
        if (!utils.isMobile()) {
            throw new Error("can not support pc");
        }

        if (!children || children.length < 3) {
            throw new Error("child count must large then 3");
        }

        options = options || {};
        
        this._el = el;
        this._children = children;

        this._translate = 0;
        this._activeIndex = 0;
        this._isTransitioning = false;
        this._transition = {
            duration: options.duration || 500
        };

        this._direction = 0;

        this._hammer = null;

        this._listeners = null;

        this._dom = this._initDom();
        this._initDomEvents();

        this.active(0, false);
    }

    Carrousel.prototype.setTransitionDuration = function (duration) {
        this._transition.duration = duration || 300;
    };

    Carrousel.prototype._initDom = function () {
        var $el = zepto(this._el);
        
        var ulStyle = {
            position: "relative",
            width: "100%",
            height: "100%"
        };

        var $ul = zepto("<ul></ul>");
        $ul.css(ulStyle);

        style.translate($ul[0], 0, 0);

        var $lis = [];
        for (var i = 0, len = this._children.length; i < len; ++i) {
            var $li = this._initChild(this._children[i]);
            
            $lis.push($li);
            
            $ul.append($li);
        }

        $el.html($ul);

        return {
            $ul : $ul,
            $lis: $lis,
        };
    };

    Carrousel.prototype._initChild = function (child) {
        var liStyle = {
            position: "absolute",
            display: "none",
            left: 0,
            right: 0,
            height: "100%",
            width: "100%"
        };

        var $li = zepto("<li></li>");
        $li.css(liStyle);

        $li.append(child);

        return $li;
    };

    Carrousel.prototype.addChild = function (child) {
        var $ul  = this._dom.$ul;
        var $lis = this._dom.$lis;
        　
        var $li = this._initChild(child);

        $ul.append($li);

        $lis.push($li);
    };

    Carrousel.prototype._initDomEvents = function () {
        var self = this;

        var $ul    = this._dom.$ul;
        var ul     = $ul[0];
        var hammer = this._hammer = new Hammer(ul);

        hammer.on("panmove", onPanMove);
        hammer.on("panend", onPanEnd);
        hammer.on("pancancel", onPanCancel);
        hammer.on("swipeleft", onSwipeLeft);
        hammer.on("swiperight", onSwipeRight);

        function onPanMove (evt) {
            if (self._isTransitioning) {
                return;
            }

            var x = evt.deltaX + self._translate;
            
            style.translate($ul[0], x, 0);
        }

        function onPanEnd (evt) {
            if (self._isTransitioning) {
                return;
            }

            var $el     = zepto(self._el);
            var width   = $el.width();
            var offsetX = evt.deltaX;

            if (Math.abs(offsetX) >= (width / 3)) {
                if (offsetX < 0) {
                    self.next();
                } else {
                    self.prev();
                }
            } else {
                self.active(self._activeIndex);
            }
        }

        function onPanCancel () {
            self.active(self._activeIndex);
        }

        function onSwipeLeft () {
            if (self._isTransitioning) {
                return;
            }

            self.next();
        }

        function onSwipeRight () {
            if (self._isTransitioning) {
                return;
            }

            self.prev();
        }
    };

    Carrousel.prototype.active = function (index, isTransition) {
        if (isTransition !== false) {
            isTransition = true;
        }

        var self = this;

        var prevActiveIndex = this._activeIndex;
        var curtActiveIndex = index;
        
        var $ul  = this._dom.$ul;
        var $lis = this._dom.$lis;

		var curtIndex = curtActiveIndex;
		var nextIndex = curtActiveIndex + 1;
		var prevIndex = curtActiveIndex - 1;

		if (nextIndex >= $lis.length) {
			nextIndex = 0;
		}

		if (prevIndex < 0) {
			prevIndex = $lis.length - 1;
		}

        for (var i = 0, len = $lis.length; i < len; ++i) {
			var $li = $lis[i];
			if (i != curtIndex && i != nextIndex && i != prevIndex) {
				$li.hide();
				continue;
			}

			$li.show();
		}

        var $curtItem = $lis[curtIndex];
        var $prevItem = $lis[prevIndex];
        var $nextItem = $lis[nextIndex];

        var $el   = zepto(this._el);
        var width = $el.width();

        if (isTransition) {
            this._isTransitioning = true;

            var duration = this._transition.duration / 1000;

            $ul.css("transition", "transform " + duration + "s");

            var prefixes = style.prefixes;
            for (var i = 0, len = prefixes.length; i < len; ++i) {
                var prefix = prefixes[i];
                var transitionName  = "-" +prefix + "-transition";
                var transitionValue = "-" + prefix + "-transform " + duration + "s";
                
                $ul.css(transitionName, transitionValue);
            }

            listeners = self._listeners.onTransitionStart || []; 
            for (var i = 0, len = listeners.length; i < len; ++i) {
                var fn = listeners[i];

                if (fn) {
                    fn()
                }
            }
        }

        style.translate($ul, this._translate, 0);
        style.translate($curtItem, -this._translate, 0);
        style.translate($nextItem, -this._translate + width, 0);
        style.translate($prevItem, -this._translate - width, 0);

        if (isTransition) {
            $el.one("webkitTransitionEnd", transitionEnd);
            $el.one("transitionend", transitionEnd);
            setTimeout(transitionEnd, duration * 1000);
        }

        this._activeIndex   = curtActiveIndex;

        function transitionEnd () {
            if (!self._isTransitioning) {
                return;
            }

            var ulStyle = {
                transition: ""
            };

            var prefixes = style.prefixes;

            for (var i = 0, len = prefixes.length; i < len; ++i) {
                var prefix = prefixes[i];
                var transition = prefix + "Transition";
                ulStyle[transition] = "";
            }

            $ul.css(ulStyle);

            var listeners = self._listeners.onChange || [];
            for (var i = 0, len = listeners.length; i < len; ++i) {
                var fn = listeners[i];

                if (fn) {
                    fn(self._direction)
                }
            }

            listeners = self._listeners.onTransitionEnd || []; 
            for (var i = 0, len = listeners.length; i < len; ++i) {
                var fn = listeners[i];

                if (fn) {
                    fn()
                }
            }

            self._isTransitioning = false;
            self._direction = 0;
        }
    };

    Carrousel.prototype.next = function () {
        var $el   = zepto(this._el);
        var width = $el.width();

        this._translate -= width;
        this._direction = 1;

        var $lis = this._dom.$lis;

		var index = this._activeIndex;
        

		if (index == $lis.length - 1) {
			index  = 0;
		} else {
			index += 1;
		}

		this.active(index);
    };

    Carrousel.prototype.prev = function () {
        var $el   = zepto(this._el);
        var width = $el.width();

        this._translate += width;
        this._direction = -1;

        var $lis = this._dom.$lis;

		var index = this._activeIndex;

		if (index == 0) {
			index  = $lis.length - 1;
		} else {
			index -= 1;
		}

		this.active(index);
    };

    Carrousel.prototype.render = zepto.noop;

    Carrousel.prototype.onChange = function (fn) {
        if (this._listeners == null) {
            this._listeners = {};
        }

        if (this._listeners.onChange == null) {
            this._listeners.onChange = [];
        }

        this._listeners.onChange.push(fn || zepto.noop);
    };

    Carrousel.prototype.onTransitionStart = function (fn) {
        if (this._listeners == null) {
            this._listeners = {};
        }

        if (this._listeners.onTransitionStart == null) {
            this._listeners.onTransitionStart = [];
        }

        this._listeners.onTransitionStart.push(fn || zepto.noop);
    };

    Carrousel.prototype.onTransitionEnd = function (fn) {
        if (this._listeners == null) {
            this._listeners = {};
        }

        if (this._listeners.onTransitionEnd == null) {
            this._listeners.onTransitionEnd = [];
        }

        this._listeners.onTransitionEnd.push(fn || zepto.noop);
    };

    Carrousel.prototype.destroy = function () {
        if (this._hammer) {
            this._hammer.destroy();
        }

        this._dom.$ul.remove();

        this._el = null;
        this._children = null;
        this._translate = null;
        this._activeIndex = null;
        this._isTransitioning = null;
        this._transition = null;
        this._direction = null;
        this._hammer = null;
        this._listeners = null;
        this._dom= null;


    };

    return Carrousel;
});