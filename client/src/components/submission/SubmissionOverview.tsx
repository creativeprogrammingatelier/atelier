import React, {useState} from 'react';

import {CodeTab} from './CodeTab';
import {CommentTab} from './CommentTab';
import {ShareTab} from './ShareTab';
import {TabBar} from './TabBar';
import * as queryString from "querystring";
import {ProjectTab} from "./ProjectTab";
import {Frame} from '../frame/Frame';

export function SubmissionOverview(props : any) {
    // Check url parameters such as ?tab=Comments
    const params = queryString.parse(props.location.search.slice(1));
    const tabParameter : string = params['tab'] as string;
    const fileParameter : string = params['file'] as string;

    // Keep track of the current tab (project/code/comment/share)
    const [tab, setTab] = useState(tabParameter == undefined ? 'Project' : tabParameter);
    // Keep track of code being viewed
    const [file, setFile] = useState(fileParameter == undefined ? '' : fileParameter);

    // Handle events to the tab buttons here
    function handleTabChange(event : any) {
        const {value} = event.target;
        setTab(value);
        console.log('Switching to ' + value + ' tab');
        event.preventDefault();
    }

    function changeFile(file : string) {
        setFile(file);
        setTab('Code');
    }

    // Display certain tab
    let currentTab = <div><h1>Tab not found!</h1></div>;
    if (tab == 'Code') {
        currentTab =  <CodeTab fileName={file}/>
    } else if (tab == 'Comments') {
        currentTab =  <CommentTab />
    } else if (tab == 'Share') {
        currentTab = <ShareTab />
    } else if (tab == 'Project') {
        currentTab = <ProjectTab setFile = {changeFile}/>
    }

    return (
        <Frame title="Submission" user={{id:"1", name:"John Doe"}} sidebar search={"/submission/../search"}>
            <TabBar onClick={handleTabChange}/>
            <hr/>
            {currentTab}
        </Frame>
    )
}

