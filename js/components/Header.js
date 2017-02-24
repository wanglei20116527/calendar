define(["zepto"], function (zepto) {
    var DAY_LABELS = [
        "日",
        "一",
        "二",
        "三",
        "四",
        "五",
        "六"
    ];

    function Header () {
        this._dom    = this._initDom();
        this._parent = null;
    }

    Header.prototype._initDom = function () {
        var $header = zepto("<ul></ul>", {
            class: "wl-calendar-header clearfix",
        });

        for (var i = 0, len = DAY_LABELS.length; i < len; ++i) {
            var label = DAY_LABELS[i];

            var $item = zepto("<li class='wl-calendar-item'><span>" + label + "</span></li>");

            $header.append($item);
        }

        return {
            $header: $header
        };
    };

    Header.prototype.appendTo = function (target) {
        var dom = this._dom;

        this._parent = target;

        zepto(target).append(dom.$header);
    };

    Header.prototype.render = zepto.noop;

    Header.prototype.destroy = function () {
        if (this._parent) {
            this._dom.$header.remove();
        }

        this._dom    = null;
        this._parent = null;
    };

    return Header;
});