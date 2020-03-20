export class ScrollHelper {
	static headerHeight = 70;
	static scrollOffset = 15;

	static scrollToID(id: string) {
		const element = document.getElementById(id);
		console.log("Scrolling to element");
		console.log(element);
		if (element) {
			window.scrollTo({
				top: element.getBoundingClientRect().top - this.headerHeight - this.scrollOffset,
				behavior: "smooth"
			});
		}
	}
	static scrollToHash() {
		const hash = window.location.hash;
		console.log("Scrolling to hash "+hash);
		if (hash) {
			this.scrollToID(hash.substr(1));
		}
	}
}