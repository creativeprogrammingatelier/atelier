export class TimeHelper {
    /**
     * Resolves how long ago a given event happened.
     *
     * @param start Start time of the event.
     * @param offset Time offset from the start of the event, eg. current time.
     * @returns String representation of the time.
     */
    static howLongAgo(start: Date, offset: Date) {
        const difference = new Date(offset.getTime() - start.getTime());

        const times = [
            {
                method: this.yearsAgo,
                name: "year"
            }, {
                method: this.monthsAgo,
                name: "month"
            }, {
                method: this.weeksAgo,
                name: "week"
            }, {
                method: this.daysAgo,
                name: "day"
            }, {
                method: this.hoursAgo,
                name: "hour"
            }, {
                method: this.minutesAgo,
                name: "minute"
            }, {
                method: this.secondsAgo,
                name: "second"
            }
        ];
        const singularAgo = " ago";
        const pluralAgo = "s ago";

        for (const {method, name} of times) {
            const t = method(difference);
            if (t > 0) {
                return `${t} ${name}${t === 1 ? singularAgo : pluralAgo}`;
            }
        }

        return "Just now";
    }

    /**
     * Resolves the year difference between a given date and 1970.
     */
    static yearsAgo(this: void, date: Date) {
        return date.getUTCFullYear() - 1970;
    }
    /**
     * Resolves the month of the date given.
     */
    static monthsAgo(this: void, date: Date) {
        return date.getUTCMonth();
    }
    /**
     * Resolves the week of the date given.
     */
    static weeksAgo(this: void, date: Date) {
        return Math.round((date.getUTCDate() - 1) / 7);
    }
    /**
     * Resolves the day of the date object given.
     */
    static daysAgo(this: void, date: Date) {
        return date.getUTCDate() - 1;
    }
    /**
     * Resolves the hour of the date object given.
     */
    static hoursAgo(this: void, date: Date) {
        return date.getUTCHours();
    }
    /**
     * Resolves the minuets of the date object given.
     */
    static minutesAgo(this: void, date: Date) {
        return date.getUTCMinutes();
    }
    /**
     * Resolves the seconds of the date object given.
     */
    static secondsAgo(this: void, date: Date) {
        return date.getUTCSeconds();
    }

    /**
     * Constructs a date object from a string.
     *
     * @param date String representation of a date.
     * @returns Date object
     */
    static fromString(date: string) {
        return new Date(date);
    }
    /**
     * Converts a date object to a string.
     *
     * @param date Date object to be converted.
     * @returns String representation of the date object.
     */
    static toDateTimeString(date: Date) {
        return date.toLocaleString();
    }
    /**
     * Converts date object to date string.
     *
     * @param date Date object to be converted.
     * @returns String representation of the date part of the date object.
     */
    static toDateString(date: Date) {
        return date.toLocaleDateString();
    }
    /**
     * Converts date object to time string.
     *
     * @param date Date object to be converted
     * @returns String representation of the time part of the date object.
     */
    static toTimeString(date: Date) {
        return date.toLocaleTimeString();
    }
}
