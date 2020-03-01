/**
 * Api routes relating to a course
 */

import express, {Response, Request} from "express";
import {CourseDB} from "../database/CourseDB";
import {Course} from "../../../models/database/Course";
import {courseState} from "../../../enums/courseStateEnum";
import {AuthMiddleware} from "../middleware/AuthMiddleware";

export const courseRouter = express.Router();

// Authentication is required for all endpoints
courseRouter.use(AuthMiddleware.requireAuth);

/** ---------- GET REQUESTS ---------- */

/**
 * /api/courses/
 * @return, list of courses
 */
courseRouter.get("/",
	async(request: Request, result: Response) => {
		/* Code for new interfaces
		const courses : Course[] = await CourseDB.getAllCourses();
		result.status(200).send(courses);
		 */

		CourseDB.getAllCourses()
			.then((courses: Course[]) => courses.map((course: Course) => {
				return {
					courseID: course.courseID,
					name: course.name,
					state: course.state,
					creator: course.creatorID
				};
			}))
			.then(data => result.send(data))
			.catch((error => result.status(500).send({error: "internal", message: "Internal server error", details: error})));
	});

courseRouter.get("/:courseID", async(request: Request, response: Response) => {
	/* Code for new interfaces
	const courseID : string = request.params.courseID;
	const course : Course = await CourseDB.getCourseByID(courseID);
	result.status(200).send(course);
	 */
	const courseID = request.params.courseID;

	try {
		const course: Course = await CourseDB.getCourseByID(courseID);
		response.send(course);
	} catch (error) {
		response.status(500).send({error: "internal", message: "Could not retrieve course details", details: error});
	}
});

/** ---------- POST REQUESTS ---------- */

/** Add a course. Pass parameters as json in the body.
 * @type: post
 * @url: /api/course
 * @param name (string): course name
 * @param state (courseState): state of the course
 * @param creatorID (string): userID of the creator
 * @return course created
 */
courseRouter.post("/",
	(request: Request, result: Response) => {
		const name: string = request.body.name;
		const state: courseState = request.body.state;
		const creatorID: string | undefined = request.body.creatorID;

		console.log(name, state, creatorID);

		CourseDB.addCourse({name, state, creatorID})
			.then((course: Course) => {
				result.send(course);
			})
			.catch((error: Error) => result.status(500).send({error}));
	});

