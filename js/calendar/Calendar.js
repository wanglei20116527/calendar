define(["zepto", "utils/utils", "components/Header", "components/MonthItem", "components/Carrousel"], 
function (zepto, utils, Header, MonthItem, Carrousel) {
    function Calendar (el, today, selectedDate) {
        this._el = el;
        this._today = today || new Date();
        this._selectedDate = selectedDate || new Date();

        this._isTransitioning = false;

        this._dom = this._initDom();

        this._initEvents();
    }

    Calendar.prototype._initDom　= function () {
        var el  = this._el;
        var $el = zepto(el);

        var $calendar = zepto("<div></div>", {
            class: "wl-calendar"
        });
        $el.append($calendar);

        var $headerWrapper = zepto("<div></div>", {
            class: "wl-calendar-header-wrapper"
        });
        $calendar.append($headerWrapper);

        var $header = new Header();
        $header.appendTo($headerWrapper);
        
        var $carrouselWrapper = zepto("<div></div>", {
            class: "wl-calendar-body-wrapper" 
        });
        $calendar.append($carrouselWrapper);

        var $monthItems = [];
        
        var curtMonthDate  = this._selectedDate;
        var curtMonthYear  = curtMonthDate.getFullYear();
        var curtMonthMonth = curtMonthDate.getMonth();
        var curtMonthItem  = new MonthItem(curtMonthYear, curtMonthMonth, {
            today: this._today,
            selectedDate: this._selectedDate
        });
        
        var prevMonthDate  = utils.getPrevMonthDate(curtMonthDate);
        var prevMonthYear  = prevMonthDate.getFullYear();
        var prevMonthMonth = prevMonthDate.getMonth();
        var prevMonthItem  = new MonthItem(prevMonthYear, prevMonthMonth, {
            today: this._today,
            selectedDate: utils.getPrevMonthDate(this._selectedDate)
        });

        var nextMonthDate  = utils.getNextMonthDate(curtMonthDate);
        var nextMonthYear  = nextMonthDate.getFullYear();
        var nextMonthMonth = nextMonthDate.getMonth();
        var nextMonthItem  = new MonthItem(nextMonthYear, nextMonthMonth, {
            today: this._today,
            selectedDate: utils.getNextMonthDate(this._selectedDate)
        });

        $monthItems.push(prevMonthItem);
        $monthItems.push(curtMonthItem);
        $monthItems.push(nextMonthItem);

        var carrouselChildren = [];
        carrouselChildren.push(curtMonthItem.getDom());
        carrouselChildren.push(nextMonthItem.getDom());
        carrouselChildren.push(prevMonthItem.getDom());

        var $carrousel = new Carrousel($carrouselWrapper[0], carrouselChildren);

        return {
            $calendar: $calendar,
            $header: $header,
            $carrousel: $carrousel,
            $monthItems: $monthItems
        };
    };

    Calendar.prototype._initEvents = function () {
        var self = this;

        var $monthItems = this._dom.$monthItems;
        for (var i = 0, len = $monthItems.length; i < len; ++i) {
            var $monthItem = $monthItems[i];

            $monthItem.onDaySelect(onDaySelect);
        }

        var $carrousel = this._dom.$carrousel;
        $carrousel.onChange(onCarrouselChange);
        $carrousel.onTransitionStart(onTransitionStart);
        $carrousel.onTransitionEnd(onTransitionEnd);

        function onDaySelect (date) {
            if (self._isTransitioning) {
                return;
            }

            self.updateSelectedDate(date);
            self.render();
        }

        function onCarrouselChange (direction) {
            $carrousel.setTransitionDuration(300);

            if (direction === 0) {
                return;
            }

            var $monthItems = self._dom.$monthItems;

            if (direction === 1) {
                var $prevMonthItem = $monthItems[1];
                var $curtMonthItem = $monthItems[2];
                var $nextMonthItem = $monthItems[0];

                var curtMonthDate = utils.getNextMonthDate(self._selectedDate);
                var nextMonthDate = utils.getNextMonthDate(curtMonthDate);

                $nextMonthItem.updateYear(nextMonthDate.getFullYear());
                $nextMonthItem.updateMonth(nextMonthDate.getMonth());
                $nextMonthItem.updateSelectedDate(nextMonthDate);
                $nextMonthItem.render();

                $monthItems[0] = $prevMonthItem;
                $monthItems[1] = $curtMonthItem;
                $monthItems[2] = $nextMonthItem;

                self._selectedDate = curtMonthDate;
            } else {
                var $prevMonthItem = $monthItems[2];
                var $curtMonthItem = $monthItems[0];
                var $nextMonthItem = $monthItems[1];

                var curtMonthDate = utils.getPrevMonthDate(self._selectedDate);
                var prevMonthDate = utils.getPrevMonthDate(curtMonthDate);

                $prevMonthItem.updateYear(prevMonthDate.getFullYear());
                $prevMonthItem.updateMonth(prevMonthDate.getMonth());
                $prevMonthItem.updateSelectedDate(prevMonthDate);
                $prevMonthItem.render();

                $monthItems[0] = $prevMonthItem;
                $monthItems[1] = $curtMonthItem;
                $monthItems[2] = $nextMonthItem;

                self._selectedDate = curtMonthDate;
            }
        }

        function onTransitionStart () {
            self._isTransitioning = true;
        }

        function onTransitionEnd () {
            self._isTransitioning = false;
        }
    };

    Calendar.prototype.render = function () {
        var dom = this._dom;

        dom.$header.render();
        dom.$carrousel.render();

        var $monthItems = dom.$monthItems;
        for (var i = 0, len = $monthItems.length; i < len; ++i) {
            $monthItems[i].render();
        }
    };

    Calendar.prototype.updateSelectedDate = function (date) {
        var $carrousel  = this._dom.$carrousel; 
        var $monthItems = this._dom.$monthItems;

        var prevSelectedDate = this._selectedDate;
        var curtSelectedDate = new Date(date);

        if (prevSelectedDate.getMonth() === curtSelectedDate.getMonth()) {
            var prevMonthSelectedDate = utils.getPrevMonthDate(curtSelectedDate);
            var $prevMonthItem = $monthItems[0];
            $prevMonthItem.updateSelectedDate(prevMonthSelectedDate);

            var curtMonthSelectedDate = curtSelectedDate;
            var $curtMonthItem = $monthItems[1];
            $curtMonthItem.updateSelectedDate(curtMonthSelectedDate);

            var nextMonthSelectedDate = utils.getNextMonthDate(curtSelectedDate);
            var $nextMonthItem = $monthItems[2];
            $nextMonthItem.updateSelectedDate(nextMonthSelectedDate);

            this._selectedDate = curtSelectedDate;
   
        } else if (prevSelectedDate.getTime() > curtSelectedDate.getTime()) {
            var prevMonthSelectedDate = utils.getPrevMonthDate(curtSelectedDate);
            var $prevMonthItem = $monthItems[2];
            $prevMonthItem.updateSelectedDate(prevMonthSelectedDate);

            var curtMonthSelectedDate = curtSelectedDate;
            var $curtMonthItem = $monthItems[0];
            $curtMonthItem.updateSelectedDate(curtMonthSelectedDate);

            var nextMonthSelectedDate = utils.getNextMonthDate(curtSelectedDate);
            var $nextMonthItem = $monthItems[1];
            $nextMonthItem.updateSelectedDate(nextMonthSelectedDate);

            this._selectedDate = nextMonthSelectedDate; 

            $carrousel.setTransitionDuration(800);
            $carrousel.prev();

        } else if (prevSelectedDate.getTime() < curtSelectedDate.getTime()) {
            var prevMonthSelectedDate = utils.getPrevMonthDate(curtSelectedDate);
            var $prevMonthItem = $monthItems[1];
            $prevMonthItem.updateSelectedDate(prevMonthSelectedDate);

            var curtMonthSelectedDate = curtSelectedDate;
            var $curtMonthItem = $monthItems[2];
            $curtMonthItem.updateSelectedDate(curtMonthSelectedDate);

            var nextMonthSelectedDate = utils.getNextMonthDate(curtSelectedDate);
            var $nextMonthItem = $monthItems[0];
            $nextMonthItem.updateSelectedDate(nextMonthSelectedDate);

            this._selectedDate = prevMonthSelectedDate; 

            $carrousel.setTransitionDuration(800);
            $carrousel.next();
        }
    };

    Calendar.prototype.destroy = function () {
        this._dom.$header.destroy();
        this._dom.$carrousel.destroy();

        var $monthItems = this._dom.$monthItems;
        for (var i = 0, len = $monthItems; i < len; ++i) {
            $monthItems[i].destroy();
        }

        this._dom.$calendar.remove();

        this._el = null;
        this._today = null;
        this._selectedDate = null;
        this._isTransitioning = null;
        this._dom = null;
    };

    return Calendar;
});