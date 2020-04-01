import React  from "react";
import {Panel} from "./general/Panel";
import {Frame} from "./frame/Frame";
import {CourseCreator} from "./settings/system/CourseCreator";
import {Button, Jumbotron} from "react-bootstrap";
import {containsPermissionAny, PermissionEnum} from "../../../models/enums/permissionEnum";
import {Permissions} from "./general/Permissions";
import { useCourses } from "../helpers/api/APIHooks";
import { CachedList } from "./general/loading/CachedList";
import {Loading} from "./general/loading/Loading";
import {Permission} from "../../../models/api/Permission";
import {permission} from "../../helpers/APIHelper";
import {Link} from "react-router-dom";

export function Homepage() {
    const {courses, refreshCourses} = useCourses();

	return (
		<Frame title="Home" sidebar search>
			<Jumbotron>
				<h1>Home</h1>
				<p>Welcome to Atelyay!</p>
				<Loading<Permission>
					loader={permission}
					component={permission =>
						containsPermissionAny([
							PermissionEnum.addCourses,
							PermissionEnum.manageUserPermissionsView,
							PermissionEnum.manageUserPermissionsManager,
							PermissionEnum.manageUserRole,
							PermissionEnum.managePlugins
						], permission.permissions) &&
						<Link to="/admin/settings"><Button>System settings</Button></Link>}
					wrapper={() => null}
				/>
			</Jumbotron>
			<div className="m-3">
				{/* TODO: Add a NonEmpty wrapper for if the user is not enrolled in any course */}
                <CachedList collection={courses} refresh={refreshCourses} timeout={3600}>{
                    course => 
                        <Panel
                            display={course.item.name} 
                            location={`/course/${course.item.ID}`}
                            state={course.state}
                        />
                }</CachedList>
			</div>
		</Frame>
	);
}