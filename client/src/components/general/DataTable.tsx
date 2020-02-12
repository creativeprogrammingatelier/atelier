import React from 'react';
import { Link } from 'react-router-dom';

interface DataTableProperties<T> {
    /** Title to show above the table */
    title: string,
    /** List of objects to display in the table */
    data: T[],
    /** List of columns in the table as a pair of the 
     *  title of that column and a function to render the
     *  item as a React element
     */
    table: Array<[string, (item: T) => (JSX.Element | string)]>,
    /** Function to create a link to an item */
    link?: ((item: T) => string)
}

/** A simple table, but probably providing more table-fucntionality
 *  in the future
 */
export function DataTable<T>({ title, data, table, link }: DataTableProperties<T>) {
    return (
        <div>
            <span>{title}</span>
            <table>
                <thead><tr>{table.map(([header, _]) => <th>{header}</th>)}</tr></thead>
                <tbody>
                    {data.map(item =>
                        <tr>
                            {table.map(([_, f]) => 
                                <td>
                                    {link !== undefined && link(item) !== null
                                     ? <Link to={link(item)}>{f(item)}</Link>
                                     : f(item)}
                                </td>)}
                        </tr>)}
                </tbody>
            </table>
        </div>
    );
}
