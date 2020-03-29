import React from 'react';
import { Frame } from './frame/Frame';
import { Jumbotron } from 'react-bootstrap';
import { useMentions } from '../helpers/api/APIHooks';
import { CachedDataBlockList } from './general/loading/CachedDataBlockList';

export function Activity() {
    const {mentions, refreshMentions} = useMentions();

    return (
		<Frame title="Home" sidebar search>
			<Jumbotron>
				<h1>Activity</h1>
			</Jumbotron>
			<CachedDataBlockList
                header="Mentions"
                collection={mentions}
                refresh={refreshMentions}
                timeout={30}
                map={({ item: mention }) => ({
                    transport: 
                        mention.comment.references.fileID !== undefined
                        ? `/submission/${mention.references.submissionID}/${mention.comment.references.fileID}/comments#${mention.comment.references.commentThreadID}`
                        : `/submission/${mention.references.submissionID}#${mention.comment.references.commentThreadID}`, 
                    title: `Mentioned by ${mention.comment.user.name} on ${mention.submissionTitle} in ${mention.courseName}`,
                    text: mention.comment.text,
                    time: new Date(mention.comment.created)
                })}
            />
		</Frame>
    );
}