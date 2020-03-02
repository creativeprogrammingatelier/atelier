import React from 'react';
import {Frame} from '../frame/Frame';
import {DataBlockList} from '../general/data/DataBlockList';
import {Loading} from '../general/loading/Loading';
import {Submission} from "../../../../models/database/Submission";
import { getCourseSubmissions } from '../../../helpers/APIHelper';
import {Jumbotron} from "react-bootstrap";

interface CourseOverviewProps {
	match: {
		params: {
			courseId: string
		}
	}
}

export function CourseOverview({match}: CourseOverviewProps) {
	return (
		<Frame title="Course" sidebar search={"/course/../search"}>
			<Jumbotron>
				<h1>Long Course Name Here</h1>
				<p>Created by someone?</p>
			</Jumbotron>
			<Loading<Submission[]>
                loader={getCourseSubmissions}
                params={[match.params.courseId]}
                component={submissions =>
                    <DataBlockList
                        header="Submissions"
                        list={submissions.map(submission => {
                            console.log(submission);
                            return {
                                transport: `/submission/${submission.submissionID}`,
                                title: submission.name === undefined ? "" : submission.name,
                                text: submission.name === undefined ? "" : submission.name,
                                time: submission.date === undefined ? new Date() : new Date(submission.date),
                                tags : []
                                //tags: submission.tags
                            };
                        })}
                    />} />
		</Frame>
	);
}