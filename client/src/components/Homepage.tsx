import React  from "react";
import {PanelButton} from "./general/PanelButton";
import {Frame} from "./frame/Frame";
import {Button, Jumbotron} from "react-bootstrap";
import {PermissionEnum} from "../../../models/enums/permissionEnum";
import {Permissions} from "./general/Permissions";
import {useCourses} from "../helpers/api/APIHooks";
import {Link} from "react-router-dom";
import {Cached} from "./general/loading/Cached";

export function Homepage() {
    const courses = useCourses();

	return (
		<Frame title="Home" sidebar search>
			<Jumbotron>
				<h1>Home</h1>
				<p>Welcome to Atelyay!</p>
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
                <Cached cache={courses} timeout={3600}>{
                    (course, state) => 
                        <PanelButton 
                            display={course.name} 
                            location={`/course/${course.ID}`}
                            state={state} />
                }</Cached>
			</div>
		</Frame>
	);
}