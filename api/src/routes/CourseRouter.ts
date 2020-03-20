/**
 * Api routes relating to a course
 */

import express, {Request, Response} from "express";
import {CourseDB} from "../database/CourseDB";
import {CoursePartial} from "../../../models/api/Course";
import {AuthMiddleware} from "../middleware/AuthMiddleware";
import {capture} from "../helpers/ErrorHelper";
import {courseState} from "../../../models/enums/courseStateEnum";
import {getCurrentUserID} from "../helpers/AuthenticationHelper";
import {courseRole} from "../../../models/enums/courseRoleEnum";
import {CourseRegistrationDB} from "../database/CourseRegistrationDB";
import {getClient, transaction} from "../database/HelperDB";
import {requirePermission, requireRegistered} from "../helpers/PermissionHelper";
import {PermissionEnum} from "../../../models/enums/permissionEnum";
import {filterCourse} from "../helpers/APIFilterHelper";
import { CourseUser } from "../../../models/api/CourseUser";

export const courseRouter = express.Router();

// Authentication is required for all endpoints
courseRouter.use(AuthMiddleware.requireAuth);

/** ---------- GET REQUESTS ---------- */

/**
 * Get user courses
 * - notes:
 *  - requires permissions to view all courses
 */
courseRouter.get("/", capture(async(request: Request, response: Response) => {
	const userID : string = await getCurrentUserID(request);
	const courses : CoursePartial[] = await CourseDB.getAllCourses();
	const enrolled : string[] = (await CourseRegistrationDB.getEntriesByUser(userID)).filter(item =>{
		return item.permission.courseRole !== courseRole.unregistered
	}).map((course : CourseUser) => course.courseID);
	response.status(200).send(await filterCourse(courses, enrolled, userID));
}));

/**
 * Get user courses
 *  - admin: receives all of the users courses
 *  - user self: receives all of the users courses
 *  - rest: not allowed
 */
courseRouter.get("/user/:userID", capture(async(request: Request, response: Response) => {
	const userID = request.params.userID;
	// TODO: Authentication, only admins and the user itself should be able to see this
	const enrolledCourses = (await CourseRegistrationDB.getEntriesByUser(userID)).map((course: CourseUser) => course.courseID);
	const courses = (await CourseDB.getAllCourses()).filter((course: CoursePartial) => enrolledCourses.includes(course.ID));
	response.status(200).send(courses);
	// TODO: Error handling
}));

/**
 * Get a specific course
 * - requirements:
 *  - user is enrolled in the course
 */
courseRouter.get("/:courseID", capture(async(request: Request, response: Response) => {
	const courseID : string = request.params.courseID;
	const course : CoursePartial = await CourseDB.getCourseByID(courseID);
	const currentUserID : string = await getCurrentUserID(request);

	// User should be registered in the course
	await requireRegistered(currentUserID, courseID);

	response.status(200).send(course);
}));

/** ---------- POST REQUESTS ---------- */

/**
 * Create a course
 * - requirements:
 *  - AddCourses permission
 */
courseRouter.post('/', capture(async(request : Request, response : Response) => {
	const name : string = request.body.name;
	const state : courseState = request.body.state;
	const currentUserID : string = await getCurrentUserID(request);

	// Requires addCourses permission
	await requirePermission(currentUserID, PermissionEnum.addCourses);

	const course = await transaction(async client => {
		const course : CoursePartial = await CourseDB.addCourse({
			courseName : name,
			state,
			creatorID : currentUserID,
			client
		});

		await CourseRegistrationDB.addEntry({
			courseID : course.ID,
			userID : currentUserID,
			courseRole : courseRole.student,
			client
		});

        return course;
    });

    response.status(200).send(course);
}));

/** ---------- PUT REQUESTS ---------- */

/**
 * Update name/state of a course
 *  - requirements:
 *   - manageCourses permission
 */
courseRouter.put('/:courseID', capture(async(request : Request, response : Response) => {
	const courseID : string = request.params.courseID;
	const currentUserID : string = await getCurrentUserID(request);
	const name : string | undefined = request.body.name;
	const state : courseState | undefined = request.body.state as courseState;

	// Require manageCourses permission
	await requirePermission(currentUserID, PermissionEnum.manageCourses, courseID);

	const course : CoursePartial = await CourseDB.updateCourse({
		courseID,
		courseName : name,
		state
	});

	response.status(200).send(course);
}));

/**
 * Join a user in a course
 * - requirements:
 *  - manageUserRegistration permission
 */
courseRouter.put('/:courseID/user/:userID', capture(async(request : Request, response : Response) => {
	const courseID : string = request.params.courseID;
	const userID : string = request.params.userID;
	const currentUserID : string = await getCurrentUserID(request);

	// Require manageUserRegistration permission
	await requirePermission(currentUserID, PermissionEnum.manageUserRegistration, courseID);

	const courseRegistration : CourseUser = await CourseRegistrationDB.addEntry({
		courseID,
		userID,
		courseRole : courseRole.student
	});
	response.status(200).send(courseRegistration);
}));

/** ---------- DELETE REQUESTS ---------- */
courseRouter.delete('/:courseID/user/:userID', capture(async(request : Request, response : Response) => {
	const courseID : string = request.params.courseID;
	const userID : string = request.params.userID;
	const currentUserID : string = await getCurrentUserID(request);

	// Require manage user registration
	await requirePermission(currentUserID, PermissionEnum.manageUserRegistration, courseID);

	const result : CourseUser = await CourseRegistrationDB.deleteEntry({
		courseID,
		userID
	});

	response.status(200).send(result);

}));