export interface ClickPosition {
	x: number,
	y: number
}

export class ClickHelper {
	static pagePosition(event: Event): ClickPosition {
		if (event.type === "mousedown") {
			const mouseEvent = event as MouseEvent;
			return {x: mouseEvent.pageX, y: mouseEvent.pageY}
		} else if (event.type === "touchstart") {
			const touchEvent = event as TouchEvent;
			return {x: touchEvent.touches[0].pageX, y: touchEvent.touches[0].pageY}
		}
		return {x: 0, y: 0}
	}
}