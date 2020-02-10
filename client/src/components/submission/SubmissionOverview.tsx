import React from 'react';

import {CodeTab} from './CodeTab';
import {CommentTab} from './CommentTab';
import {ShareTab} from './ShareTab';
import {TabBar} from './TabBar';

export function SubmissionOverview() {
    return (
        <div>
            <CodeTab />
            <hr/>
            <CommentTab />
            <hr/>
            <ShareTab />
            <hr/>
            <TabBar />
        </div>
    )
}

