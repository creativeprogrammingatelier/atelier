import React, {useState, Fragment} from "react";
import {User} from "../../../../../models/api/User";
import {courseDisenrollUser} from "../../../../helpers/APIHelper";
import {CourseUser} from "../../../../../models/api/CourseUser";
import {UserSearch} from "../user/UserSearch";
import {Button, Form} from "react-bootstrap";
import {UserInfo} from "../user/UserInfo";

interface CourseSettingsDisenrollmentProperties {
    courseID: string
}

export function CourseSettingsDisenrollment({courseID}: CourseSettingsDisenrollmentProperties) {
    const [user, setUser] = useState(undefined as User | undefined);

    function disenrollUser() {
        if (user) {
            console.log("Disenrolling user");
            console.log(user);
            courseDisenrollUser(courseID, user.ID)
                .then((user: CourseUser) => {
                    console.log("User disenrolled");
                    // TODO: Visual user feedback
                });
            setUser(undefined);
        }
    }

    return <Form>
        <UserSearch onSelected={setUser}/>
        {
            user &&
            <Fragment>
                <UserInfo user={user}/>
                <Button onClick={disenrollUser}>Disenroll User</Button>
            </Fragment>
        }
    </Form>
}