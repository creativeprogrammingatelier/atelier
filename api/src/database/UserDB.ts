import bcrypt from "bcrypt";

import {User, DBUser, userToAPI} from "../../../models/database/User";
import {GlobalRole} from "../../../models/enums/GlobalRoleEnum";

import {UUIDHelper} from "./helpers/UUIDHelper";

import {pool, extract, map, one, searchify, pgDB, checkAvailable, DBTools, toBin, permissionBits} from "./HelperDB";
import {usersView} from "./ViewsDB";

/**
 * Users middleware provides helper methods for interacting with users in the DB
 * userID, userName, role, email
 * @Author Rens Leendertz
 */
export class UserDB {

    /**
	 * calls onSuccess() with all known users that have the global role 'user', except password hash
	 */
    static async getAllStudents(params: DBTools = {}) {
        return UserDB.filterUser({...params, globalRole: GlobalRole.user});
    }
	
    /**
	 * calls onSuccess() with all users in the system.
	 */
    static async getAllUsers(params: DBTools = {}) {
        return UserDB.filterUser(params);
    }
	
    /**
	 * returns a student based on its userID, without password hash
	 */
    static async getUserByID(userID: string, params: DBTools = {}) {
        return UserDB.filterUser({...params, userID}).then(one);
    }
    static async getUserBySamlID(samlID: string, params: DBTools = {}) {
        const {client = pool} = params;
        return client.query<DBUser>(`
                SELECT * FROM "Users"
                WHERE samlID = $1`, [samlID])
            .then(extract).then(map(userToAPI)).then(one);
    }
    static async getSamlIDForUserID(userID: string, params: DBTools = {}) {
        const {client = pool} = params;
        const uuid = UUIDHelper.toUUID(userID);
        return client.query<{ samlid: string }>(`
                SELECT samlID FROM "Users" 
                WHERE userID = $1`, [uuid])
            .then(extract).then(map(u => u.samlid)).then(one);
    }
    static async getUserByPossibleMentionInCourse(possibleMention: string, courseID: string, params: DBTools = {}) {
        const {client = pool} = params;
        const courseid = UUIDHelper.toUUID(courseID);
        return client.query(`
        SELECT *
        FROM "UsersView" as u, "CourseRegistration" as cr
        WHERE
            (u.userID = cr.userID)
        AND (courseID = $1)
        AND (POSITION(userName in $2) = 1)
        ORDER BY (char_length(userName)) DESC
        LIMIT 1
        `, [courseid, possibleMention])
            .then(extract).then(one).then(userToAPI);
    }
	
    /**
	 *
	 * permissions will be checked like this:
	 *        the permissions field will be checked to contain every required permission.
	 */
    static async filterUser(user: User) {
        const {
            userID = undefined,
            userName = undefined,
            email = undefined,
            globalRole: role = undefined,
            permission = undefined,
            researchAllowed = undefined,
			
            limit = undefined,
            offset = undefined,
            client = pool
        } = user;
        const userid = UUIDHelper.toUUID(userID),
            username = searchify(userName),
            binPerm = toBin(permission);
        return client.query(`
		SELECT *
		FROM "UsersView"
		WHERE
			($1::uuid IS NULL OR userID = $1)
		AND ($2::text IS NULL OR userName ILIKE $2)
		AND ($3::text IS NULL OR email = $3)
        AND ($4::text IS NULL OR globalrole = $4)
        AND ($5::bit(${permissionBits}) IS NULL OR (permission & $5) = $5)
        AND ($6::boolean IS NULL OR researchAllowed = $6::boolean)
		ORDER BY userName, email --email is unique, so unique ordering
		LIMIT $7
		OFFSET $8
		`, [userid, username, email, role, binPerm, researchAllowed, limit, offset])
            .then(extract).then(map(userToAPI));
    }

    static async getUserByEmail(email: String, client?: pgDB) {
        client = (client) ? client : pool;
        return client.query(`
		SELECT *
		FROM "UsersView"
		WHERE email = $1
		ORDER BY email --email is unique, so unique ordering
		LIMIT 1
		`, [email])
            .then(extract).then(map(userToAPI)).then(one);
    }

    static async filterUserInCourse(user: User & { courseID?: string }) {
        const {
            userID = undefined,
            userName = undefined,
            email = undefined,
            globalRole: role = undefined,
            courseID = undefined,
            researchAllowed = undefined,
			
            limit = undefined,
            offset = undefined,
            client = pool
        } = user;
        const courseid = UUIDHelper.toUUID(courseID),
            userid = UUIDHelper.toUUID(userID),
            username = searchify(userName);
        return client.query(`
		SELECT u.*
		FROM "UsersView" as u, "CourseRegistration" as cr
        WHERE
            (u.userID = cr.userID)
        AND ($1::uuid IS NULL OR courseID = $1)
		AND ($2::uuid IS NULL OR u.userID = $2)
		AND ($3::text IS NULL OR userName ILIKE $3)
		AND ($4::text IS NULL OR email = $4)
        AND ($5::text IS NULL OR globalrole = $5)
        AND ($6::text IS NULL OR researchAllowed = $6::boolean)
		ORDER BY userName, email --email is unique, so unique ordering
		LIMIT $7
		OFFSET $8
		`, [courseid, userid, username, email, role, researchAllowed, limit, offset])
            .then(extract).then(map(userToAPI));
    }
    static async searchUser(searchString: string, params: DBTools = {}) {
        return UserDB.filterUser({...params, userName: searchString});
    }
	
