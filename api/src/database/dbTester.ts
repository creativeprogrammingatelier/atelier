import * as HH from './HelperHelper'
import UH	from './UsersHelper'
import CH	from './CoursesHelper'
import RPH	from "./RolePermissionsHelper"
import CRH	from './CourseRegistrationHelper'
import SH	from './submissionHelper'
import FH	from './FileHelper'
import SPH 	from './SnippetHelper'
import TH 	from './ThreadHelper'
import C 	from './CommentsHelper'

import {courseState} 		from '../../../enums/courseStateEnum'
import {localRole} 			from '../../../enums/localRoleEnum'
import {submissionStatus}	from '../../../enums/submissionStatusEnum'
import {threadState}		from '../../../enums/threadStateEnum'

import {Course}				from '../../../models/Course'
import {CourseRegistration}	from '../../../models/CourseRegistration'
import {File}				from '../../../models/File'
import {Snippet}			from '../../../models/Snippet'

const all = true;

let stored = '';
const log = (...args : Array<string|object|void|object[]>) => {
		const reducer = (accumulated : string, next : string) : string => {
			return accumulated+next+'\n'
		}
		const tbp = args.map((el) => JSON.stringify(el,null,4)).reduce(reducer,'----------\n')
		if (all) {
			console.log(tbp);
		} else {
			stored+=tbp;
		}
	}


const uuid = "00000000-0000-0000-0000-000000000000"

function logger(pre: string) {
	return (s:string|object|object[]|void = undefined) => log(pre, s)
}
let OK = true;
function error(pre:string) {
	return (s:Error) => {OK=false; console.error(pre, s)}
}

function promise(pr : Promise<string|object|object[]|void>, s : string){
	pr.then(logger(s)).catch(error(s))
}
function usersHelper() {
	log("\n\nUSERSHELPER\n\n")
	const user = {name:"C", email:"C@CAA", role:'admin',password:"C"}
	promise(UH.getAllUsers(), 'getAllUsers')

	UH.getAllStudents().then((res) => {
		log("getAllUsers", res)
		promise(UH.getUserByID(uuid), 'getUserById')
	}).catch(error("getAllStudents"))


	UH.createUser(user).then(({userID=""}:{userID?:string|undefined}) => {
		log("createUser", userID)
		UH.updateUser({userID,role:'user'}).then(()=>{
			log("updateUser")
			promise(UH.deleteUser(userID), 'deleteUser')
		}).catch(error('updateUser'))
	}).catch( error("createUser"))
}

function coursesHelper() {
	log("\n\nCOURSESHELPER\n\n")
	const course = {name:"cname",creator:uuid,state:courseState.open}
	const course2 = {name:"newname",creator:undefined,state:courseState.hidden}
	promise(CH.getAllCourses(), 'getAllCourses')
	
	CH.addCourse(course).then(({courseID="no uuid"}:Course)=>{
		log("ADDED",courseID)
		promise(CH.getCourseByID(courseID), 'getCourseByID')
		promise(CH.updateCourse({courseID}), "update1")
		CH.updateCourse({...course2, courseID}).then(()=>{
			promise(CH.deleteCourseByID(courseID), 'delete')
		}).catch(error("update2"))
	}).catch(error("addCourse"))
}

