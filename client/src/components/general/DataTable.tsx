import React from 'react';

interface DataTableProperties<T> {
    /** Defines the table head, as a pair of the display 
     *  title and the property in the data 
     */
    head: Array<[string, string]>,
    /** List of objects to display in the table */
    data: T[]
}

/** A simple table, but probably providing more table-fucntionality
 *  in the future
 */
export function DataTable<T>({ head, data }: DataTableProperties<T>) {
    return (
        <table>
            <thead><tr>{head.map(([text, _]) => <th>{text}</th>)}</tr></thead>
            <tbody>
                {data.map(item =>
                    <tr>
                        {head.map(([_, prop]) => <td>{item[prop]}</td>)}
                    </tr>)}
            </tbody>
        </table>
    );
}
