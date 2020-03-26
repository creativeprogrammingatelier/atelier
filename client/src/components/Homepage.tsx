import React, { Fragment } from "react";
import {PanelButton} from "./general/PanelButton";
import {Frame} from "./frame/Frame";
import {AddCourse} from "./course/AddCourse";
import {Course} from "../../../models/api/Course";
import {Button, Jumbotron} from "react-bootstrap";
import {PermissionEnum} from "../../../models/enums/permissionEnum";
import {useCourses} from "../helpers/api/APIHooks";
import {Permissions} from "./general/Permissions";
import { CacheState } from "../helpers/api/Cache";
import { LoadingIcon } from "./general/loading/LoadingIcon";

export function Homepage() {
    const {courses, coursesState} = useCourses();

	return (
		<Frame title="Home" sidebar search>
			<Jumbotron>
				<h1>Home</h1>
				<p>Welcome to Atelyay!</p>
				<Button>Have a button!</Button>
			</Jumbotron>
			<div className="m-3">
                {coursesState === CacheState.Uninitialized || coursesState === CacheState.Loading ? <LoadingIcon /> : <Fragment />}
                {courses.map((course: Course) => <PanelButton
                    display={course.name}
                    location={`/course/${course.ID}`}
                    icon=''
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