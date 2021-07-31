export interface ClickPosition {
    /** X coordinate of ClickPosition */
    x: number,
    /** Y coordinate of ClickPosition */
    y: number
}

/**
 * Object used for getting the X and Y position of a 'clicks'
 */
export class ClickHelper {
    /**
     * Method for returning the X and Y position of either a 'mousedown' or 'touchstart' event.
     *
     * @param event Mouse event.
     * @returns Tuple of the X and Y coordinate of click, or zero if mouse event is not handled.
     */
    static pagePosition(event: Event): ClickPosition {
        if (event.type === "mousedown") {
            const mouseEvent = event as MouseEvent;
            return {x: mouseEvent.pageX, y: mouseEvent.pageY};
        } else if (event.type === "touchstart") {
            const touchEvent = event as TouchEvent;
            return {x: touchEvent.touches[0].pageX, y: touchEvent.touches[0].pageY};
        }
        return {x: 0, y: 0};
    }
}
