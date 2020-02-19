import React, {useEffect, useState} from 'react';
import {PanelButton} from './general/PanelButton'
import {Frame} from './frame/Frame';
import {CourseResponse} from "../helpers/DatabaseResponseInterface";
import {Loading} from "./general/Loading";

export function Homepage() {
	const [loading, setLoading] = useState(true);
	const [courses, setCourses] = useState(null as unknown as CourseResponse[]);

	useEffect(() => {
		fetch('/api/courses/')
			.then((response) => response.json())
			.then((data) => {
				console.log(data);
				setCourses(data.courses);
				setLoading(false);
			});
	}, []);

	return (
		<Frame title="Homepage" user={{id:"1", name:"John Doe"}} sidebar>
			<p>Some introduction of sorts?</p>
			{
				(courses && !loading) ?
					<div>
						{
							courses.map((course) => {
								return (
									<PanelButton display={course.name} location={`/course/${course.courseId}`} icon=''/>
								)
							})
						}
					</div>
					:
					<Loading />
			}

		</Frame>
	)
}