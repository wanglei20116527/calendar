require.config({
    baseUrl: "js/lib",
    paths: {
        zepto: "zepto.min",
        hammer: "hammer.min",
        LunarCalendar: "LunarCalendar.min",
        utils: "../utils",
        components: "../components",
        calendar: "../calendar",
        style: "../style"
    }
});

require(["calendar/Calendar"], function (Calendar, zepto) {
    var calendar = new Calendar(document.getElementById("calendar"));

    calendar.render();
});