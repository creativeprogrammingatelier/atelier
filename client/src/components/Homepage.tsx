import React, {useState} from 'react';
import {PanelButton} from './general/PanelButton'
import {Frame} from './frame/Frame';

interface CourseResponse {
	courseid : number,
	name : string
}

export function Homepage() {
	const [loading, setLoading] = useState(true);
	const [courses, setCourses] = useState(null as unknown as CourseResponse[]);

	fetch('/api/course/1')
		.then((response) => response.json())
		.then((data) => {
			setCourses(data);
			setLoading(false);
		});
	return (
		<Frame title="Homepage" user={{id:"1", name:"John Doe"}} sidebar>
			<p>Some introduction of sorts?</p>

			<div>
				<PanelButton display="Pearls of Computer Science" location="/course/1" icon=""/>
				<PanelButton display="Software Systems" location="/course/2" icon=""/>
				<PanelButton display="Network Systems" location="/course/3" icon=""/>
				<PanelButton display="Data and Information" location="/course/4" icon=""/>
				<PanelButton display="Computer Systems" location="/course/5" icon=""/>
				<PanelButton display="Intelligent Interaction Design" location="/course/6" icon=""/>
				<PanelButton display="Discrete Structures & Efficient Algorithms" location="/course/7" icon=""/>
				<PanelButton display="Programming Paradigms" location="/course/8" icon=""/>
			</div>
		</Frame>
	)
}