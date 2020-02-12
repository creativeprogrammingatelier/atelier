import React from 'react';

interface DataTableProperties<T> {
    /** Title to show above the table */
    title: string,
    /** List of objects to display in the table */
    data: T[],
    /** List of columns in the table as a pair of the 
     *  title of that column and a function to render the
     *  item as a React element
     */
    table: Array<[string, (item: T) => (JSX.Element | string)]>
}

/** A simple table, but probably providing more table-fucntionality
 *  in the future
 */
export function DataTable<T>({ title, data, table }: DataTableProperties<T>) {
    return (
        <div>
            <span>{title}</span>
            <table>
                <thead><tr>{table.map(([header, _]) => <th>{header}</th>)}</tr></thead>
                <tbody>
                    {data.map(item =>
                        <tr>
                            {table.map(([_, f]) => <td>{f(item)}</td>)}
                        </tr>)}
                </tbody>
            </table>
        </div>
    );
}
