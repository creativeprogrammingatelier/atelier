import UsersHelper from './UsersHelper'
import C from './CoursesHelper'
import RPH from "./RolePermissionsHelper"
import jwt from 'jsonwebtoken';
import {Constants} from '../lib/constants';
import {courseState} from '../../../enums/courseStateEnum'

function logger(pre: string) {
	return (s:any) => console.log(pre, s)
}
function log(s : any){console.log(s)}


function usersHelper(){
	console.log("\n\nUSERSHELPER\n\n")
	let user = {name:"C", email:"C@CAA", role:'admin',password:"C"}
	UsersHelper.getAllUsers(logger("getAllUsers"),logger("getAllUsers"))

	UsersHelper.getAllStudents(logger("getAllStudents"),logger("getAllStudents"))

	UsersHelper.getUserByID(1, logger("getUserById"),logger("getUserById"))

	UsersHelper.getUserByID(2, logger("getUserById"),logger("getUserById"))

	UsersHelper.createUserActual(user, ({userid}:{userid:number}) => {
		console.log("createUserActual", userid)
		UsersHelper.updateUser({userid:userid,role:'user'},()=>{
			console.log("updateUser")
			UsersHelper.deleteUser(userid, logger("deleteUser"), logger("deleteUser"))
		}, logger('updateUser'))
	},logger("createUserActual"))
}

function coursesHelper() {
	console.log("\n\nCOURSESHELPER\n\n")
	let course = {name:"cname",creator:1,state:courseState.open}
	let course2 = {name:"newname",creator:undefined,state:courseState.hidden}
	C.getAllCourses(logger("getAllCourses"),logger("getAllCourses"))
	
	C.addCourse(course, (courseid:number)=>{
		console.log("ADDED",courseid)
		C.getCourseByID(courseid, logger("getCourseByID"),logger("getCourseByID"))
		C.updateCourse({courseid:1},logger("update1"), logger("update1"))
		C.updateCourse({...course2, courseid:courseid}, ()=>{
			C.deleteCourseByID(courseid, logger("delete"), logger("delete"))
		}, logger("update2"))
	}, logger("addCourse"))
}

function rolesHelper(){
	console.log("\n\nROLESHELPER\n\n")
	let role = "testrole"
	let perm = 64
	RPH.getAllRoles(logger("getAllRoles"),logger("getAllRoles"))
	RPH.addNewLocalRole(role, perm, ()=>{ log("addNewLocalRole")
		RPH.addPermissionToRole(role, 32, ()=>{ log("addPermissionToRole")
			RPH.getRolePermissions(role, logger("getRolePermissions"), logger("getRolePermissions"))
			RPH.removePermissionFromRole(role, 64, ()=>{ log("removePermissionFromRole")
				RPH.setPermissionOnRole(role, 127, ()=>{ log("setPermissionOnRole")
					RPH.deleteLocalRole(role, logger("deleteLocalRole"), logger("deleteLocalRole"))
				}, logger("setPermissionOnRole"))
			}, logger("removePermissionFromRole"))
		}, logger("addPermissionToRole"))
	}, logger("addNewLocalRole"))
	// deleteLocalRole
	// removePermissionFromRole
	// addPermissionToRole
	// setPermissionOnRole
	// addNewLocalRole
	// getRolePermissions
	
}

usersHelper()
setTimeout(coursesHelper,1000)
setTimeout(rolesHelper, 2000)