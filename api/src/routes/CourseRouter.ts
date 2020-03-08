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
import {getGlobalRole, requireRole} from "../helpers/PermissionHelper";
import {CourseRegistrationDB} from "../database/CourseRegistrationDB";
import {globalRole} from "../../../enums/roleEnum";
import {getClient} from "../database/HelperDB";
import {CourseRegistrationOutput} from "../../../models/database/CourseRegistration";

export const courseRouter = express.Router();

// Authentication is required for all endpoints
courseRouter.use(AuthMiddleware.requireAuth);

/** ---------- GET REQUESTS ---------- */

/**
 * Get user courses
 *  - admin: receives all courses
 *  - rest: receives enrolled courses
 */
courseRouter.get("/", capture(async(request: Request, response: Response) => {
	const userID : string = await getCurrentUserID(request);
	const globalRole : string = await getGlobalRole(userID);
	if (globalRole === "admin") {
		const courses : CoursePartial[] = await CourseDB.getAllCourses();
		response.status(200).send(courses);
	} else {
		const enrolledCourses : string[] = (await CourseRegistrationDB.getEntriesByUser(userID)).map((course : CourseRegistrationOutput) => course.courseID);
		const courses : CoursePartial[] = (await CourseDB.getAllCourses()).filter((course : CoursePartial) => enrolledCourses.includes(course.ID));
		response.status(200).send(courses);
	}
}));

/**
 * Get a specific course
 */
courseRouter.get("/:courseID", capture(async(request: Request, response: Response) => {
	const courseID : string = request.params.courseID;
	const course : CoursePartial = await CourseDB.getCourseByID(courseID);
	response.status(200).send(course);
}));

/** ---------- POST REQUESTS ---------- */

/**
 * Create a course
 * - require global admin
 */
courseRouter.post('/', capture(async(request : Request, response : Response) => {
	const name : string = request.body.name;
	const state : courseState = request.body.state;
	const userID : string = await getCurrentUserID(request);
	await requireRole({globalRoles : ["admin"], userID : userID});

	const client = await getClient();
	try {
		await client.query('BEGIN');

		const course : CoursePartial = await CourseDB.addCourse({
			courseName : name,
			state : state,
			creatorID : userID,
			client : client
		});

		await CourseRegistrationDB.addEntry({
			courseID : course.ID,
			userID : userID,
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
 * Join a course
 */
courseRouter.put('/:courseID', capture(async(request : Request, response : Response) => {
	const courseID : string = request.params.courseID;
	const userID : string = await getCurrentUserID(request);
	const courseRegistration : CourseRegistrationOutput = await CourseRegistrationDB.addEntry({
		courseID : courseID,
		userID : userID,
		role : localRole.student
	});
	response.status(200).send(courseRegistration);
}));