import React from 'react';
import {DataTable} from "../general/DataTable";
import {submissionData, submissionRendering} from "../../helpers/SubmissionHelpers";
import {Frame} from '../frame/Frame';
import {DataList} from '../general/DataList';

const submissions = {
	title: 'Course Submissions',
	data: submissionData.submissions,
	table: submissionRendering
};

export function CourseOverview() {
	return (
		<Frame title="Course" user={{id:"0", name:"John Doe"}} sidebar search={"/course/../search"}>
			<h1>Course Overview</h1>
			{/*<DataTable*/}
			{/*    title={submissions.title}*/}
			{/*    data={submissions.data}*/}
			{/*    table={submissions.table}*/}
			{/*/>*/}
			<DataList header="Submissions" list={[
				{
					title: "John Doe",
					text: "Uploaded helpitbroke.zip",
					time: new Date(),
					// time: new Date(2020, 2, 18, 9),
					tags: [{name:"help", color:"red"}, {name:"me", color:"red"}, {name:"now", color:"red"}]
				},
				{
					title: "Jane Doe",
					text: "Uploaded project 'ImDaBest'",
					// time: new Date(),
					time: new Date(2020, 1, 17, 15),
					tags: [{name:"fuck", color:"green"}, {name:"yeah", color:"green"}]
				},
				{
					title: "Mary Doe",
					text: "Uploaded project 'ImmaDropOutNow'",
					// time: new Date(),
					time: new Date(2020, 0, 9, 15),
					tags: [{name:"fuck", color:"orange"}, {name:"off", color:"orange"}]
				}
			]}/>
		</Frame>
	)
}