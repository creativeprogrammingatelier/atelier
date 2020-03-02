/**
 * Api routes relating to a course
 */

import express, {Response, Request} from "express";
import {CourseDB} from "../database/CourseDB";
import {Course} from "../../../models/api/Course";
import {courseState} from "../../../enums/courseStateEnum";
import {AuthMiddleware} from "../middleware/AuthMiddleware";
import {capture} from "../helpers/ErrorHelper";

export const courseRouter = express.Router();

// Authentication is required for all endpoints
courseRouter.use(AuthMiddleware.requireAuth);

/** ---------- GET REQUESTS ---------- */

/**
 * Get user courses
 */
courseRouter.get("/", capture(async(request: Request, response: Response) => {
	const courses : Course[] = await CourseDB.getAllCourses();
	response.status(200).send(courses);
}));

/**
 * Get a specific course
 */
courseRouter.get("/:courseID", capture(async(request: Request, response: Response) => {
	const courseID : string = request.params.courseID;
	const course : Course = await CourseDB.getCourseByID(courseID);
	response.status(200).send(course);
}));

/** ---------- POST REQUESTS ---------- */

/**
 * Create a course
 */
courseRouter.post("/",capture(async(request: Request, response: Response) => {
	const name : string = request.body.name;

	// TODO get user
	// TODO create course
}));

