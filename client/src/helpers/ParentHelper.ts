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
		| Array<boolean | string>
		| Array<number | string>
		| Array<boolean | JSX.Element>
		| Array<number | JSX.Element>
		| Array<string | JSX.Element>
}