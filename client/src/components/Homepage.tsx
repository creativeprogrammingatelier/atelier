import React from 'react';
import {PanelButton} from './general/PanelButton'
import {Frame} from './frame/Frame';
import {Loading} from "./general/Loading";
import {AddCourse} from "./course/AddCourse";
import {Course} from "../../../models/api/Course";
import { getCourses } from '../../helpers/APIHelper';

export function Homepage() {

	function updateCourse(course : Course) {
		// TODO: create new course in the api
	}

	return (
		<Frame title="Homepage" sidebar>
            <Loading<Course[]>
                loader={getCourses}
                component={courses => 
                    <div>
                        {
                            courses.map((course: Course) => {
                                return (
                                    <PanelButton
                                        display={course.name}
                                        location={`/course/${course.ID}`}
                                        icon=''/>
                                )
                            })
                        }
                    </div> } />
			<AddCourse handleResponse = {updateCourse} />
		</Frame>
	)
}