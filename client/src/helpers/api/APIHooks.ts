import { useCache } from "./Cache";
import { Course } from "../../../../models/api/Course";
import { getCourses, createCourse, permission } from "../../../helpers/APIHelper";
import { courseState } from "../../../../models/enums/courseStateEnum";
import { randomBytes } from "crypto";
import { User } from "../../../../models/api/User";
import { Permission } from "../../../../models/api/Permission";

export function useCourses() {
    const { collectionItems, add, replace, replaceAll } = useCache<Course>("courses");
    const refresh = () => {
        console.log("Refreshing courses");
        getCourses().then(courses => replaceAll(courses));
    }
    const create = ({ name, state }: { name: string, state: courseState }) => {
        console.log("Creating new course:", name);
        const tempID = randomBytes(32).toString('hex');
        createCourse({ name, state })
            .then(course => {
                console.log("Course created:", course.name, "ID:", course.ID);
                replace(c => c.ID === tempID, course);
            });
        add({
            ID: tempID,
            name, state,
            creator: {} as User,
            currentUserPermission: {} as Permission
        });
    }
    if (collectionItems.length === 0) refresh(); // TODO: better check
    return {
        courses: collectionItems,
        createCourse: create,
        refreshCourses: refresh
    };
}
