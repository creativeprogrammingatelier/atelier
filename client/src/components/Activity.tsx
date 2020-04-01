import React from 'react';
import { Frame } from './frame/Frame';
import { Jumbotron } from 'react-bootstrap';
import { useMentions } from '../helpers/api/APIHooks';
import { DataList } from './data/DataList';
import { Cached } from './general/loading/Cached';
import { DataBlock } from './data/DataBlock';

export function Activity() {
    const mentions = useMentions();

    return (
		<Frame title="Home" sidebar search>
			<Jumbotron>
				<h1>Activity</h1>
			</Jumbotron>
            <DataList header="Mentions">
                <Cached cache={mentions} timeout={30}>{mention => 
                    <DataBlock
                        key={mention.ID}
                        title={`Mentioned by ${mention.comment.user.name} on ${mention.submissionTitle} in ${mention.courseName}`}
                        text={mention.comment.text}
                        time={new Date(mention.comment.created)}
                        transport={
                            mention.comment.references.fileID !== undefined
                            ? `/submission/${mention.references.submissionID}/${mention.comment.references.fileID}/comments#${mention.comment.references.commentThreadID}`
                            : `/submission/${mention.references.submissionID}#${mention.comment.references.commentThreadID}`
                        } />
                }</Cached>
            </DataList>
		</Frame>
    );
}