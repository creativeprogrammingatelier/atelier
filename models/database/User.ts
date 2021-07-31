import {UUIDHelper} from "../../api/src/helpers/UUIDHelper";
import {DBTools, checkAvailable, toDec} from "../../api/src/database/HelperDB";

import {getEnum} from "../../helpers/EnumHelper";

import {User as APIUser} from "../api/User";
import {GlobalRole} from "../enums/GlobalRoleEnum";

export interface User extends DBTools {
	userID?: string,
	samlID?: string,
	userName?: string,
	email?: string,
	globalRole?: GlobalRole,
	permission?: number,
    password?: string,
	researchAllowed?: boolean,
	canvasrefresh?: string
}
export interface DBUser extends DBAPIUser {
	samlid: string,
	hash?: string,
}

export interface DBAPIUser {
	userid: string,
	username: string,
	email: string,
	globalrole: string,
    permission: string,
	researchallowed?: boolean,
	canvasrefresh: string
}

export function convertUser(db: DBUser): User {
    checkAvailable(["userid", "username", "email", "globalrole", "permission"], db);
    return {
        userID: UUIDHelper.fromUUID(db.userid),
        samlID: db.samlid,
        userName: db.username,
        email: db.email,
        globalRole: getEnum(GlobalRole, db.globalrole),
        permission: toDec(db.permission),
        researchAllowed: db.researchallowed
    };
}
export function userToAPI(db: DBAPIUser): APIUser {
    checkAvailable(["userid", "username", "email", "globalrole", "permission"], db);
    return {
        ID: UUIDHelper.fromUUID(db.userid),
        name: db.username,
        email: db.email,
        permission: {
            globalRole: getEnum(GlobalRole, db.globalrole),
            permissions: toDec(db.permission)
        },
        researchAllowed: db.researchallowed,
        canvasrefresh: db.canvasrefresh
    };
}