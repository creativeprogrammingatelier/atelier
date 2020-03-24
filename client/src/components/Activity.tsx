import React from 'react';
import { Frame } from './frame/Frame';
import { Jumbotron } from 'react-bootstrap';
import { Mention } from '../../../models/api/Mention';
import { Loading } from './general/loading/Loading';
import { getMentions } from '../../helpers/APIHelper';
import { DataBlockList } from './data/DataBlockList';

export function Activity() {
    return (
		<Frame title="Home" sidebar search>
			<Jumbotron>
				<h1>Activity</h1>
			</Jumbotron>
			<Loading<Mention[]>
				loader={() => getMentions()}
				component={mentions =>
					<DataBlockList
						header="Mentions"
						list={mentions.map(mention => ({
                            transport: 
                                mention.comment.references.fileID !== undefined
                                ? `/submission/${mention.references.submissionID}/${mention.comment.references.fileID}/comments#${mention.comment.references.commentThreadID}`
                                : `/submission/${mention.references.submissionID}#${mention.comment.references.commentThreadID}`, 
							title: `Mentioned by ${mention.comment.user.name} on ${mention.submissionTitle} in ${mention.courseName}`,
							text: mention.comment.text,
							time: new Date(mention.comment.created),
							tags: []
						}))}
					/>
				}
			/>
		</Frame>
    );
}