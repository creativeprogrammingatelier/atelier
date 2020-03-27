import React, { Fragment } from "react";
import {PanelButton} from "./general/PanelButton";
import {Frame} from "./frame/Frame";
import {AddCourse} from "./course/AddCourse";
import {Button, Jumbotron} from "react-bootstrap";
import {PermissionEnum} from "../../../models/enums/permissionEnum";
import {useCourses} from "../helpers/api/API";
import {Permissions} from "./general/Permissions";
import { LoadingIcon } from "./general/loading/LoadingIcon";

export function Homepage() {
    const {courses} = useCourses();

	return (
		<Frame title="Home" sidebar search>
			<Jumbotron>
				<h1>Home</h1>
				<p>Welcome to Atelyay!</p>
				<Button>Have a button!</Button>
			</Jumbotron>
			<div className="m-3">
                {courses.state === "Uninitialized" || courses.state === "Loading" ? <LoadingIcon /> : <Fragment />}
                {courses.items.map(course => <PanelButton
                    display={course.item.name}
                    location={`/course/${course.item.ID}`}
                    state={course.state}
                />)}
			</div>
			<Permissions required={PermissionEnum.addCourses}>
                <div className="m-3">
                    <AddCourse />
                </div>
            </Permissions>
		</Frame>
	);
}