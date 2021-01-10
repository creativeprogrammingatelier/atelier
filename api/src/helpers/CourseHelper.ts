import { CoursePartial } from "../../../models/api/Course";
import { User } from "../../../models/database/User";
import { CourseRole } from "../../../models/enums/CourseRoleEnum";
import { GlobalRole } from "../../../models/enums/GlobalRoleEnum";
import { CourseRegistrationDB } from "../database/CourseRegistrationDB";
import { pgDB } from "../database/HelperDB";
import { UserDB } from "../database/UserDB";



export async function addUsersFromCanvas(users: any[], client: pgDB, courseRole: CourseRole, course: CoursePartial){
    for (let user of users){
        let userDB: any  = await UserDB.getUserByEmail(user.email, client)
        if (userDB != [] && userDB[0] != undefined){
            await CourseRegistrationDB.addEntry({
                courseID: course.ID,
                userID: userDB[0].userID,
                courseRole: courseRole,
                client
            });
        } else if ( user.email != undefined ) { 
            let createdUser: any = await UserDB.createUser({ userName: user.name , email: user.email, password: UserDB.invalidPassword(), globalRole: GlobalRole.user, client: client })
            await CourseRegistrationDB.addEntry({
                courseID: course.ID,
                userID: createdUser.ID,
                courseRole: courseRole,
                client
            });
        } else { 
            console.log("No email found for user cannot link: ", user.name)
        }
    }
}