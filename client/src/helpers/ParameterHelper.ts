import {Sorting} from "../../../models/enums/SortingEnum";

export class ParameterHelper {
	static getQueryParameters(parameters: string) {
		// Convert a query parameter string into a key-value object
		const query: {[key: string]: string} = {};
		const pairs = (parameters[0] === '?' ? parameters.substr(1) : parameters).split('&');
		for (let i = 0; i < pairs.length; i++) {
			const pair = pairs[i].split('=');
			query[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1] || '');
		}
		return query;
	}
	static createQueryParameters(parameters: {[key: string]: string | number | boolean | undefined}) {
		// Convert a key-value object into a string of query parameters
		if (!parameters) {
			return "";
		}
		const items = Object.keys(parameters)
			.filter(key => parameters[key] !== undefined)
			.map(key => encodeURIComponent(key) + "=" + encodeURIComponent(parameters[key]!));
		if (items.length > 0) {
			return "?" + items.join("&");
		} else {
			return "";
		}
	}
	static createSearchParameters(parameters: SearchParameters) {
		return ParameterHelper.createQueryParameters(parameters);
	}
	static nameParameters(parameters: {[key: string]: string}, names: {[key: string]: string}) {
		const result: {[key: string]: string} = {};
		for (const [parameter, value] of Object.entries(parameters)) {
			if (parameter in names) {
				result[names[parameter]] = value;
			} else {
				result[parameter] = value;
			}
		}
		return result;
	}
}
interface SearchParameters {
	[key: string]: string | number | Sorting | undefined,
	q: string,
	limit?: number,
	offset?: number,
	sorting?: Sorting,
	courseID?: string,
	userID?: string,
	submissionID?: string
}