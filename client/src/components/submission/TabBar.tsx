import React from 'react';
import {TabButton} from "./TabButton";

export function TabBar(props : any) {
    return (
        <div>
            <TabButton
                value= "Project"
                name = "Project"
                onClick = {props.onClick}
            />
            <TabButton
                value = "Code"
                name = "Code"
                onClick = {props.onClick}
            />
            <TabButton
                value = "Comments"
                name = "Comments"
                onClick = {props.onClick}
            />
            <TabButton
                value = "Share"
                name = "Share"
                onClick = {props.onClick}
            />
        </div>
    )
}