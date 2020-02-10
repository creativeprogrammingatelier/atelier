import React from 'react';
import {TabButton} from "./TabButton";

function handleClick(event : any) {
    const {value} = event.target;
    console.log("Switching to " + value + " tab");
}

export function TabBar() {
    return (
        <div>
            <h4>Tab BAR</h4>
            <TabButton
                value = "Code"
                name = "Code"
                onClick = {handleClick}
            />
            <TabButton
                value = "Comments"
                name = "Comments"
                onClick = {handleClick}
            />
            <TabButton
                value = "Share"
                name = "Share"
                onClick = {handleClick}
            />
        </div>
    )
}