import React from 'react';
import {TabButton} from "./TabButton";

export function TabBar(props : any) {
    return (
        <div>
            <TabButton
                value= ""
                name = "Project"
                onClick = {props.onClick}
            />
            <TabButton
                value = "code"
                name = "Code"
                onClick = {props.onClick}
            />
            <TabButton
                value = "comments"
                name = "Comments"
                onClick = {props.onClick}
            />
            <TabButton
                value = "share"
                name = "Share"
                onClick = {props.onClick}
            />
        </div>
    )
}