function rolesHelper(){
	log("\n\nROLESHELPER\n\n")
	const role = "DEBUG"
	const perm = 64
	promise(RPH.getAllRoles(), 'getAllRoles')

	RPH.addNewLocalRole(role, perm).then(()=>{ log("addNewLocalRole")
		RPH.addPermissionToRole(role, 32).then(()=>{ log("addPermissionToRole")
			promise(RPH.getRolePermissions(role), 'getRolePermissions')
			RPH.removePermissionFromRole(role, 64).then(()=>{ log("removePermissionFromRole")
				RPH.setPermissionOnRole(role, 127).then(()=>{ log("setPermissionOnRole")
					promise(RPH.deleteLocalRole(role), 'deleteLocalRole')
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

	log("\n\nCOURSEREGISTRATIONHELPER\n\n")
	const newEntry = {userID:uuid, courseID:uuid, role:localRole.teacher,permission:1024}
	promise(CRH.getAllEntries(), 'getAllEntries')
	promise(CRH.getEntriesByCourse(uuid), 'getEntriesByCourse')
	promise(CRH.getEntriesByUser(uuid), 'getEntriesByUser')
	CRH.addEntry(newEntry).then((res : CourseRegistration) =>{
		const upd = {userID:res.userID, courseID:res.courseID, role:localRole.TA}
		promise(CRH.updateRole(upd), 'updateRole')
		CRH.addPermission({...newEntry, permission:2048}).then((res : CourseRegistration)=>{
			log("addPermission", res)
			CRH.removePermission({...newEntry, permission:2048}).then((res : CourseRegistration) =>{
				log("removePermission", res)
				promise(CRH.deleteEntry(newEntry), 'deleteEntry')
			}).catch( error("removePermission"))
		}).catch(error("addPermission"))
	}).catch( error("addEntry"))
}

function submissionHelper(){
	log("\n\nSUBMISSIONHELPER\n\n")
	promise(SH.getAllSubmissions(), 'getAllSubmissions')
	promise(SH.getSubmissionById(uuid), 'getSubmissionById')
	promise(SH.getUserSubmissions(uuid), 'getUserSubmissions')
	promise(SH.getSubmissionsByCourse(uuid), 'getSubmissionsByCourse')
	const sub = {submissionID: undefined, courseID: uuid, name: "myProject", userID:uuid, date:undefined, state: submissionStatus.new}
	const sub2 = {submissionID: undefined, name: "mySecondProject", userID:uuid, date:undefined, state: submissionStatus.closed}
	SH.addSubmission(sub).then((res:{submissionID?: string}) => {
		if (res.submissionID===undefined) throw new Error("no submissionid")
		const id = res.submissionID
		SH.updateSubmission({...sub2, submissionID:id}).then(()=>
			promise(SH.deleteSubmission(id), "deleteSubmission")
			).catch(error("updateSubmission"))
	}).catch( error("addSubmission"))
}

function fileHelper(){
	log("\n\nFILEHELPER\n\n")
	
	promise(FH.getAllFiles(), 'getAllFiles')
	promise(FH.getFilesBySubmission(uuid), 'getFilesBySubmission')
	promise(FH.getFileByID(uuid), 'getFileByID')
	const file = {fileID:undefined, submissionID:uuid, pathname:'some/path/to/the/file', type:'pde'}
	FH.addFile(file).then( (res1 : File) => {
		log("addFile", res1)
		if (res1.fileID===undefined) throw new Error("bs1")
		const file2 = {fileID:res1.fileID, pathname:'new/path/to/file', type:'dir'}
		FH.updateFile(file2).then( (res2 : File) => {
			log("updateFile", res2)
			if (res2.fileID===undefined) throw new Error("bs2")
			promise(FH.deleteFile(res2.fileID), "deleteFile")
		}).catch(error("updateFile"))
	}).catch("addFile")
}

function snippetHelper(){
	log("\n\nSNIPPETHELPER\n\n")
	promise(SPH.getAllSnippets(), 'getAllSnippets')
	promise(SPH.getSnippetsByFile(uuid), 'getSnippetsByFile')
	promise(SPH.getSnippetByID(uuid), 'getSubmissionById')

	const snip1 = {lineStart:0, lineEnd:3, charStart:2, charEnd:0, fileID:uuid}
	const snip2 = {snippetID:"",lineStart:1, lineEnd:5, charStart:12, charEnd:12, fileID:uuid}
	SPH.addSnippet(snip1).then((res : Snippet) => {
		log('addSnippet', res)
		snip2.snippetID = res.snippetID!
		SPH.updateSnippet(snip2).then((res2 : Snippet)=>{
			log("updateSnippet", res2)
			promise(SPH.deleteSnippet(res2.snippetID!), "deleteSnippet")
		}).catch("updateSnippet")
	}).catch("addSnippet")
}

async function ThreadHelper() {
	log("\n\nTHREADHELPER\n\n")
	promise(TH.getAllThreads(), "getAllThreads")
	promise(TH.getThreadsLimit(1), "getThreadsLimit")
	promise(TH.getThreadByID(uuid), "getThredByID")
	promise(TH.getThreadsBySubmission(uuid), "getThreadsBySubmission")
	promise(TH.getThreadsByFile(uuid), "getThreadsByFile")
	const T1 = await TH.addThread({submissionID:uuid, fileID:uuid, snippetID: uuid, visibilityState:threadState.public})
	log("addThread",T1)
	const T2 = {commentThreadID:T1.commentThreadID, visibilityState:threadState.private}
	promise(TH.updateThread(T2), "updateThread")
	promise(TH.deleteThread(T1.commentThreadID!), "deleteThread")
}

async function commentHelper(){
	log("\n\nCOMMENTHELPER\n\n")
	promise(C.getAllComments(), "getAllComments")
	promise(C.getCommentByID(uuid), "getCommentByID")
	promise(C.getCommentsByThread(uuid), "getCommentsBySubmission")
	const C1 = await C.addComment({commentThreadID:uuid, userID:uuid, body:"this is a comment i just made!"})
	log("addComment", C1)
	promise(C.updateComment({commentID:C1.commentID, body: "this is an edited comment"}), "updateComment")
	promise(C.deleteComment(C1.commentID), "deleteComment")
}

function finish(){
	HH.end()
	console.log('\n\n-----------------',OK? 'all OK' : 'there were errors')
	console.log(stored)
}
setTimeout(usersHelper, 0)
setTimeout(coursesHelper,100)
setTimeout(rolesHelper, 200)
setTimeout(courseRegistrationHelper, 300)
setTimeout(submissionHelper, 400)
setTimeout(fileHelper, 500)
setTimeout(snippetHelper, 600)
setTimeout(ThreadHelper, 700)
setTimeout(commentHelper, 800)
setTimeout(finish, 1000)