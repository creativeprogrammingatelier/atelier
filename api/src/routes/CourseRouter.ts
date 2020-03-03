/**
 * Api routes relating to a course
 */

import express, {Response, Request} from "express";
import {CourseDB} from "../database/CourseDB";
import {Course} from "../../../models/api/Course";
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
courseRouter.post('/',capture(async(request : Request, result : Response) => {
    // const name : string = request.body.name;
    // const state : courseState = request.body.state;
    // const creatorID : string | undefined = request.body.creatorID;
    //
    // console.log(name, state, creatorID);
    //
    // CourseDB.addCourse({ courseName: name, state, creatorID  })
    //     .then((course : Course) => {
    //         result.send(course)
    //     })
    //     .catch((error : Error) => result.status(500).send({error}));
}));
