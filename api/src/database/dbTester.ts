import UsersHelper from './UsersHelper'
import C from './CoursesHelper'
import RPH from "./RolePermissionsHelper"
import jwt from 'jsonwebtoken';
import {Constants} from '../lib/constants';
import {courseState} from '../../../enums/courseStateEnum'
import CRH from './CourseRegistrationHelper'
import {localRoles} from '../../../enums/localRoleEnum'
// console.log = ()=>{}
const uuid = "00000000-0000-0000-0000-000000000000"

function logger(pre: string) {
	return (s:any) => console.log(pre, s)
}
function error(pre:string) {
	return (s:any) => console.error(pre, s)
}
function log(s : any){console.log(s)}


function usersHelper(){
	console.log("\n\nUSERSHELPER\n\n")
	const user = {name:"C", email:"C@CAA", role:'admin',password:"C"}
	UsersHelper.getAllUsers(logger("getAllUsers"), error("getAllUsers"))

	UsersHelper.getAllStudents((res : any) => {
		console.log("getAllUsers", res)
		UsersHelper.getUserByID(uuid, logger("getUserById"), error("getUserById"))
	}, error("getAllStudents"))


	UsersHelper.createUser(user, ({userid}:{userid:string}) => {
		console.log("createUser", userid)
		UsersHelper.updateUser({userid,role:'user'},()=>{
			console.log("updateUser")
			UsersHelper.deleteUser(userid, logger("deleteUser"), error("deleteUser"))
		}, error('updateUser'))
	}, error("createUser"))
}

function coursesHelper() {
	console.log("\n\nCOURSESHELPER\n\n")
	let course = {name:"cname",creator:uuid,state:courseState.open}
	let course2 = {name:"newname",creator:undefined,state:courseState.hidden}
	C.getAllCourses(logger("getAllCourses"), error("getAllCourses"))
	
	C.addCourse(course, (courseid:string)=>{
		console.log("ADDED",courseid)
		C.getCourseByID(courseid, logger("getCourseByID"), error("getCourseByID"))
		C.updateCourse({courseid},logger("update1"), logger("update1"))
		C.updateCourse({...course2, courseid}, ()=>{
			C.deleteCourseByID(courseid, logger("delete"), error("delete"))
		}, logger("update2"))
	}, error("addCourse"))
}

function rolesHelper(){
	console.log("\n\nROLESHELPER\n\n")
	let role = "testrole"
	let perm = 64
	RPH.getAllRoles(logger("getAllRoles"), error("getAllRoles"))
	RPH.addNewLocalRole(role, perm, ()=>{ log("addNewLocalRole")
		RPH.addPermissionToRole(role, 32, ()=>{ log("addPermissionToRole")
			RPH.getRolePermissions(role, logger("getRolePermissions"), error("getRolePermissions"))
			RPH.removePermissionFromRole(role, 64, ()=>{ log("removePermissionFromRole")
				RPH.setPermissionOnRole(role, 127, ()=>{ log("setPermissionOnRole")
					RPH.deleteLocalRole(role, logger("deleteLocalRole"), error("deleteLocalRole"))
				}, error("setPermissionOnRole"))
			}, error("removePermissionFromRole"))
		}, error("addPermissionToRole"))
	}, error("addNewLocalRole"))
	// deleteLocalRole
	// removePermissionFromRole
	// addPermissionToRole
	// setPermissionOnRole
	// addNewLocalRole
	// getRolePermissions
}

function courseRegistrationHelper(){

	console.log("\n\nCOURSEREGISTRATIONHELPER\n\n")
	const newEntry = {userid:uuid, courseid:uuid, role:localRoles.teacher,permission:1024}
	CRH.getAllEntries(logger("getAllEntries"), error("getAllEntries"))
	CRH.getEntriesByCourse(uuid, logger("getEntriesByCourse"), error("getEntriesByCourse"))
	CRH.getEntriesByUser(uuid, logger("getEntriesByUser"), error("getEntriesByUser"))
	CRH.addEntry(newEntry, (res : {userid:string, courseid:string}) =>{
		const upd = {userid:res.userid, courseid:res.courseid, role:localRoles.TA}
		CRH.updateRole(upd, logger("updateRole"), error("updateRole"))
		CRH.addPermission({...newEntry, permission:2048}, (res : any)=>{
			console.log("addPermission", res)
			CRH.removePermission({...newEntry, permission:2048},(res : any) =>{
				console.log("removePermission", res)
				CRH.deleteEntry(newEntry, logger("deleteEntry"), error("deleteEntryf"))
			}, error("removePermission"))
		},error("addPermission"))
	}, error("addEntry"))
}

usersHelper()
setTimeout(coursesHelper,1000)
setTimeout(rolesHelper, 2000)
setTimeout(courseRegistrationHelper, 4000)