import React, {useEffect, useState} from "react";
import {PanelButton} from "./general/PanelButton";
import {Frame} from "./frame/Frame";
import {Loading} from "./general/loading/Loading";
import {AddCourse} from "./course/AddCourse";
import {Course} from "../../../models/api/Course";
import {getCourses, permission} from "../../helpers/APIHelper";
import {Button, Jumbotron} from "react-bootstrap";
import {Permission} from "../../../models/api/Permission";
import {PermissionEnum} from "../../../models/enums/permissionEnum";
import { useCourses } from "../helpers/api/APIHooks";

export function Homepage() {
	const [permissions, setPermissions] = useState(0);
    const {courses} = useCourses();

 	useEffect(() => {
 		permission()
			.then((permission : Permission) => {
				setPermissions(permission.permissions);
			});
	}, []);

	return (
		<Frame title="Home" sidebar search>
			<Jumbotron>
				<h1>Home</h1>
				<p>Welcome to Atelyay!</p>
				<Button>Have a button!</Button>
			</Jumbotron>
			<div className="m-3">
                {courses.map((course: Course) => <PanelButton
                    display={course.name}
                    location={`/course/${course.ID}`}
                    icon=''
                />)}
			</div>
			{
				((permissions & (1 << PermissionEnum.addCourses)) > 0) &&
					<div className="m-3">
						<AddCourse />
					</div>
			}
		</Frame>
	);
}