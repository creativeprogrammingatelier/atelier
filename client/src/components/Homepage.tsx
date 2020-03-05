import React from "react";
import {PanelButton} from "./general/PanelButton";
import {Frame} from "./frame/Frame";
import {Loading} from "./general/loading/Loading";
import {AddCourse} from "./course/AddCourse";
import {Course} from "../../../models/api/Course";
import {getCourses} from "../../helpers/APIHelper";
import {Button, Jumbotron} from "react-bootstrap";

export function Homepage() {

	function updateCourse(course: Course) {
		// TODO course added, but should be in the loading component
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
					<div>
						{courses.map((course: Course) => <PanelButton
							display={course.name}
							location={`/course/${course.ID}`}
							icon=''
						/>)}
					</div>
				}
			/>
			<div className="m-3">
				<AddCourse handleResponse={updateCourse}/>
			</div>
		</Frame>
	);
}