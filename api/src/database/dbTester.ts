import {end, pgDB } from './HelperDB'
import {UserDB as UH}	from './UserDB'
import {CourseDB as CH}	from './CourseDB'
import {RolePermissionDB as RPH}	from "./RolePermissionDB"
import {CourseRegistrationDB as CRH}	from './CourseRegistrationDB'
import {SubmissionDB as SH}	from './SubmissionDB'
import {FileDB as FH}	from './FileDB'
import {SnippetDB as SPH} 	from './SnippetDB'
import {ThreadDB as TH} 	from './ThreadDB'
import {CommentDB as C} 	from './CommentDB'

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
function log<T>(a : string, b ?:T) : void {
		const reducer = (accumulated : string, next : string) : string => {
			return accumulated+next+'\n'
		}
		const tbp = a + JSON.stringify(b,null,4);
		if (all) {
			console.log(tbp);
		} else {
			stored+=tbp+"---------\n";
		}
	}


const uuid = "00000000-0000-0000-0000-000000000000"

function logger<T>(pre: string) {
	return (s: T) => {log<T>(pre, s); return s}
}
let OK = true;
function error(pre:string) {
	return (s:Error) => {OK=false; console.error(pre, s); throw s}
}

function promise<T>(pr : Promise<T>, s : string) : Promise<T>{
	return pr.then(logger(s)).catch(error(s))
}
async function usersHelper() {
	log("\n\nUSERSHELPER\n\n")
	const user = {name:"C", email:"C@CAA", role:'admin',password:"C"}
	await promise(UH.getAllUsers(), 'getAllUsers')
	await promise(UH.getAllStudents(), "getAllStudents")
	await promise(UH.getUserByID(uuid), 'getUserById')
	const {userID} = await promise(UH.createUser(user), 'createUser')
	await promise(UH.updateUser({userID, role:'user'}), 'updateUser')
	await promise(UH.deleteUser(userID!), 'deleteUser')
}

async function coursesHelper() {
	log("\n\nCOURSESHELPER\n\n")
	const course = {name:"cname",creator:uuid,state:courseState.open}
	const course2 = {name:"newname",creator:undefined,state:courseState.hidden}
	await promise(CH.getAllCourses(), 'getAllCourses')
	const {courseID="no uuid"} = await promise(CH.addCourse(course), "addCourse")
	await promise(CH.getCourseByID(courseID), 'getCourseByID')
	await promise(CH.updateCourse({courseID}), "updateCourse1")
	await promise(CH.updateCourse({...course2, courseID}), "updateCourse2")
	await promise(CH.deleteCourseByID(courseID), 'delete')
}

async function rolesHelper(){
	log("\n\nROLESHELPER\n\n")
	const role = "DEBUG"
	const perm = 64
	await promise(RPH.getAllRoles(), 'getAllRoles')
	await promise(RPH.addNewLocalRole(role, perm), 'addNewLocalRole')
	await promise(RPH.addPermissionToRole(role, 32),"addPermissionToRole")
	await promise(RPH.getRolePermissions(role), 'getRolePermissions')
	await promise(RPH.removePermissionFromRole(role, 64), "removePermissionFromRole")
	await promise(RPH.setPermissionOnRole(role, 127), "setPermissionOnRole")
	await promise(RPH.deleteLocalRole(role), 'deleteLocalRole')
}

async function courseRegistrationHelper(){

	log("\n\nCOURSEREGISTRATIONHELPER\n\n")
	const newEntry = {userID:uuid, courseID:uuid, role:localRole.teacher,permission:1024}
	await promise(CRH.getAllEntries(), 'getAllEntries')
	await promise(CRH.getEntriesByCourse(uuid), 'getEntriesByCourse')
	await promise(CRH.getEntriesByUser(uuid), 'getEntriesByUser')
	const res = await promise(CRH.addEntry(newEntry), 'addEntry')
	const upd = {userID:res.userID, courseID:res.courseID, role:localRole.TA}
	await promise(CRH.updateRole(upd), 'updateRole')
	await promise(CRH.addPermission({...newEntry, permission:2048}), "addPermission")
	await promise(CRH.removePermission({...newEntry, permission:2048}), "removePermsision")
	await promise(CRH.deleteEntry(newEntry), 'deleteEntry')
}