    /**
	 * creates a user based on the @param user.
	 * All fields but userID are required
	 * if a userID is present, it will be ignored.
	 */
    static async createUser(user: User) {
        checkAvailable(["email", "password", "globalRole", "userName"], user);
        const {
            email,
            password,
            globalRole: role,
            userName,
            permission = 0,
            researchAllowed = undefined,
            samlID = undefined,
            client = pool
        } = user;
        const hash = password === undefined ? undefined : UserDB.hashPassword(password),
            binPerm = toBin(permission);
		
        return client.query(`
			WITH insert AS (
				INSERT INTO "Users" 
				VALUES (DEFAULT, $1, $2, $3, $4, $5, $6, $7) 
				RETURNING *
			)
			${usersView("insert")}
			`, [samlID, userName, email, role, binPerm, hash, researchAllowed])
            .then(extract).then(map(userToAPI)).then(one);
    }
	
    /**
	 * update a user using the @param user.
	 * userID is required to identify the user.
	 * all other fields may or may not be present and will be updated accordingly.
	 * permissions are replaced if available.
	 */
    static async updateUser(user: User) {
        checkAvailable(["userID"], user);
        const {
            userID, //primary key is required
            email = undefined,
            password = undefined,
            globalRole: role = undefined,
            permission = undefined,
            userName = undefined,
            researchAllowed = undefined,
            canvasrefresh = undefined,
            client = pool
        } = user;
        const userid = UUIDHelper.toUUID(userID);
        const binPerm = toBin(permission);
        const hash = password === undefined ? undefined : UserDB.hashPassword(password);
        return client.query(`
		WITH update as (
			UPDATE "Users"
			SET 
			email = COALESCE($2, email),
			hash = COALESCE($3, hash),
			userName = COALESCE($4, userName),
			globalRole = COALESCE($5, globalRole),
            permission = COALESCE($6, permission),
			researchAllowed = COALESCE($7, researchAllowed),
			canvasrefresh = COALESCE($8, canvasrefresh)
			WHERE userID = $1
			RETURNING *
		)
		${usersView("update")}
			`, [userid, email, hash, userName, role, binPerm, researchAllowed, canvasrefresh])
            .then(extract).then(map(userToAPI)).then(one);
    }
	
    /**
	 * deletes a user from the database, based on the userID.
	 */
    static async deleteUser(userID: string, params: DBTools = {}) {
        const userid = UUIDHelper.toUUID(userID);
        const {client = pool} = params;
        return client.query(`
		WITH delete AS (
			DELETE FROM "Users"
			WHERE userID = $1
			RETURNING *
		)
		${usersView("delete")}
			`, [userid])
            .then(extract).then(map(userToAPI)).then(one);
    }
	
    static async addPermissionsUser(userID: string, permission: number, params: DBTools = {}) {
        const userid = UUIDHelper.toUUID(userID),
            binPerm = toBin(permission);
        const {client = pool} = params;
        return client.query(`
		WITH update as (
			UPDATE "Users"
			SET 
			permission = $2 | permission
			WHERE userID = $1
			RETURNING *
		)
		${usersView("update")}
		`, [userid, binPerm])
            .then(extract).then(map(userToAPI)).then(one);
    }
    static async removePermissionsUser(userID: string, permission: number, params: DBTools = {}) {
        const userid = UUIDHelper.toUUID(userID),
            binPerm = toBin(permission);
        const {client = pool} = params;
        return client.query(`
		WITH update as (
			UPDATE "Users"
			SET 
			permission = permission & ~($2::bit(${permissionBits}))
			WHERE userID = $1
			RETURNING *
		)
		${usersView("update")}
		`, [userid, binPerm])
            .then(extract).then(map(userToAPI)).then(one);
    }
	
    /**
	 * Checks if a (user, password) combination exists in the database.
	 * this requires parameters 'email' and 'password'
	 * onSuccess will be called with the corresponding userID to proceed with login.
	 */
    static async loginUser(
        loginRequest: { email: string, password: string },
        onSuccess: (userID: string) => void,
        onUnauthorised: () => void,
        onFailure: (error: Error) => void,
        client: pgDB = pool) {
        const {
            email,
            password
        } = loginRequest;
        const res = await client.query<DBUser, [string]>(`SELECT *
			FROM "Users" 
			WHERE email = $1`, [email])
            .then(extract).then(one).catch((error: Error) => {
                console.error(error);
                return onFailure(error);
            });
        if (res === undefined) {
            return onUnauthorised();
        }
        if (!res.hash) {
            return onFailure(Error("WTF is the database doing"));
        }
        const {hash, userid} = res;
        const userID = UUIDHelper.fromUUID(userid);
        if (userID === undefined) {
            return onFailure(Error("the database is fking with us"));
        }
        if (UserDB.comparePassword(hash, password)) {
            return onSuccess(userID);
        } else {
            return onUnauthorised();
        }
    }
	
    /**
	 * 2 private methods to handle password hashing and comparing.
	 */
    private static comparePassword(hash: string, plain: string): boolean {
        return bcrypt.compareSync(plain, hash);
    }
    private static hashPassword(plain: string): string {
        const saltRounds = 10;
        return bcrypt.hashSync(plain, saltRounds);
    }
	
    /**
	 * generate an invalid password, making sure noone can login through the normal route.
	 */
    static invalidPassword() {
        return "                                        ";
    }
}