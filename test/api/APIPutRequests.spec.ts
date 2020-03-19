import 'mocha';
import {assert, expect} from "chai";
import {UserDB} from "../../api/src/database/UserDB";
import {issueToken} from "../../api/src/helpers/AuthenticationHelper";
import {coursesToUnregister, setAPITestUserValues, setPermissions, unregisterCourse} from "./APIRequestHelper";
import {CoursePartial} from "../../models/api/Course";
import {instanceOfCoursePartial} from "../InstanceOf";

describe("API Put Permissions", () => {

    before(async () => {
        // Get test user and set token
        const USER_ID = (await UserDB.filterUser({userName: 'test user', limit: 1}))[0].ID;
        const USER_AUTHORIZATION_KEY = issueToken(USER_ID);
        setAPITestUserValues(USER_ID, USER_AUTHORIZATION_KEY);

        // TODO preparation
    });

    /**
     * /api/commentThread/:commentThreadID
     * - response should be a CommentThread
     * - visibility can be set if user owns the thread or has permission to manage restricted comments
     */
    describe("Comment threads", () => {
        // TODO
    });

    /**
     * /api/course/:courseID
     * - response should be a Course
     * - name of course can be set with permission to manage courses
     * - state of course can be set with permission to manage courses
     * /api/course/:courseID/user/:userID
     * - response should be CourseRegistrationOutput
     * - user can be enrolled in a course with manage user registration permission
     */
    describe("Courses", () => {
        // TODO
    });

    /**
     * /role/course/:courseID/user/:userID/:role
     * - response should be CourseRegistrationOutput
     * - user role can be set if permission to manage user permissions manager
     * // TODO add api path to set global role of a user
     */
    describe("Roles", () => {
        // TODO
    });

    /**
     * /api/permission/course/:courseID/user/:userID
     * - response should be Permission
     * - user can set view permissions with permission to manage view permissions
     * - user can set manage permissions with permission to manage manage permissions
     * /api/permission/user/:userID
     * - response should be Permission
     * - user can set view permissions with permission to manage view permissions
     * - user can set manage permissions with permission to manage manage permissions
     */
    describe("Permissions", () => {
        // TODO
    });

    /**
     * /api/user
     * - response should be User
     * - user can set name
     * - user can set email
     */
    describe("Users", () => {
        // TODO
    });
});