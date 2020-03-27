import { useCache, CacheState } from "./Cache";
import { Course } from "../../../../models/api/Course";
import { getCourses, createCourse, permission } from "../../../helpers/APIHelper";
import { courseState } from "../../../../models/enums/courseStateEnum";
import { randomBytes } from "crypto";
import { User } from "../../../../models/api/User";
import { Permission } from "../../../../models/api/Permission";
import { globalRole } from "../../../../models/enums/globalRoleEnum";

