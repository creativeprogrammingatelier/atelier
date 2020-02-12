import React from 'react';
import { Link } from 'react-router-dom';

interface DataTableProperties<T> {
    /** Title to show above the table */
    title: string,
    /** List of objects to display in the table */
    data: T[],
    /** List of columns in the table as a pair of the 
     *  title of that column and a function to render the
     *  item as a React element and an optional third element
     *  that defines a link for this element
     */
    table: Array<{
        0: string;
        1: (item: T) => (JSX.Element | string);
        2?: (item: T) => (string | null);
    }>
}

/** A simple table, but probably providing more table-fucntionality
 *  in the future
 */
export function DataTable<T>({ title, data, table }: DataTableProperties<T>) {
    return (
        <div>
            <span>{title}</span>
            <table>
                <thead><tr>{table.map(({ 0: header }) => <th>{header}</th>)}</tr></thead>
                <tbody>
                    {data.map(item =>
                        <tr>
                            {table.map(({ 1: render, 2: link }) => {
                                if (link !== undefined) {
                                    const url = link(item);
                                    if (url !== null) {
                                        return <td><Link to={link(item)!}>{render(item)}</Link></td>;
                                    }
                                }
                                return <td>render(item)</td>;
                            })}
                        </tr>)}
                </tbody>
            </table>
        </div>
    );
}
