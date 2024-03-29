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
import {getAccessToken, getCourseUsersStudents, getCourseUsersTAs, getRefreshToken} from "../helpers/CanvasHelper";
import {addUsersFromCanvas} from "../helpers/CourseHelper";
import {RequestB} from "../helpers/RequestHelper";
import {TagsDB} from "../database/TagsDB";

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

/** Get all signoffs for a course in csv format. Allows for optional tag query parameter
 * to specify the start of tags used for signing off.
 */
courseRouter.get("/:courseID/signoff.csv", capture(async (request: Request, response: Response) => {
    const courseID: string = request.params.courseID;
    const tagStart: string = (request.query.tag as string | undefined) || "topic";

    const currentUserID = await getCurrentUserID(request);
    await requirePermission(currentUserID, PermissionEnum.manageUserRegistration);

    const signoffs = await TagsDB.getSignOffs(courseID, tagStart);

    let csv = "tag,student,submission,submittedby,ta,date\n";
    for (const signoff of signoffs) {
        csv += `${signoff.tag},${signoff.student},${signoff.submission},${signoff.submittedby},${signoff.ta},${signoff.date.toISOString()}\n`;
    }

    response.status(200).type("text/csv").send(csv);
}));

// ---------- POST REQUESTS ----------

interface CreateCourseBody {
    name: string,
    state: CourseState,
    canvasCourseId?: string
}

/**
 * Create a course
 * - requirements:
 *  - AddCourses permission
 */
courseRouter.post("/", capture(async (request: RequestB<CreateCourseBody>, response: Response) => {
    const name = request.body.name;
    const state = request.body.state;
    const canvasCourseID = request.body.canvasCourseId;
    const currentUserID = await getCurrentUserID(request);

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

    /**
     * Adds all users in canvas linked course
     * */
    if (canvasCourseID){
        const students = await getCourseUsersStudents(
            canvasCourseID,
            await getAccessToken(await getRefreshToken(request))
        );
        const tas = await getCourseUsersTAs(canvasCourseID, await getAccessToken(await getRefreshToken(request)));
        await transaction(async client => {
            await addUsersFromCanvas(students, client, CourseRole.student, course);
            await addUsersFromCanvas(tas, client, CourseRole.TA, course);
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
courseRouter.put("/:courseID", capture(async (request: RequestB<Partial<CreateCourseBody>>, response: Response) => {
    const courseID: string = request.params.courseID;
    const currentUserID: string = await getCurrentUserID(request);
    const name = request.body.name;
    const canvasCourseID = (request.body.canvasCourseId === "") ? undefined: request.body.canvasCourseId;
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
courseRouter.put("/:courseID/user/:userID/role/:role", capture(async (request: Request, response: Response) => {
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

courseRouter.delete("/:courseID", capture(async (request: Request, response: Response) => {
    const courseID: string = request.params.courseID;
    const currentUserID: string = await getCurrentUserID(request);

    // Require manage courses permission
    await requirePermission(currentUserID, PermissionEnum.manageCourses, courseID);

    const result: CoursePartial = await CourseDB.deleteCourseByID(courseID);

    response.status(200).send(removePermissionsCoursePartial(result));
}));
courseRouter.delete("/:courseID/user/:userID", capture(async (request: Request, response: Response) => {
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
