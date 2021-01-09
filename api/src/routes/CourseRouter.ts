import express, {Request, Response} from "express";

import {CoursePartial} from "../../../models/api/Course";
import {CourseUser} from "../../../models/api/CourseUser";
import {PermissionEnum} from "../../../models/enums/PermissionEnum";

import {filterCourse, removePermissionsCoursePartial, removePermissionsCourseUser} from "../helpers/APIFilterHelper";
import {getCurrentUserID} from "../helpers/AuthenticationHelper";
import {capture} from "../helpers/ErrorHelper";
import {requirePermission, requireRegistered} from "../helpers/PermissionHelper";

import {CourseDB} from "../database/CourseDB";
import {CourseRegistrationDB} from "../database/CourseRegistrationDB";
import {CourseRole} from "../../../models/enums/CourseRoleEnum";
import {CourseState} from "../../../models/enums/CourseStateEnum";
import {transaction} from "../database/HelperDB";
import {AuthMiddleware} from "../middleware/AuthMiddleware";
import { getAccessToken, getCourseUsers, getCourseUsersStudents, getCourseUsersTAs, getRefreshToken } from "../helpers/CanvasHelper";
import { CourseInviteDB } from "../database/CourseInviteDB";
import { UserDB } from "../database/UserDB";
import { User } from "../../../models/database/User";
import { GlobalRole } from "../../../models/enums/GlobalRoleEnum";

/**
 * Api routes relating to a course
 */

export const courseRouter = express.Router();
courseRouter.use(AuthMiddleware.requireAuth);

// ---------- GET REQUESTS ----------

/**
 * Get user courses
 * - notes:
 *  - requires permissions to view all courses
 */
