import {Sorting} from "../../../models/enums/SortingEnum";

/**
 * Object for handling parameters.
 */
export class ParameterHelper {
    /**
     * Convert a query parameter string into a key-value object
     *
     * @param parameters Parameter string to be converted
     * @returns Key-Value object representation of string.
     */
    static getQueryParameters(parameters: string) {
        const query: {[key: string]: string} = {};
        const pairs = (parameters[0] === "?" ? parameters.substr(1) : parameters).split("&");
        for (let i = 0; i < pairs.length; i++) {
            const pair = pairs[i].split("=");
            query[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1] || "");
        }
        return query;
    }
    /**
     * Convert a key-value object into a string of query parameters
     *
     * @param parameters Key-Value object to be converted to string.
     * @returns String representation of key-value object.
     */
    static createQueryParameters(parameters: {[key: string]: string | number | boolean | undefined}) {
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
    /**
     * Convert key-value object into a string of query parameters.
     *
     * @param parameters Key-value object to be converted.
     * @returns String of query parameters.
     */
    static createSearchParameters(parameters: SearchParameters) {
        return ParameterHelper.createQueryParameters(parameters);
    }
    /**
     * Inserts the keys from one key-value object into another.
     *
     * @param parameters The key-value object to be populated.
     * @param names The key-value object to be inserted.
     * @returns key-value object with the keys from the 'name' object inserted into params.
     */
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
    /** Key-Value object containing query parameters*/
    [key: string]: string | number | Sorting | undefined,
    q: string,
    /** Search Limit */
    limit?: number,
    /** Search Offset */
    offset?: number,
    /** Which order Search must be sorted*/
    sorting?: Sorting,
    /** CourseID of Search */
    courseID?: string,
    /** UserID of Search */
    userID?: string,
    /** SubmissionID of Search */
    submissionID?: string
}

export interface PaginationParameters {
    /** Pagination Limit */
    limit?: number,
    /** Pagination Offset */
    offset?: number,
    /** Space after pagination */
    after?: number,
    /** Space before pagination */
    before?: number
}
