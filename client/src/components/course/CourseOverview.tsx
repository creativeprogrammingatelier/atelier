import React from 'react';
import {Frame} from '../frame/Frame';
import {DataList} from '../general/DataList';

export function CourseOverview() {
	return (
		<Frame title="Course" user={{id:"0", name:"John Doe"}} sidebar search={"/course/../search"}>
			<h1>Course Overview</h1>
			<DataList header="Submissions" list={[
				{
					transport: "submission/1",
					title: "John Doe",
					text: "Uploaded helpitbroke.zip",
					time: new Date(),
					tags: [{name:"help", color:"red", dark:true}, {name:"me", color:"red", dark:true}, {name:"now", color:"red", dark:true}]
				},
				{
					transport: "submission/2",
					title: "Jane Doe",
					text: "Uploaded project 'ImDaBest'",
					// time: new Date(),
					time: new Date(2020, 1, 17, 15),
					tags: [{name:"fuck", color:"green", dark:true}, {name:"yeah", color:"green", dark:true}]
				},
				{
					transport: "submission/3",
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