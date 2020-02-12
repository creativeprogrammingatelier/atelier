import React from 'react';

export function TabButton(props: any) {
    return (
        <button
            value={props.value}
            onClick={props.onClick}
        >
            {props.name}
        </button>
    )
}