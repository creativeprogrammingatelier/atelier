import React from "react";
import {DataList} from "../data/DataList";
import {Loading} from "../general/loading/Loading";
import {Course} from "../../../../models/api/Course";
import {getUserCourses} from "../../helpers/api/APIHelper";
import {Panel} from "../general/Panel";
import {User} from "../../../../models/api/User";

interface CourseTabProperties {
    user: User
}

export function CourseTab({user}: CourseTabProperties) {
    return <div className="contentTab">
        <DataList header="Courses">
            <Loading<Course[]>
                loader={getUserCourses}
                params={[user.ID]}
                component={courses =>
                    <div>
                        {courses.map((course: Course) => <Panel
                            key={course.ID}
                            display={course.name}
                            location={`/course/${course.ID}/user/${user.ID}`}
                        />)}
                    </div>
                }
            />
        </DataList>
    </div>
}