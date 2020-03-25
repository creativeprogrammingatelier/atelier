export interface ParentalProperties {
	children?: Children
}

export type Children =
	| undefined
	| null
	| boolean
	| boolean[]
	| number
	| number[]
	| string
	| string[]
	| JSX.Element
	| JSX.Element[]
	| Array<undefined | null | boolean | boolean[] | number | number[] | string | string[] | JSX.Element | JSX.Element[]>

export class Parent {
	static countChildren(children: Children) {
		if (children === undefined || children === null) {
			return 0;
		} else if (Array.isArray(children)) {
			return children.length;
		} else {
			return 1;
		}
	}
}