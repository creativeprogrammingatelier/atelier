/**
 * Api routes relating to a course
 */

import express, {Request, Response} from "express";
import {CourseDB} from "../database/CourseDB";
import {CoursePartial} from "../../../models/api/Course";
import {AuthMiddleware} from "../middleware/AuthMiddleware";
import {capture} from "../helpers/ErrorHelper";
import {CourseState} from "../../../models/enums/CourseStateEnum";
import {getCurrentUserID} from "../helpers/AuthenticationHelper";
import {CourseRole} from "../../../models/enums/CourseRoleEnum";
import {CourseRegistrationDB} from "../database/CourseRegistrationDB";
import {transaction} from "../database/HelperDB";
import {requirePermission, requireRegistered} from "../helpers/PermissionHelper";
import {PermissionEnum} from "../../../models/enums/PermissionEnum";
import {
	filterCourse,
	removePermissionsCoursePartial,
	removePermissionsCourseUser,
	removePermissionsUser
} from "../helpers/APIFilterHelper";
import {CourseUser} from "../../../models/api/CourseUser";
import {CourseInviteDB} from "../database/CourseInviteDB";

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
	const enrolled : string[] = (await CourseRegistrationDB.getEntriesByUser(userID))
		.map((course : CourseUser) => course.courseID);
	const filtered = (await filterCourse(courses, enrolled, userID))
		.map((coursePartial => removePermissionsCoursePartial(coursePartial)));
	response.status(200).send(filtered);
}));

/**
 * Get user courses
 *  - view all courses permission: receives all of the users courses
 *  - user self: receives all of the users courses
 *  - rest: not allowed
 */
courseRouter.get("/user/:userID", capture(async(request: Request, response: Response) => {
	const userID = request.params.userID;
	const currentUserID : string = await getCurrentUserID(request);

	if (currentUserID !== userID) await requirePermission(currentUserID, PermissionEnum.viewAllCourses);

	const enrolledCourses = (await CourseRegistrationDB.getEntriesByUser(userID))
		.map((course: CourseUser) => course.courseID);
	const courses = (await CourseDB.getAllCourses())
		.filter(course => enrolledCourses.includes(course.ID))
		.map(course => removePermissionsCoursePartial(course));

	response.status(200).send(courses);
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

	response.status(200).send(removePermissionsCoursePartial(course));
}));

/** ---------- POST REQUESTS ---------- */

/**
 * Create a course
 * - requirements:
 *  - AddCourses permission
 */
courseRouter.post('/', capture(async(request : Request, response : Response) => {
	const name : string = request.body.name;
	const state : CourseState = request.body.state;
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
			courseRole : CourseRole.student,
			client
		});

        return course;
    });

    response.status(200).send(removePermissionsCoursePartial(course));
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
	const state : CourseState | undefined = request.body.state as CourseState;

	// Require manageCourses permission
	await requirePermission(currentUserID, PermissionEnum.manageCourses, courseID);

	const course : CoursePartial = await CourseDB.updateCourse({
		courseID,
		courseName : name,
		state
	});

	response.status(200).send(removePermissionsCoursePartial(course));
}));

/**
 * Join a user in a course
 * - requirements:
 *  - manageUserRegistration permission
 */
courseRouter.put('/:courseID/user/:userID/role/:role', capture(async(request : Request, response : Response) => {
	const courseID : string = request.params.courseID;
	const userID : string = request.params.userID;
	const courseRole : CourseRole = request.params.role as CourseRole;
	const currentUserID : string = await getCurrentUserID(request);

	// Require manageUserRegistration permission
	await requirePermission(currentUserID, PermissionEnum.manageUserRegistration, courseID);

	// Get current user registrations
	const courseRegistrations : CourseUser[] = await CourseRegistrationDB.getSubset([courseID], [userID]);

	// User already registered in the course
	if (courseRegistrations.length !== 0) {
		response.status(200).send(removePermissionsCourseUser(courseRegistrations[0]));
	} else {
		const courseRegistration : CourseUser = await CourseRegistrationDB.addEntry({
			courseID,
			userID,
			courseRole
		});
		response.status(200).send(removePermissionsCourseUser(courseRegistration));
	}
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

	response.status(200).send(removePermissionsCourseUser(result));
}));

courseRouter.delete('/:courseID', capture(async(request : Request, response : Response) => {
	const courseID : string = request.params.courseID;
	const currentUserID : string = await getCurrentUserID(request);

	// Require manage courses permission
	await requirePermission(currentUserID, PermissionEnum.manageCourses, courseID);

	const result : CoursePartial = await CourseDB.deleteCourseByID(courseID);

	response.status(200).send(removePermissionsCoursePartial(result));
}));