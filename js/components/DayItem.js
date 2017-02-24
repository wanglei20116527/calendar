define(["zepto", "utils/utils"], function (zepto, utils) {
    function DayItem (date, options) {
        this.setDate(date);
        this.setOptions(options);
        
        this._dom    = this._initDom();
        this._parent = null;
    };

    DayItem.prototype.setDate = function (date) {
        if (utils.isSameDate(date, this._date)) {
            return false;
        }

        this._date = date || new Date();
        
        return true;
    };

    DayItem.prototype.setOptions = function (options) {
        if (options 
            && options.label === this._lalel
            && options.today === this._today
            && options.active === this._active
            && options.selected === this._selected) {
            return false;
        }

        options = options || {};

        this._lalel = options.label || "";
        this._today = options.today || false;
        this._active = options.active || false;
        this._selected = options.selected || false;

        return true;
    }

    DayItem.prototype.appendTo = function (target) {
        var dom = this._dom;

        this._parent = target;

        zepto(target).append(dom.$dayItem);
    };

    DayItem.prototype._initDom = function () {
        var $dayItem = zepto("<div></div>", {
            class: "wl-calendar-day"
        });

        $dayItemWrapper = zepto("<div></div>", {
            class: "wl-calendar-day-wrapper"
        });
        $dayItem.append($dayItemWrapper);

        var $numItem = zepto("<span></span>", {
            class: "wl-calendar-day-num"
        });

        var $labelItem = zepto("<span></span>", {
            class: "wl-calendar-day-label"
        });

        $dayItemWrapper.append($numItem);
        $dayItemWrapper.append($labelItem);

        return {
            $dayItem  : $dayItem,
            $numItem  : $numItem,
            $labelItem: $labelItem
        };
    };

    DayItem.prototype.update = function (date, options) {
        var needToUpdate1 = this.setDate(date);
        var needToUpdate2 = this.setOptions(options);

        return needToUpdate1 || needToUpdate2;
    };

    DayItem.prototype.render = function () {
        var dom = this._dom;

        dom.$dayItem
        .toggleClass("today" , this._today)
        .toggleClass("active", this._active)
        .toggleClass("selected", this._selected)
        .data("date", JSON.stringify(this._date));

        dom.$numItem.html(this._date.getDate());
        dom.$labelItem.html(this._lalel);
    };

    DayItem.prototype.destroy = function () {
        if (this._parent) {
            this._dom.$dayItem.remove();
        }

        this._date = null;
        this._lalel = null;
        this._today = null;
        this._active = null;
        this._selected = null;

        this._dom    = null;
        this._parent = null;
    };
    
    return DayItem;
});