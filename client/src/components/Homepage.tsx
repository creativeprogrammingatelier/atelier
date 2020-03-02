import React from 'react';
import {PanelButton} from './general/PanelButton'
import {Frame} from './frame/Frame';
import {Loading} from "./general/loading/Loading";
import {AddCourse} from "./course/AddCourse";
import {Course} from "../../../models/database/Course";
import { getCourses } from '../../helpers/APIHelper';
import {Button, Jumbotron} from "react-bootstrap";

export function Homepage() {

	function updateCourse(course : Course) {
		// TODO: create new course in the api
	}

	return (
		<Frame title="Home" sidebar search="/search">
			<Jumbotron>
				<h1>Home</h1>
				<p>Welcome to this amazing website!</p>
				<Button>Have a button!</Button>
			</Jumbotron>
            <Loading<Course[]>
                loader={getCourses}
                component={courses => 
                    <div className="m-3">
                        {courses.map((course: Course) =>
	                        <PanelButton
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