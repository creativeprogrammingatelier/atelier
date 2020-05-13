export class ScrollHelper {
	static headerHeight = 70;
	static scrollOffset = 15;
	
	static scrollToID(id: string) {
		const element = document.getElementById(id);
		if (element) {
			window.scrollTo({
				top: element.getBoundingClientRect().top - this.headerHeight - this.scrollOffset,
				behavior: "smooth"
			});
		}
	}
	
	static scrollToHash() {
		const hash = window.location.hash;
		if (hash) {
			ScrollHelper.scrollToID(hash.substr(1));
		}
	}
}