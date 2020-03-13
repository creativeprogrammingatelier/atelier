export interface ParentalProperties {
	children?:
		| boolean
		| boolean[] 
		| number 
		| number[] 
		| string 
		| string[] 
		| JSX.Element 
		| JSX.Element[]
		| Array<undefined | string>
		| Array<boolean | string>
		| Array<number | string>
		| Array<undefined | JSX.Element>
		| Array<boolean | JSX.Element>
		| Array<number | JSX.Element>
		| Array<string | JSX.Element>
}