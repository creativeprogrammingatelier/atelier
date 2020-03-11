import 'mocha';
import chai, { expect} from 'chai';
import chaiAsPromised from "chai-as-promised";
import {issueToken} from "../../api/src/helpers/AuthenticationHelper";
import {Permission} from "../../models/api/Permission";
import {User} from "../../models/api/User";

/** URL of the website */
const BASE_URL = "http://localhost:5000";
/** ID of an account to which permissions are added/removed for testing */
/** Currently USER_ID has permission 1 globally and in DEFAULT_COURSE_ID. This bit is not used */
const USER_ID = "r5zoYKbiTLiBA0swG6gZ2Q";
/** ID of an admin account to set permissions on the user */
const ADMIN_ID = "AAAAAAAAAAAAAAAAAAAAAA";
/** ID of the course to which the USER_ID should be registered */
const DEFAULT_COURSE_ID = "AAAAAAAAAAAAAAAAAAAAAA";
/** Authorization keys */
const USER_AUTHORIZATION_KEY = issueToken(USER_ID);
const ADMIN_AUTHORIZATION_KEY = issueToken(ADMIN_ID);

/** Fetch method */
const fetch = require('node-fetch');

/** Get fetch for the user */
function getFetch(extension : string, data : any = {}) {
    console.log(USER_AUTHORIZATION_KEY);
    return fetch(BASE_URL + extension, {
        method : 'GET',
        headers : {
            'Content-Type' : 'application/json',
            'Authorization' : USER_AUTHORIZATION_KEY,
            ...data
        }
    }).then((result : any) => result.json());
}

/** Put fetch for admin to set permissions */
function putFetch(extension : string, permissions: any = {}) {
    return fetch(BASE_URL + extension, {
        method : 'PUT',
        headers : {
            'Content-Type' : 'application/json',
            'Authorization' : ADMIN_AUTHORIZATION_KEY,
            'permissions' : permissions
        }
    }).then((result : any) => result.json());
}

describe("Check whether get requests work properly with given permissions", () => {
    // TODO check whether no permissions at the start as we set/remove before each test
    it('should have default permissions at the start of the test', async () => {
        const user : User = await getFetch(`/api/user/${USER_ID}`);
        const permission : number = user.permission.permissions;
        console.log(permission);
        // TODO this user should have 0 permissions, but database currently gives permission 1.
    });

    // TODO comment thread can only be access if registered in the course (or permission for viewing all courses)

    // TODO file can only be accessed if registered in the course (or permission for viewing all courses)

    // TODO submission can only be accessed if registered in the course (or permission for viewing all courses)

    // TODO recent submissions can only accessed if registered in the course (or permission for viewing all courses)

    // TODO get all courses if permission for viewing all courses

    // TODO get courses only if enrolled if no permission for viewing all courses

    // TODO get course only possible if enrolled (or permission for viewing all courses)

    // TODO get submissions of a course required user being registered.

    // TODO get submissions only returns own submissions unless permission to view all submissions

    // TODO get submissions of user required you being the user, or having permission to view all submissions

    // TODO view all users requires view all user profiles permission

    // TODO get a specific user requires you being the user or having access to view all user profiles

    // TODO search test once last decisions made for search page
});