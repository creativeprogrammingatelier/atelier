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

export function Homepage() {
	const [permissions, setPermissions] = useState(0);
    const [reload, updateReload] = useState(0);

 	useEffect(() => {
 		permission()
			.then((permission : Permission) => {
				setPermissions(permission.permissions);
			});
	}, []);

	function updateCourse(course: Course) {
		updateReload(x => x + 1);
	}

	return (
		<Frame title="Home" sidebar search="/search">
			<Jumbotron>
				<h1>Home</h1>
				<p>Welcome to Atelyay!</p>
				<Button>Have a button!</Button>
			</Jumbotron>
			<div className="m-3">
				<Loading<Course[]>
                    loader={reload => getCourses(false)}
                    params={[reload]}
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
			</div>
			{
				((permissions & (1 << PermissionEnum.addCourses)) > 0) &&
					<div className="m-3">
						<AddCourse handleResponse={updateCourse}/>
					</div>
			}
		</Frame>
	);
}