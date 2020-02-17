import React, {useState} from 'react';

import {CodeTab} from './CodeTab';
import {CommentTab} from './CommentTab';
import {ShareTab} from './ShareTab';
import {TabBar} from './TabBar';
import {Frame} from '../frame/Frame';

export function SubmissionOverview() {
    const [tab, setTab] = useState('Code');

    function handleTabChange(event : any) {
        const {value} = event.target;
        setTab(value);
        console.log('Switching to ' + value + ' tab');
    }

    let currentTab = <div><h1>Tab not found!</h1></div>;
    if (tab == 'Code') {
        currentTab =  <CodeTab />
    } else if (tab == 'Comments') {
        currentTab =  <CommentTab />
    } else if (tab == 'Share') {
        currentTab = <ShareTab />
    }

    return (
        <Frame title="Submission" user="John Doe" sidebar={true} search={true}>
            <TabBar onClick={handleTabChange}/>
            <hr/>
            {currentTab}
        </Frame>
    )
}

