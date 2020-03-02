import React from 'react';
import {PanelButton} from './general/PanelButton'
import {Frame} from './frame/Frame';
import {Loading} from "./general/loading/Loading";
import {AddCourse} from "./course/AddCourse";
import {Course} from "../../../models/database/Course";
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
                    <div className="m-3">
                        {courses.map((course: Course) => <PanelButton
	                            display={course.name === undefined ? "" : course.name}
	                            location={`/course/${course.courseID}`}
	                            icon=''
	                        />
                        )}
                    </div>
                }
            />
			<AddCourse handleResponse = {updateCourse} />

		</Frame>
	)
}