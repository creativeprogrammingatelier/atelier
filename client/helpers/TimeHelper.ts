export class TimeHelper {
	static howLongAgo(start: string, offset: string) {
		const startDate = new Date(start);
		const offsetDate = new Date(offset);

		const difference = new Date(offsetDate.getTime() - startDate.getTime());

		const times = [
			{
				method: this.yearsAgo,
				name: "year"
			},{
				method: this.monthsAgo,
				name: "month"
			},{
				method: this.weeksAgo,
				name: "week"
			},{
				method: this.daysAgo,
				name: "day"
			},{
				method: this.hoursAgo,
				name: "hour"
			},{
				method: this.minutesAgo,
				name: "minute"
			},{
				method: this.secondsAgo,
				name: "second"
			}
		];
		const singularAgo = " ago";
		const pluralAgo = "s ago";

		for (const {method, name} of times) {
			const t = method(difference);
			if (t > 0) {
				return t + " " + name + (t === 1 ? singularAgo : pluralAgo);
			}
		}

		return "Just now";
	}

	static yearsAgo(date: Date) {
		return date.getUTCFullYear() - 1970
	}
	static monthsAgo(date: Date) {
		return date.getUTCMonth();
	}
	static weeksAgo(date: Date) {
		return Math.round((date.getUTCDate() - 1) / 7);
	}
	static daysAgo(date: Date) {
		return date.getUTCDate() - 1;
	}
	static hoursAgo(date: Date) {
		return date.getUTCHours();
	}
	static minutesAgo(date: Date) {
		return date.getUTCMinutes();
	}
	static secondsAgo(date: Date) {
		return date.getUTCSeconds();
	}
}