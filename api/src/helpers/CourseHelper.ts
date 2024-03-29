import {CoursePartial} from '../../../models/api/Course';
import {CourseRole} from '../../../models/enums/CourseRoleEnum';
import {GlobalRole} from '../../../models/enums/GlobalRoleEnum';
import {CourseRegistrationDB} from '../database/CourseRegistrationDB';
import {pgDB} from '../database/HelperDB';
import {UserDB} from '../database/UserDB';


export async function addUsersFromCanvas(users: any[], client: pgDB, courseRole: CourseRole, course: CoursePartial) {
  for (const user of users) {
    try {
      const userDB: any = await UserDB.getUserByEmail(user.email, client);
      console.log(userDB);
      if (userDB != undefined) {
        await CourseRegistrationDB.addEntry({
          courseID: course.ID,
          userID: userDB.ID,
          courseRole: courseRole,
          client,
        });
      } else if ( user.email != undefined ) {
        const createdUser: any = await UserDB.createUser({userName: user.name, email: user.email, password: UserDB.invalidPassword(), globalRole: GlobalRole.user, client: client});
        await CourseRegistrationDB.addEntry({
          courseID: course.ID,
          userID: createdUser.ID,
          courseRole: courseRole,
          client,
        });
      } else {
        console.log('No email found for user cannot link: ', user.name);
      }
    } catch (e) {
      console.log('No email found for user cannot link: ', user.name);
      console.log(e);
    }
  }
}
