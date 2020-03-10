/**
 * Api routes relating to a course
 */

import express, {Request, Response} from "express";
import {CourseDB} from "../database/CourseDB";
import {CoursePartial} from "../../../models/api/Course";
import {AuthMiddleware} from "../middleware/AuthMiddleware";
import {capture} from "../helpers/ErrorHelper";
import {courseState} from "../../../enums/courseStateEnum";
import {getCurrentUserID} from "../helpers/AuthenticationHelper";
import {localRole} from "../../../enums/localRoleEnum";
import {CourseRegistrationDB} from "../database/CourseRegistrationDB";
import {getClient} from "../database/HelperDB";
import {CourseRegistrationOutput} from "../../../models/database/CourseRegistration";
import {filterCourse} from "../helpers/APIFilterHelper";
import {getGlobalPermissions, requirePermission, requireRegistered} from "../helpers/PermissionHelper";
import {containsPermission, PermissionEnum} from "../../../enums/permissionEnum";

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
	const enrolled : string[] = (await CourseRegistrationDB.getEntriesByUser(userID)).map((course : CourseRegistrationOutput) => course.courseID);
	response.status(200).send(await filterCourse(courses, enrolled, userID));
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

	const client = await getClient();
	try {
		await client.query('BEGIN');

		const course : CoursePartial = await CourseDB.addCourse({
			courseName : name,
			state : state,
			creatorID : currentUserID,
			client : client
		});

		await CourseRegistrationDB.addEntry({
			courseID : course.ID,
			userID : currentUserID,
			role : localRole.student,
			client : client
		});

		await client.query('COMMIT');

		response.status(200).send(course);
	} catch (e) {
		await client.query('ROLLBACK');
		throw e;
	} finally {
		client.release();
	}
}));

/** ---------- PUT REQUESTS ---------- */

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

	const courseRegistration : CourseRegistrationOutput = await CourseRegistrationDB.addEntry({
		courseID : courseID,
		userID : userID,
		role : localRole.student
	});
	response.status(200).send(courseRegistration);
}));