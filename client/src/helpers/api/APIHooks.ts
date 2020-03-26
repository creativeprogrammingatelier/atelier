import { useCache, CacheState } from "./Cache";
import { Course } from "../../../../models/api/Course";
import { getCourses, createCourse, permission } from "../../../helpers/APIHelper";
import { courseState } from "../../../../models/enums/courseStateEnum";
import { randomBytes } from "crypto";
import { User } from "../../../../models/api/User";
import { Permission } from "../../../../models/api/Permission";
import { globalRole } from "../../../../models/enums/globalRoleEnum";

export function useCourses() {
    const { collection, collectionItems, add, replace, replaceAll } = useCache<Course>("courses");
    const refresh = () => {
        console.log("Refreshing courses");
        getCourses().then(courses => replaceAll(courses));
    }
    const create = ({ name, state }: { name: string, state: courseState }) => {
        console.log("Creating new course:", name);
        const tempID = randomBytes(32).toString('hex');
        createCourse({ name, state }).then(course => {
            console.log("Course created:", course.name, "ID:", course.ID);
            replace(c => c.ID === tempID, course, CacheState.Loaded);
        });
        add({
            ID: tempID,
            name, state,
            creator: {} as User,
            currentUserPermission: {} as Permission
        }, CacheState.Loading);
    }
    if (collectionItems.length === 0) refresh(); // TODO: better check
    return {
        courses: collectionItems,
        coursesState: collection.state,
        createCourse: create,
        refreshCourses: refresh
    };
}

export function usePermission() {
    const { collectionItems, replaceAll } = useCache<Permission>("currentUserPermission");
    const refresh = () => {
        permission().then(permission => replaceAll([permission]));
    }
    if (collectionItems.length === 0) refresh();
    return {
        permission: collectionItems[0] || { permissions: 0, globalRole: globalRole.unregistered },
        refreshPermission: refresh
    }
}