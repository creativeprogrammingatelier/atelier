import { CoursePartial } from "../../../models/api/Course";
import { User } from "../../../models/api/User";
import { CourseRole } from "../../../models/enums/CourseRoleEnum";
import { GlobalRole } from "../../../models/enums/GlobalRoleEnum";
import { CourseRegistrationDB } from "../database/CourseRegistrationDB";
import { NotFoundDatabaseError } from "../database/DatabaseErrors";
import { pgDB } from "../database/HelperDB";
import { UserDB } from "../database/UserDB";
import { CanvasUser } from "./CanvasHelper";

export async function addUsersFromCanvas(
    users: CanvasUser[],
    client: pgDB,
    courseRole: CourseRole,
    course: CoursePartial
){
    for (const user of users){
        if (user.email === undefined) {
            console.log(`[Canvas import] Received no email for user ${user.name}.`);
            continue;
        }

        let userDB: User;
        try {
            userDB = await UserDB.getUserByEmail(user.email, client);
        } catch (e) {
            if (e instanceof NotFoundDatabaseError) {
                userDB = await UserDB.createUser({
                    userName: user.name,
                    email: user.email,
                    password: UserDB.invalidPassword(),
                    globalRole: GlobalRole.user,
                    client: client
                });
            } else {
                throw e;
            }
        }

        await CourseRegistrationDB.addEntry({
            courseID: course.ID,
            userID: userDB.ID,
            courseRole: courseRole,
            client
        });
    }
}
