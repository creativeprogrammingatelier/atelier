import UH	from './UsersHelper'
import CH	from './CoursesHelper'
import RPH	from "./RolePermissionsHelper"
import CRH	from './CourseRegistrationHelper'
import SH	from './submissionHelper'
import FH	from './FileHelper'

import {courseState} 		from '../../../enums/courseStateEnum'
import {localRole} 		from '../../../enums/localRoleEnum'
import {submissionStatus}	from '../../../enums/submissionStatusEnum'

import {Course}				from '../../../models/Course'
import {CourseRegistration}	from '../../../models/CourseRegistration'
import {File}				from '../../../models/File'
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


	UH.createUser(user).then(({userID=""}:{userID?:string|undefined}) => {
		console.log("createUser", userID)
		UH.updateUser({userID,role:'user'}).then(()=>{
			console.log("updateUser")
			UH.deleteUser(userID).then(logger('deleteUser')).catch(error('deleteUser'))
		}).catch(error('updateUser'))
	}).catch( error("createUser"))
}

function coursesHelper() {
	console.log("\n\nCOURSESHELPER\n\n")
	let course = {name:"cname",creator:uuid,state:courseState.open}
	let course2 = {name:"newname",creator:undefined,state:courseState.hidden}
	CH.getAllCourses().then(logger('getAllCourses')).catch(error('getAllCourses'))
	
	CH.addCourse(course).then(({courseID="no uuid"}:Course)=>{
		console.log("ADDED",courseID)
		CH.getCourseByID(courseID).then(logger('getCourseByID')).catch(error('getCourseByID'))
		CH.updateCourse({courseID}).then(logger("update1")).catch(error("update1"))
		CH.updateCourse({...course2, courseID}).then(()=>{
			CH.deleteCourseByID(courseID).then(logger('delete')).catch(error('delete'))
		}).catch(error("update2"))
	}).catch(error("addCourse"))
}

function rolesHelper(){
	console.log("\n\nROLESHELPER\n\n")
	let role = "DEBUG"
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
	const newEntry = {userID:uuid, courseID:uuid, role:localRole.teacher,permission:1024}
	CRH.getAllEntries().then(logger('getAllEntries')).catch(error('getAllEntries'))
	CRH.getEntriesByCourse(uuid).then(logger('getEntriesByCourse')).catch(error('getEntriesByCourse'))
	CRH.getEntriesByUser(uuid).then(logger('getEntriesByUser')).catch(error('getEntriesByUser'))
	CRH.addEntry(newEntry).then((res : CourseRegistration) =>{
		const upd = {userID:res.userID, courseID:res.courseID, role:localRole.TA}
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
	const sub = {submissionID: undefined, name: "myProject", userID:uuid, date:undefined, state: submissionStatus.new}
	const sub2 = {submissionID: undefined, name: "mySecondProject", userID:uuid, date:undefined, state: submissionStatus.closed}
	SH.addSubmission(sub).then((res:{submissionID?: string}) => {
		if (res.submissionID===undefined) throw new Error("no submissionid")
		const id = res.submissionID
		SH.updateSubmission({...sub2, submissionID:id}).then(()=>
			SH.deleteSubmission(id).then(logger("deleteSubmission")).catch(error("deleteSubmission"))
			).catch(error("updateSubmission"))
	}).catch( error("addSubmission"))
}

function fileHelper(){
	FH.getAllFiles().then(logger('getAllFiles')).catch(error('getAllFiles'))
	FH.getFilesBySubmission(uuid).then(logger('getFilesBySubmission')).catch(error('getFilesBySubmission'))
	FH.getFileByID(uuid).then(logger('getFileByID')).catch(error('getFileByID'))
	const file = {fileID:undefined, submissionID:uuid, pathname:'some/path/to/the/file', type:'pde'}
	FH.addFile(file).then( (res1 : File) => {
		console.log("addFile", res1)
		if (res1.fileID===undefined) throw new Error("bs1")
		const file2 = {fileID:res1.fileID, path:'new/path/to/file', type:'dir'}
		FH.updateFile(file2).then( (res2 : File) => {
			console.log("updateFile", res2)
			if (res2.fileID===undefined) throw new Error("bs2")
			FH.deleteFile(res2.fileID).then(logger("deleteFile")).catch(error("deleteFile"))
		}).catch(error("updateFile"))
	}).catch("addFile")
}
setTimeout(usersHelper, 0)
setTimeout(coursesHelper,100)
setTimeout(rolesHelper, 200)
setTimeout(courseRegistrationHelper, 300)
setTimeout(submissionHelper, 400)
setTimeout(fileHelper, 500)