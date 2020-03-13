export interface ParentalProperties {
	children?:
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
}