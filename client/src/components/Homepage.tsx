import React, {useEffect, useState} from 'react';
import {PanelButton} from './general/PanelButton'
import {Frame} from './frame/Frame';
import {CourseResponse} from "../helpers/DatabaseResponseInterface";
import {Loading} from "./general/Loading";
import {AddCourse} from "./course/AddCourse";
import {Course} from "../../../models/course";
import AuthHelper from './../../helpers/AuthHelper';

export function Homepage() {
	const [loading, setLoading] = useState(true);
	const [courses, setCourses] = useState(null as unknown as Course[]);

	// Retrieve courses
	useEffect(() => {
		AuthHelper.fetch('/api/courses/')
			.then((response) => response.json())
			.then((courses) => {
				console.log(courses);
				setCourses(courses);
				setLoading(false);
			});
	}, []);

	function updateCourse(course : Course) {
		setCourses(courses => [
			...courses,
			course
		])
	}

	return (
		<Frame title="Homepage" user={{id:"1", name:"John Doe"}} sidebar>
			<p>Some introduction of sorts?</p>
			{
				(courses && !loading) ?
					<div>
						{
							courses.map((course: Course) => {
								return (
									<PanelButton
										display={course.name == undefined ? "" : course.name}
										location={`/course/${course.courseID}`}
										icon=''/>
								)
							})
						}
					</div>
					:
					<Loading />
			}
			<AddCourse handleResponse = {updateCourse} />

		</Frame>
	)
}