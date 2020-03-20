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
	| Array<null | string>
	| Array<undefined | string>
	| Array<boolean | string>
	| Array<number | string>
	| Array<null | JSX.Element>
	| Array<undefined | JSX.Element>
	| Array<boolean | JSX.Element>
	| Array<number | JSX.Element>
	| Array<string | JSX.Element>
	| Array<boolean | undefined | JSX.Element>
	| Array<boolean | null | JSX.Element>
	| Array<boolean | number | JSX.Element>
	| Array<boolean | string | JSX.Element>
	| Array<number | undefined | JSX.Element>
	| Array<number | null | JSX.Element>
	| Array<number | string | JSX.Element>
	| Array<string | undefined | JSX.Element>
	| Array<string | null | JSX.Element>

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