async function submissionHelper(){
	log("\n\nSUBMISSIONHELPER\n\n")
	await promise(SH.getAllSubmissions(), 'getAllSubmissions')
	await promise(SH.getSubmissionById(uuid), 'getSubmissionById')
	await promise(SH.getUserSubmissions(uuid), 'getUserSubmissions')
	await promise(SH.getSubmissionsByCourse(uuid), 'getSubmissionsByCourse')
	const sub = {submissionID: undefined, courseID: uuid, name: "myProject", userID:uuid, date:undefined, state: submissionStatus.new}
	const sub2 = {submissionID: undefined, name: "mySecondProject", userID:uuid, date:undefined, state: submissionStatus.closed}
	const res = await promise(SH.addSubmission(sub), 'addSubmission')
	if (res.submissionID===undefined) throw new Error("no submissionid")
	await promise(SH.updateSubmission({...sub2, submissionID:res.submissionID}), 'updateSubmission')
	await promise(SH.deleteSubmission(res.submissionID), "deleteSubmission")
}

async function fileHelper(){
	log("\n\nFILEHELPER\n\n")
	
	await promise(FH.getAllFiles(), 'getAllFiles')
	await promise(FH.getFilesBySubmission(uuid), 'getFilesBySubmission')
	await promise(FH.getFileByID(uuid), 'getFileByID')
	const file = {fileID:undefined, submissionID:uuid, pathname:'some/path/to/the/file', type:'pde'}
	const res1 = await promise(FH.addFile(file), 'addFile')
	if (res1.fileID===undefined) throw new Error("bs1")
	const file2 = {fileID:res1.fileID, pathname:'new/path/to/file', type:'dir'}
	const res2 = await promise(FH.updateFile(file2), 'updateFile')
	if (res2.fileID===undefined) throw new Error("bs2")
	await promise(FH.deleteFile(res2.fileID), "deleteFile")
}

async function snippetHelper(){
	log("\n\nSNIPPETHELPER\n\n")
	await promise(SPH.getAllSnippets(), 'getAllSnippets')
	await promise(SPH.getSnippetsByFile(uuid), 'getSnippetsByFile')
	await promise(SPH.getSnippetByID(uuid), 'getSubmissionById')

	const snip1 = {lineStart:0, lineEnd:3, charStart:2, charEnd:0, fileID:uuid}
	const snip2 = {snippetID:"",lineStart:1, lineEnd:5, charStart:12, charEnd:12, fileID:uuid}
	const res = await promise(SPH.addSnippet(snip1), 'addSnippet')
	snip2.snippetID = res.snippetID!
	const res2 = await promise(SPH.updateSnippet(snip2), "updateSnippet")
	await promise(SPH.deleteSnippet(res2.snippetID!), "deleteSnippet")

}

async function ThreadHelper() {
	log("\n\nTHREADHELPER\n\n")
	const T0={submissionID:uuid, fileID:uuid, snippetID: uuid, visibilityState:threadState.public}
	await promise(TH.getAllThreads(), "getAllThreads")
	await promise(TH.getThreadsLimit(1), "getThreadsLimit")
	await promise(TH.getThreadByID(uuid), "getThredByID")

	await promise(TH.addComments(TH.getAllThreads()), "addComments")
	await promise(TH.addComments(TH.getThreadsLimit(1)), "addComments2")
	await promise(TH.addCommentSingle(TH.getThreadByID(uuid)), "addCommentSingle")

	await promise(TH.getThreadsBySubmission(uuid), "getThreadsBySubmission")
	await promise(TH.getThreadsByFile(uuid), "getThreadsByFile")
	const T1 = await promise(TH.addThread(T0), "addThread")
	const T2 = {commentThreadID:T1.commentThreadID, visibilityState:threadState.private}
	await promise(TH.updateThread(T2), "updateThread")
	await promise(TH.deleteThread(T1.commentThreadID!), "deleteThread")
}

async function commentHelper(){
	log("\n\nCOMMENTHELPER\n\n")
	await promise(C.getAllComments(), "getAllComments")
	await promise(C.getCommentByID(uuid), "getCommentByID")
	await promise(C.getCommentsByThread(uuid), "getCommentsBySubmission")
	const C1 = await promise(C.addComment({commentThreadID:uuid, userID:uuid, body:"this is a comment i just made!"}), 'addComment')
	await promise(C.updateComment({commentID:C1.commentID, body: "this is an edited comment"}), "updateComment")
	await promise(C.deleteComment(C1.commentID!), "deleteComment")
	await promise(C.textSearch('comment'), "textSearch")
}

function finish(){
	end()
	console.log('\n\n-----------------',OK? 'all OK' : 'there were errors')
	if (!OK) console.log(stored)
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