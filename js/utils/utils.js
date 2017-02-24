define(function () {
    return {
        isMobile: function () {
            return /Android|webOS|iPhone|iPad|iPod|BlackBerryWindows Phone/i.test(navigator.userAgent);    
        },

        isLeapYear: function (year) {
            var tmp1 = year / 100
            var tmp2 = year / 4;

            return parseInt(tmp1) !== tmp1 && parseInt(tmp2) === tmp2;
        },

        getNumDaysOfMonth: function (year, month) {
            var num = [
                31, 28, 31, 30, 31, 30,
                31, 31, 30, 31, 30, 31
            ][month];

            if(this.isLeapYear(year) && month == 1){
                ++num;
            }

            return num;
        },

        getPrevMonthDate: function(date){
            var year  = date.getFullYear()
            , month = date.getMonth()
            , day   = date.getDate()
            , num;

            --month;

            if( month < 0 ){
                --year;
                month = 11;
            }

            num = this.getNumDaysOfMonth(year, month);

            if( day > num ){
                day = num;
            }

            return new Date(year, month, day);
        },

        getNextMonthDate: function(date){
            var year  = date.getFullYear()
            , month = date.getMonth()
            , day   = date.getDate()
            , num;

            ++month;

            if( month >= 12 ){
                ++year;
                month = 0;
            }

            num = this.getNumDaysOfMonth(year, month);

            if( day > num ){
                day = num;
            }

            return new Date(year, month, day);
        },

        isSameDay: function (date1, date2) {
            if (date1 == null || date2 == null) {
                return false;
            }

            return date1.getDate() === date2.getDate();
        },

        isSameMonth: function (date1, date2) {
            if (date1 == null || date2 == null) {
                return false;
            }

            return date1.getMonth() === date2.getMonth();
        },

        isSameDate: function (date1, date2) {
            if (date1 == null || date2 == null) {
                return false;
            }

            return date1.getFullYear() === date2.getFullYear()
                    && date1.getMonth() === date2.getMonth()
                    && date1.getDate() === date2.getDate();
        }
    }
});