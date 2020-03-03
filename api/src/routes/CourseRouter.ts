/**
 * Api routes relating to a course
 */

import express, {Response, Request} from "express";
import {CourseDB} from "../database/CourseDB";
import {Course, CoursePartial} from "../../../models/api/Course";
import {AuthMiddleware} from "../middleware/AuthMiddleware";
import {capture} from "../helpers/ErrorHelper";
import {courseState} from "../../../enums/courseStateEnum";
import {getCurrentUserID} from "../helpers/AuthenticationHelper";

export const courseRouter = express.Router();

// Authentication is required for all endpoints
courseRouter.use(AuthMiddleware.requireAuth);

/** ---------- GET REQUESTS ---------- */

/**
 * Get user courses
 */
courseRouter.get("/", capture(async(request: Request, response: Response) => {
    const courses : CoursePartial[] = await CourseDB.getAllCourses();
    response.status(200).send(courses);
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
 */
courseRouter.post('/', capture(async(request : Request, response : Response) => {
    const name : string = request.body.name;
    const state : courseState = request.body.state;
    const userID : string = await getCurrentUserID(request);
    console.log(name);
    console.log(state);
    console.log(userID);

    const course : CoursePartial = await CourseDB.addCourse({
        courseName : name,
        state : state,
        creatorID : userID
    });
    console.log(course);

    response.status(200).send(course);
}));
