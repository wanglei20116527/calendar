define(["zepto"], function (zepto) {
    return {
        prefixes: ["webkit", "moz", "ms", "o"],

        isSupport3d: function () {
            return true;
        },

        getTranslateStyle: function (x, y) {
            if (this.isSupport3d()) {
                return "translate3d(" + x + "px, " + y + "px, 0px)"; 
            }

            return "translate(" + x + "px, " + y + "px)";
        },

        translate: function (el, x, y) {
            var $el = zepto(el);

            var translateValue = this.getTranslateStyle(x, y);
            $el.css("transform", translateValue);

            var prefixes = this.prefixes; 
            for (var i = 0, len = prefixes.length; i < len; ++i) {
                var prefix = prefixes[i];
                var styleName = "-" + prefix + "-transform";
                var styleValue = translateValue;
                 $el.css(styleName, translateValue);
                
            }
        },

        transition: function (el, props, duration, delay, timeFunc) {     
            props = zepto.isArray(props) ? props: [props];

        },
    }
});