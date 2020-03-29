import React, { Fragment } from "react";
import {PanelButton} from "./general/PanelButton";
import {Frame} from "./frame/Frame";
import {AddCourse} from "./course/AddCourse";
import {Button, Jumbotron} from "react-bootstrap";
import {PermissionEnum} from "../../../models/enums/permissionEnum";
import {Permissions} from "./general/Permissions";
import { useCourses } from "../helpers/api/APIHooks";
import { CachedList } from "./general/loading/CachedList";

export function Homepage() {
    const {courses, refreshCourses} = useCourses();

	return (
		<Frame title="Home" sidebar search>
			<Jumbotron>
				<h1>Home</h1>
				<p>Welcome to Atelyay!</p>
				<Button>Have a button!</Button>
			</Jumbotron>
            <CachedList collection={courses} refresh={refreshCourses} timeout={3600}>{
                course => 
                    <PanelButton 
                        display={course.item.name} 
                        location={`/course/${course.item.ID}`}
                        state={course.state} />
            }</CachedList>
			<Permissions required={PermissionEnum.addCourses}>
                <div className="m-3">
                    <AddCourse />
                </div>
            </Permissions>
		</Frame>
	);
}