courseRouter.get("/", capture(async (request: Request, response: Response) => {
	const userID: string = await getCurrentUserID(request);
	const courses: CoursePartial[] = await CourseDB.getAllCourses();
	const enrolled: string[] = (await CourseRegistrationDB.getEntriesByUser(userID))
		.map((course: CourseUser) => course.courseID);
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
courseRouter.get("/user/:userID", capture(async (request: Request, response: Response) => {
	const userID = request.params.userID;
	const currentUserID: string = await getCurrentUserID(request);
	
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
courseRouter.get("/:courseID", capture(async (request: Request, response: Response) => {
	const courseID: string = request.params.courseID;
	const course: CoursePartial = await CourseDB.getCourseByID(courseID);
	const currentUserID: string = await getCurrentUserID(request);
	
	// User should be registered in the course
	await requireRegistered(currentUserID, courseID);
	
	response.status(200).send(removePermissionsCoursePartial(course));
}));

// ---------- POST REQUESTS ----------

/**
 * Create a course
 * - requirements:
 *  - AddCourses permission
 */
courseRouter.post('/', capture(async (request: Request, response: Response) => {
	const name: string = request.body.name;
	const state: CourseState = request.body.state;
	const canvasCourseID: string = request.body.canvasCourseId;
	const currentUserID: string = await getCurrentUserID(request);

	/**
	 * Once creation of course and adding users via canvas has been stressed tested the transaction could be merged
	 */

	// Requires addCourses permission
	await requirePermission(currentUserID, PermissionEnum.addCourses);
	
	const course = await transaction(async client => {
		const course: CoursePartial = await CourseDB.addCourse({
			courseName: name,
			state,
			creatorID: currentUserID,
			canvasCourseID: canvasCourseID,
			client
		});
		
		await CourseRegistrationDB.addEntry({
			courseID: course.ID,
			userID: currentUserID,
			courseRole: CourseRole.moduleCoordinator,
			client
		});
		
		return course;
	});

	/** Add all users in canvas */
	/**
	 * User canvas helper to pass course ID and get users
	 */
	if(canvasCourseID != ""){ 
		let students = await getCourseUsersStudents(canvasCourseID, await getAccessToken(await getRefreshToken(request)));
		let tas = await getCourseUsersTAs(canvasCourseID, await getAccessToken(await getRefreshToken(request)));

		await transaction(async client => {
			/**
			 * Refactor
			 */
			for (let student of students){
				let userDB: User[]  = await UserDB.getUserByEmail(client, student.email)
				if (userDB != [] && userDB[0] != undefined){
					await CourseRegistrationDB.addEntry({
						courseID: course.ID,
						userID: userDB[0].userID,
						courseRole: CourseRole.student,
						client
					});
				} else if ( student.email != undefined ) { 
					let createdUser: any = await UserDB.createUser({ userName: student.name , email: student.email, password: UserDB.invalidPassword(), globalRole: GlobalRole.user, client: client })
					await CourseRegistrationDB.addEntry({
						courseID: course.ID,
						userID: createdUser.ID,
						courseRole: CourseRole.student,
						client
					});
				} else { 
			
					console.log("No email found for user cannot link: ", student.name)
				}
			}
			for (let ta of tas){
				let userDB: User[]  = await UserDB.getUserByEmail(client, ta.email)
				if (userDB != [] && userDB[0] != undefined){
					await CourseRegistrationDB.addEntry({
						courseID: course.ID,
						userID: userDB[0].userID,
						courseRole: CourseRole.TA,
						client
					});
				} else if ( ta.email != undefined ) { 
					let createdUser: any = await UserDB.createUser({ userName: ta.name , email: ta.email, password: UserDB.invalidPassword(), globalRole: GlobalRole.user, client: client })
					await CourseRegistrationDB.addEntry({
						courseID: course.ID,
						userID: createdUser.ID,
						courseRole: CourseRole.student,
						client
					});
				} else { 
			
					console.log("No email found for user cannot link: ", ta.name)
				}
			}
			/** 
			 * If user exists add to course.
			 * If not creatte user and add to course.
			 * 
			 * 
			 */
	
			
			return course;
		});
	}


	response.status(200).send(removePermissionsCoursePartial(course));
}));

// ---------- PUT REQUESTS ----------

/**
 * Update name/state of a course
 *  - requirements:
 *   - manageCourses permission
 */
courseRouter.put('/:courseID', capture(async (request: Request, response: Response) => {
	const courseID: string = request.params.courseID;
	const currentUserID: string = await getCurrentUserID(request);
	const name: string | undefined = request.body.name;
	const canvasCourseID: string = request.body.canvasCourseId;
	const state: CourseState | undefined = request.body.state as CourseState;
	
	// Require manageCourses permission
	await requirePermission(currentUserID, PermissionEnum.manageCourses, courseID);
	
	const course: CoursePartial = await CourseDB.updateCourse({
		courseID,
		courseName: name,
		canvasCourseID,
		state
	});
	
	response.status(200).send(removePermissionsCoursePartial(course));
}));

/**
 * Join a user in a course
 * - requirements:
 *  - manageUserRegistration permission
 */
courseRouter.put('/:courseID/user/:userID/role/:role', capture(async (request: Request, response: Response) => {
	const courseID: string = request.params.courseID;
	const userID: string = request.params.userID;
	const courseRole: CourseRole = request.params.role as CourseRole;
	const currentUserID: string = await getCurrentUserID(request);
	
	// Require manageUserRegistration permission
	await requirePermission(currentUserID, PermissionEnum.manageUserRegistration, courseID);
	
	// Get current user registrations
	const courseRegistrations: CourseUser[] = await CourseRegistrationDB.getSubset([courseID], [userID]);
	
	// User already registered in the course
	if (courseRegistrations.length !== 0) {
		response.status(200).send(removePermissionsCourseUser(courseRegistrations[0]));
	} else {
		const courseRegistration: CourseUser = await CourseRegistrationDB.addEntry({
			courseID,
			userID,
			courseRole
		});
		response.status(200).send(removePermissionsCourseUser(courseRegistration));
	}
}));

// ---------- DELETE REQUESTS ----------

courseRouter.delete('/:courseID', capture(async (request: Request, response: Response) => {
	const courseID: string = request.params.courseID;
	const currentUserID: string = await getCurrentUserID(request);
	
	// Require manage courses permission
	await requirePermission(currentUserID, PermissionEnum.manageCourses, courseID);
	
	const result: CoursePartial = await CourseDB.deleteCourseByID(courseID);
	
	response.status(200).send(removePermissionsCoursePartial(result));
}));
courseRouter.delete('/:courseID/user/:userID', capture(async (request: Request, response: Response) => {
	const courseID: string = request.params.courseID;
	const userID: string = request.params.userID;
	const currentUserID: string = await getCurrentUserID(request);
	
	// Require manage user registration
	await requirePermission(currentUserID, PermissionEnum.manageUserRegistration, courseID);
	
	const result: CourseUser = await CourseRegistrationDB.deleteEntry({
		courseID,
		userID
	});
	
	response.status(200).send(removePermissionsCourseUser(result));
}));
