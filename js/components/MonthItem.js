define(["zepto", "hammer", "LunarCalendar", "utils/utils", "components/DayItem"],
function (zepto, Hammer, LunarCalendar, utils, DayItem) {
    var NUMBER_WEEKS     = 6;
    var NUMBER_DAYS_WEEK = 7;
    var NUMBER_DAY_ITEMS = NUMBER_WEEKS * NUMBER_DAYS_WEEK;

    function MonthItem (year, month, options) {
        options = options || {};

        var today = new Date();

        this._year  = year  || today.getFullYear();
        this._month = month || today.getMonth();
        this._today = options.today || new Date();
        this._selectedDate = options.selectedDate || new Date();

        this._parent = null;
        this._hammer = null;
        this._listeners = null;

        this._dom = this._initDom();
        
        this._initDomEvents();
    }

    MonthItem.prototype.appendTo = function (target) {
        var dom = this._dom;

        this._parent = target;

        zepto(target).html(dom.$monthItem);
    };

    MonthItem.prototype._initDom = function () {
        var $monthItem = zepto("<ul></ul>", {
            class: "wl-calendar-month"
        });

        var $weekItems = [];
        for (var i = 0, len = NUMBER_WEEKS; i < len; ++i) {
            var $weekItem = zepto("<li></li>", {
                class: "wl-calendar-week clearfix"
            });
            $weekItems.push($weekItem);
            $monthItem.append($weekItem);
        }

        var $dayItems = this._getDayItems();
        for (var i = 0, len = $dayItems.length; i < len; ++i) {
            var $dayItem  = $dayItems[i];

            var $weekItem = $weekItems[Math.floor(i / NUMBER_DAYS_WEEK)];
            
            $dayItem.appendTo($weekItem);
        }
        
        return {
            $dayItems: $dayItems,
            $monthItem: $monthItem
        };
    };

    MonthItem.prototype._initDomEvents = function () {
        var self = this;

        var $monthItem = this._dom.$monthItem;
        var monthItem  = $monthItem[0];

        if (!utils.isMobile()) {
            $monthItem.on("click", onDaySelect);
            return;
        }

        this._hammer = new Hammer(monthItem);
        this._hammer.on("tap", onDaySelect);

        function onDaySelect (evt) {
            var target = zepto(evt.target);

            var $dayItem = target.closest(".wl-calendar-day"); 
            if ($dayItem.length > 0) {
                $dayItem = $dayItem.eq(0);
            }

            if (!$dayItem.hasClass("wl-calendar-day")) {
                return;
            }
            
            var date = new Date(JSON.parse($dayItem.data("date")));
            var listeners = self._listeners || [];

            for (var i = 0, len = listeners.length; i < len; ++i) {
                var fn = listeners[i];
                
                if (fn) {
                    fn(date);
                }
            }
        }
        
    };

    MonthItem.prototype.getDom = function () {
        return this._dom.$monthItem[0];
    };

    MonthItem.prototype._getDayItems = function () {
        var items = [];

        for (var i = 0, len = NUMBER_DAY_ITEMS; i < len; ++i) {
            var dayItem = new DayItem();

            items.push(dayItem);
        }

        return items;
    };

    MonthItem.prototype._getDayItemDatas = function () {
        var dayItemDatas = [];

        var today = this._today;
        var selectedDate = this._selectedDate;

        var curtMonthYear  = this._year;
	    var curtMonthMonth = this._month;
	    var curtMonthDate  = new Date(curtMonthYear, curtMonthMonth, 1);
	    var curtMonthNum   = utils.getNumDaysOfMonth(curtMonthYear, curtMonthMonth);
        var curtMonthLunarDates = LunarCalendar.calendar(curtMonthYear, curtMonthMonth + 1, false).monthData;

        var firstDay = curtMonthDate.getDay();

        for(var i = 0; i < curtMonthNum; ++i){
            dayItemDatas[i + firstDay] = getDayItemData(curtMonthLunarDates[i], true);
	    }

        var prevMonthDate  = utils.getPrevMonthDate(curtMonthDate);
	    var prevMonthYear  = prevMonthDate.getFullYear();
	    var prevMonthMonth = prevMonthDate.getMonth();
	    var prevMonthNum   = utils.getNumDaysOfMonth(prevMonthYear, prevMonthMonth);
	    var prevMonthLunarDates = LunarCalendar.calendar(prevMonthYear, prevMonthMonth + 1, false).monthData;

        for(var i = 0; i < firstDay; ++i){
            dayItemDatas[i] = getDayItemData(prevMonthLunarDates[prevMonthNum - firstDay + i], false);
	    }

        var nextMonthDate  = utils.getNextMonthDate(curtMonthDate);
	    var nextMonthYear  = nextMonthDate.getFullYear();
	    var nextMonthMonth = nextMonthDate.getMonth();
	    var nextMonthLunarDates = LunarCalendar.calendar(nextMonthYear, nextMonthMonth + 1, false).monthData;

        for(var i = curtMonthNum + firstDay; i < NUMBER_DAY_ITEMS; ++i ){
            dayItemDatas[i] = getDayItemData(nextMonthLunarDates[i - curtMonthNum - firstDay], false);
        }

        return dayItemDatas; 

        function getDayItemData (lunarDate, active) {
            var year = lunarDate.year;
            var month = lunarDate.month;
            var day = lunarDate.day;
            var lunarTerm = lunarDate.term;
            var lunarDay = lunarDate.lunarDay;
            var lunarDayName = lunarDate.lunarDayName;
            var lunarMonthName = lunarDate.lunarMonthName;
            
            var date = new Date(year, month - 1, day);

            var options = {
                active: !!active,
                today: utils.isSameDate(date, today),
                selected: utils.isSameDay(date, selectedDate) &&  utils.isSameMonth(date, selectedDate),
                label: lunarDay == 1 ? lunarMonthName : (lunarTerm || lunarDayName)
            };

            return {
                date: date,
                options: options
            };
        }
    };

    MonthItem.prototype.render = function () {
        var $dayItems = this._dom.$dayItems;
        var dayItemDatas = this._getDayItemDatas();

        for (var i = 0, len = $dayItems.length; i < len; ++i) {
            var $dayItem = $dayItems[i];
            var data = dayItemDatas[i];
            
            var isChanged = $dayItem.update(data.date, data.options);

            isChanged && $dayItem.render();
        }
    };

    MonthItem.prototype.update = function (year, month, options) {
        options = options || {};

        var today = new Date();

        this._year  = year  || today.getFullYear();
        this._month = month || today.getMonth();
        this._today = options.today || new Date();
        this._selectedDate = options.selectedDate || new Date();
    };

    MonthItem.prototype.updateSelectedDate = function (date) {
        this._selectedDate = date;
    };

    MonthItem.prototype.updateYear = function (year) {
        this._year = year;
    };

    MonthItem.prototype.updateMonth = function (month) {
        this._month = month;
    };

    MonthItem.prototype.onDaySelect = function (fn) {
        if (this._listeners == null) {
            this._listeners = [];
        }

        this._listeners.push(fn || zepto.noop);
    };

    MonthItem.prototype.destroy = function () {
        var $dayItems = this._dom.$dayItems;
        for (var i = 0, len = $dayItems; i < len; ++i) {
            $dayItems[i].destroy();
        }
        
        this._dom.$monthItem.off();

        if (this._parent) {
            this._dom.$monthItem.remove();
        }

        if (this._hammer) {
            this._hammer.destroy();
        }

        this._year = null;
        this._month = null;
        this._today = null;
        this._selectedDate = null;
        this._parent = null;
        this._listeners = null;;
    };

    return MonthItem;
});