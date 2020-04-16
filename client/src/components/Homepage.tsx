import React from "react";
import {Link} from "react-router-dom";
import {Button, Jumbotron} from "react-bootstrap";

import {PermissionEnum} from "../../../models/enums/PermissionEnum";

import {useCourses} from "../helpers/api/APIHooks";

import {Frame} from "./frame/Frame";
import {Cached} from "./general/loading/Cached";
import {Panel} from "./general/Panel";
import {Permissions} from "./general/Permissions";

export function Homepage() {
	const courses = useCourses();
	
	return <Frame title="Home" sidebar search>
		<Jumbotron>
			<h1>Home</h1>
			<p>Welcome to Atelier!</p>
			<Permissions any={[
				PermissionEnum.addCourses,
				PermissionEnum.manageUserPermissionsView,
				PermissionEnum.manageUserPermissionsManager,
				PermissionEnum.manageUserRole,
				PermissionEnum.managePlugins]}>
				<Link to="/admin/settings"><Button>System settings</Button></Link>
			</Permissions>
		</Jumbotron>
		<div className="m-3">
			{/* TODO: Add a NonEmpty wrapper for if the user is not enrolled in any course */}
			<Cached cache={courses} timeout={3600}>
				{(course, state) =>
					<Panel
						key={course.ID}
						display={course.name}
						location={`/course/${course.ID}`}
						state={state}
					/>
				}
			</Cached>
		</div>
	</Frame>;
}