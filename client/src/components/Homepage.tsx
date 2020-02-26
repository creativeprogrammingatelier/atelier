import React from 'react';
import {PanelButton} from './general/PanelButton'
import {Frame} from './frame/Frame';
import {Loading} from "./general/Loading";
import {AddCourse} from "./course/AddCourse";
import {Course} from "../../../models/database/Course";
import AuthHelper from './../../helpers/AuthHelper';
import { Fetch } from '../../helpers/FetchHelper';

export function Homepage() {

	// Retrieve courses
	const getCourses = () => Fetch.fetchJson<Course[]>('/api/courses/');

	function updateCourse(course : Course) {
		// TODO: create new course in the api
	}

	return (
		<Frame title="Homepage" user={{id:"1", name:"John Doe"}} sidebar>
			<p>Some introduction of sorts?</p>
            <Loading<Course[]>
                loader={getCourses}
                component={courses => 
                    <div>
                        {
                            courses.map((course: Course) => {
                                return (
                                    <PanelButton
                                        display={course.name === undefined ? "" : course.name}
                                        location={`/course/${course.courseID}`}
                                        icon=''/>
                                )
                            })
                        }
                    </div> } />
			<AddCourse handleResponse = {updateCourse} />

		</Frame>
	)
}