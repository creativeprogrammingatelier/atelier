import React, {useState} from 'react';

import {CodeTab} from './CodeTab';
import {CommentTab} from './CommentTab';
import {ShareTab} from './ShareTab';
import {TabBar} from './TabBar';
import * as queryString from "querystring";

export function SubmissionOverview(props : any) {
    const params = queryString.parse(props.location.search.slice(1));
    console.log(params);

    // Keep track of the current tab (project/code/comment/share)
    const [tab, setTab] = useState('Code');

    // Handle events to the tab buttons here
    function handleTabChange(event : any) {
        const {value} = event.target;
        setTab(value);
        console.log('Switching to ' + value + ' tab');
    }

    // Display certain tab
    let currentTab = <div><h1>Tab not found!</h1></div>;
    if (tab == 'Code') {
        currentTab =  <CodeTab />
    } else if (tab == 'Comments') {
        currentTab =  <CommentTab />
    } else if (tab == 'Share') {
        currentTab = <ShareTab />
    }

    return (
        <div>
            <TabBar onClick={handleTabChange}/>
            <hr/>
            {currentTab}
        </div>
    )
}

