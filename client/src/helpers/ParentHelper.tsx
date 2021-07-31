import React, {Fragment} from "react";

export interface ParentalProperties {
	children?: Children
}

export type Children =
	| undefined
	| null
	| {}
	| boolean
	| boolean[]
	| number
	| number[]
	| string
	| string[]
	| JSX.Element
	| JSX.Element[]
	| Array<undefined | null | boolean | boolean[] | number | number[] | string | string[] | JSX.Element | JSX.Element[] | Children>
export type ChildrenConstructor =
	| null
	| JSX.Element
export class Parent {
    /**
	 * Counts the children of the parent.
	 * 
	 * @param children Children of the parent object.
	 * @returns Returns the number of children; 
	 * 		one if only one child is passed, zero if children is a boolean, undefined or has a length of one.
	 */
    static countChildren(children: Children) {
        if (children === undefined || children === null || Object.keys(children).length === 0) {
            return 0;
        } else if (Array.isArray(children)) {
            return children.length;
        } else if ((typeof children) === "boolean") {
            return 0;
        } else {
            return 1;
        }
    }
    /**
	 * Constructs the children of the parent withing a Fragment component.
	 * 
	 * @param children Children of the parent object.
	 * @returns Fragment component containing the child.
	 */
    static constructChildren(children: Children): ChildrenConstructor {
        if (
            children === undefined ||
			children === null ||
			typeof children === "boolean"
        ) {
            return null;
        } else {
            return <Fragment>{children}</Fragment>;
        }
    }
}