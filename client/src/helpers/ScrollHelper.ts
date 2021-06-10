export class ScrollHelper {
	static headerHeight = 70;
	static scrollOffset = 15;

	/**
	 * Smoothly scroll to the given element ID.
	 *
	 * @param id ID of target element.
	 */
	static scrollToID(id: string) {
	  const element = document.getElementById(id);
	  if (element) {
	    window.scrollTo({
	      top: element.getBoundingClientRect().top - this.headerHeight - this.scrollOffset,
	      behavior: 'smooth',
	    });
	  }
	}

	/**
	 * Scrolls to the hash of the global window containing the DOM.
	 */
	static scrollToHash() {
	  const hash = window.location.hash;
	  if (hash) {
	    ScrollHelper.scrollToID(hash.substr(1));
	  }
	}
}
