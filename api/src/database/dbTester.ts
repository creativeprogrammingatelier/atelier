import UH	from './UsersHelper'
import CH	from './CoursesHelper'
import RPH	from "./RolePermissionsHelper"
import CRH	from './CourseRegistrationHelper'
import SH	from './submissionHelper'
import {courseState} 		from '../../../enums/courseStateEnum'
import {localRoles} 		from '../../../enums/localRoleEnum'
import {submissionStatus}	from '../../../enums/submissionStatusEnum'

import {Course}				from '../../../models/Course'
import {CourseRegistration}	from '../../../models/CourseRegistration'
// console.log = ()=>{}
const uuid = "00000000-0000-0000-0000-000000000000"

function logger(pre: string) {
	return (s:string|object|object[]|void = undefined) => console.log(pre, s)
}
function error(pre:string) {
	return (s:Error) => console.error(pre, s)
}
function log(s : string|object|object[]){console.log(s)}


function usersHelper(){
	console.log("\n\nUSERSHELPER\n\n")
	const user = {name:"C", email:"C@CAA", role:'admin',password:"C"}
	UH.getAllUsers().then(logger('getAllUsers')).catch(error('getAllUsers'))

	UH.getAllStudents().then((res : any) => {
		console.log("getAllUsers", res)
		UH.getUserByID(uuid).then(logger('getUserById')).catch(error('getUserById'))
	}).catch(error("getAllStudents"))


	UH.createUser(user).then(({userid=""}:{userid?:string|undefined}) => {
		console.log("createUser", userid)
		UH.updateUser({userid,role:'user'}).then(()=>{
			console.log("updateUser")
			UH.deleteUser(userid).then(logger('deleteUser')).catch(error('deleteUser'))
		}).catch(error('updateUser'))
	}).catch( error("createUser"))
}

function coursesHelper() {
	console.log("\n\nCOURSESHELPER\n\n")
	let course = {name:"cname",creator:uuid,state:courseState.open}
	let course2 = {name:"newname",creator:undefined,state:courseState.hidden}
	CH.getAllCourses().then(logger('getAllCourses')).catch(error('getAllCourses'))
	
	CH.addCourse(course).then(({courseid="no uuid"}:Course)=>{
		console.log("ADDED",courseid)
		CH.getCourseByID(courseid).then(logger('getCourseByID')).catch(error('getCourseByID'))
		CH.updateCourse({courseid}).then(logger("update1")).catch(error("update1"))
		CH.updateCourse({...course2, courseid}).then(()=>{
			CH.deleteCourseByID(courseid).then(logger('delete')).catch(error('delete'))
		}).catch(error("update2"))
	}).catch(error("addCourse"))
}

function rolesHelper(){
	console.log("\n\nROLESHELPER\n\n")
	let role = "testrole"
	let perm = 64
	RPH.getAllRoles().then(logger('getAllRoles')).catch(error('getAllRoles'))

	RPH.addNewLocalRole(role, perm).then(()=>{ log("addNewLocalRole")
		RPH.addPermissionToRole(role, 32).then(()=>{ log("addPermissionToRole")
			RPH.getRolePermissions(role).then(logger('getRolePermissions')).catch(error('getRolePermissions'))
			RPH.removePermissionFromRole(role, 64).then(()=>{ log("removePermissionFromRole")
				RPH.setPermissionOnRole(role, 127).then(()=>{ log("setPermissionOnRole")
					RPH.deleteLocalRole(role).then(logger('deleteLocalRole')).catch(error('deleteLocalRole'))
				}).catch( error("setPermissionOnRole"))
			}).catch( error("removePermissionFromRole"))
		}).catch( error("addPermissionToRole"))
	}).catch( error("addNewLocalRole"))
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
	CRH.getAllEntries().then(logger('getAllEntries')).catch(error('getAllEntries'))
	CRH.getEntriesByCourse(uuid).then(logger('getEntriesByCourse')).catch(error('getEntriesByCourse'))
	CRH.getEntriesByUser(uuid).then(logger('getEntriesByUser')).catch(error('getEntriesByUser'))
	CRH.addEntry(newEntry).then((res : CourseRegistration) =>{
		const upd = {userid:res.userid, courseid:res.courseid, role:localRoles.TA}
		CRH.updateRole(upd).then(logger('updateRole')).catch(error('updateRole'))
		CRH.addPermission({...newEntry, permission:2048}).then((res : any)=>{
			console.log("addPermission", res)
			CRH.removePermission({...newEntry, permission:2048}).then((res : any) =>{
				console.log("removePermission", res)
				CRH.deleteEntry(newEntry).then(logger('deleteEntry')).catch(error('deleteEntry'))
			}).catch( error("removePermission"))
		}).catch(error("addPermission"))
	}).catch( error("addEntry"))
}

function submissionHelper(){
	console.log("\n\nSUBMISSIONHELPER\n\n")
	SH.getAllSubmissions().then(logger('getAllSubmissions')).catch(error('getAllSubmissions'))
	SH.getSubmissionById(uuid).then(logger('getSubmissionById')).catch(error('getSubmissionById'))
	SH.getUserSubmissions(uuid).then(logger('getUserSubmissions')).catch(error('getUserSubmissions'))

	const sub = {submissionid: undefined, name: "myProject", userid:uuid, date:undefined, state: submissionStatus.closed}
	SH.addSubmission(sub).then((res:{submissionid?: string}) => {
		const id = res.submissionid ? res.submissionid : ""
		// SH.updateSubmission()
	}).catch( error("addSubmission"))
	

}
usersHelper()
setTimeout(coursesHelper,1000)
setTimeout(rolesHelper, 2000)
setTimeout(courseRegistrationHelper, 4000)
setTimeout(submissionHelper, 5000)