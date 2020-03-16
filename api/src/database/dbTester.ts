import {end, pgDB, one } from './HelperDB'
import {UserDB as UH}	from './UserDB'
import {CourseDB as CH}	from './CourseDB'
import {CourseRoleDB as RPH}	from "./CourseRoleDB"
import {CourseRegistrationDB as CRH}	from './CourseRegistrationDB'
import {SubmissionDB as SH}	from './SubmissionDB'
import {FileDB as FH}	from './FileDB'
import {SnippetDB as SPH, SnippetDB} 	from './SnippetDB'
import {ThreadDB as TH} 	from './ThreadDB'
import {CommentDB as C} 	from './CommentDB'
import {MentionsDB as M}	from './MentionsDB'

import {courseState} 		from '../../../models/enums/courseStateEnum'
import {courseRole} 			from '../../../models/enums/courseRoleEnum'
import {submissionStatus}	from '../../../models/enums/submissionStatusEnum'
import {threadState}		from '../../../models/enums/threadStateEnum'

import {Snippet, DBSnippet}			from '../../../models/database/Snippet'
import { UUIDHelper } from '../helpers/UUIDHelper'
import { deepEqual, notDeepEqual, equal, notEqual, AssertionError } from 'assert'
import { Course } from '../../../models/database/Course'
import util from 'util'
import { Mention } from '../../../models/database/Mention'
import { CourseInviteDB as CI, CourseInviteDB } from './CourseInviteDB'
import { PluginsDB as P } from './PluginsDB'
import { getEnum } from '../../../models/enums/enumHelper'
import { globalRole } from '../../../models/enums/globalRoleEnum'

const ok = "✓",
	fail = "✖"

const all = false;

let stored = '';
function log<T>(a : string, b ?:T) : void {
		const reducer = (accumulated : string, next : string) : string => {
			return accumulated+next+'\n'
		}
		const tbp = a + (b===undefined?'':JSON.stringify(b,null,4));
		if (all) {
			console.log(tbp);
		} else {
			stored+=tbp+"\n---------\n";
		}
	}


const uuid = UUIDHelper.fromUUID("00000000-0000-0000-0000-000000000000")

function logger<T>(pre: string) {
	return (s: T) => {log<T>(pre, s); return s}
}
let errors = 0;
function error(pre : string){
	return (e : Error) => {log(pre, e); throw e}
}

function promise<T>(pr : Promise<T>, s : string) : Promise<T>{
	return pr.then(logger(s)).catch(error(s))
}
async function usersHelper() {
	log("\n\nUSERSHELPER\n\n")
	const user = {userName:"C", email:"C@CAA", role:globalRole.admin,password:"C", permission:1}
	const t1 = new Date()
	await promise(UH.getAllUsers(), 'getAllUsers')
	await promise(UH.getAllStudents(), "getAllStudents")
	await promise(UH.getUserByID(uuid), 'getUserById')
	const {ID:userID} = await promise(UH.createUser(user), 'createUser')
	await promise(UH.updateUser({userID, role:globalRole.user}), 'updateUser')
	const {permission : {permissions:p1}} = await promise(UH.addPermissionsUser(userID, 15), 'addPermissions')
	equal(p1, 15, "addPermissions")
	const {permission: {permissions:p2}} = await promise(UH.removePermissionsUser(userID, 6), 'addPermissions')
	equal(p2, 9)
	await promise(UH.deleteUser(userID!), 'deleteUser')
}

async function coursesHelper() {
	log("\n\nCOURSESHELPER\n\n")
	const course : Course= {courseName:"cname",creatorID:uuid,state:courseState.open}
	const course2 = {courseName:"newname",creatorID:uuid,state:courseState.hidden}
	const res = await promise(CH.getAllCourses(), 'getAllCourses')
	const r1 = await promise(CRH.addPermissionsCourse(res, {userID:uuid}), "addPermissions")
	const {ID="no uuid"} = await promise(CH.addCourse(course), "addCourse")
	await promise(CH.getCourseByID(ID), 'getCourseByID')
	await promise(CH.updateCourse({courseID:ID}), "updateCourse1")
	await promise(CH.updateCourse({...course2, courseID:ID}), "updateCourse2")
	await promise(CH.deleteCourseByID(ID), 'delete')
}

async function rolesHelper(){
	log("\n\nROLESHELPER\n\n")
	const role = "DEBUG"
	const perm = 64
	let noError;
	try {
		noError=false
		getEnum(courseRole, role)
		noError = true
	} catch (e){
		//pass, do nothing
	}
	equal(noError, false, "role DEBUG should not yet exist in the courseRoleEnum");
	
	await promise(RPH.getAllRoles(), 'getAllRoles')
	await promise(RPH.addNewCourseRole(role, perm), 'addNewCourseRole')
	try {
		noError = false
		getEnum(courseRole,role)
		noError = true
	} catch (e){
		//pass, do nothing
	}
	equal(noError, true, "role DEBUG should now exist in the courseRoleEnum");
	
	await promise(RPH.addPermissionToRole(role, 32),"addPermissionToRole")
	await promise(RPH.getRolePermissions(role), 'getRolePermissions')
	await promise(RPH.removePermissionFromRole(role, 64), "removePermissionFromRole")
	await promise(RPH.setPermissionOnRole(role, 127), "setPermissionOnRole")
	await promise(RPH.deleteCourseRole(role), 'deleteCourseRole')
	try {
		noError=false
		getEnum(courseRole,role)
		noError = true
	} catch (e){
		//pass, do nothing
	}
	equal(noError, false, "role DEBUG should no longer exist in the courseRoleEnum");
}

async function courseRegistrationHelper(){

	log("\n\nCOURSEREGISTRATIONHELPER\n\n")
	const newEntry = {userID:uuid, courseID:uuid, role:courseRole.teacher,permission:5}
	equal(newEntry.permission, 5)
	const r1 = await promise(CRH.getAllEntries(), 'getAllEntries')
	await promise(CRH.getEntriesByCourse(uuid), 'getEntriesByCourse')
	
	const res = await promise(CRH.addEntry(newEntry), 'addEntry')
	const upd = {userID:res.userID, courseID:res.courseID, role:courseRole.TA}
	await promise(CRH.getEntriesByUser(uuid), 'getEntriesByUser')
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
	const sub = {submissionID: undefined, courseID: uuid, title: "myProject", userID:uuid, date:undefined, state: submissionStatus.new}
	const sub2 = {submissionID: undefined, title: "mySecondProject", userID:uuid, date:undefined, state: submissionStatus.closed}
	const res = await promise(SH.addSubmission(sub), 'addSubmission')
	if (res.ID===undefined) throw new Error("no submissionid")
	await promise(SH.updateSubmission({...sub2, submissionID:res.ID}), 'updateSubmission')
	await promise(SH.deleteSubmission(res.ID), "deleteSubmission")
}

async function fileHelper(){
	log("\n\nFILEHELPER\n\n")
	await promise(FH.getNullFileID(uuid), 'nullfile')
	const list = await promise(FH.getAllFiles(), 'getAllFiles')
	await promise(FH.getFilesBySubmission(uuid), 'getFilesBySubmission')
	await promise(FH.getFilesBySubmissionIDS(list.map(x=>x.references.submissionID)), 'filesMap')
	await promise(FH.getFileByID(uuid), 'getFileByID')
	const file = {fileID:undefined, submissionID:uuid, pathname:'some/path/to/the/file', type:'pde'}
	const res1 = await promise(FH.addFile(file), 'addFile')
	if (res1.ID===undefined) throw new Error("bs1")
	const file2 = {fileID:res1.ID, pathname:'new/path/to/file', type:'dir'}
	const res2 = await promise(FH.updateFile(file2), 'updateFile')
	if (res2.ID===undefined) throw new Error("bs2")
	await promise(FH.deleteFile(res2.ID), "deleteFile")
}

async function snippetHelper(){
	log("\n\nSNIPPETHELPER\n\n")
	await promise(SPH.getAllSnippets(), 'getAllSnippets')
	await promise(SPH.getSnippetsByFile(uuid), 'getSnippetsByFile')
	const snip = await promise(SPH.getSnippetByID(uuid), 'getSnippetByID')
	const snip2 : Snippet = {snippetID: snip.ID, body:snip.body+"AB"}
	const res2 = await promise(SPH.updateSnippet(snip2), "updateSnippet")

	const snip1 : Snippet = {lineStart:0, lineEnd:3, charStart:2, charEnd:0, body:"this is the body", contextAfter:'abc', contextBefore:'def'}
	
	const id = await promise(SPH.addSnippet(snip1), 'addSnippet')
	await promise(SPH.deleteSnippet(id), "deleteSnippet")

}

async function ThreadHelper() {
	log("\n\nTHREADHELPER\n\n")
	const snippetID = await promise(SPH.createNullSnippet(), "addSnippet")
	const fileID = await promise(FH.createNullFile(uuid), "createNULL")
	notEqual(fileID, undefined, "fileID not null"+fileID )
	const T0={submissionID:uuid, fileID, snippetID, visibilityState:threadState.public}
	const items = await promise(TH.getAllThreads(), "getAllThreads")
	const i0 = await promise(TH.getAllThreads({limit:1}), "getThreadsLimit")
	const i1 = await promise(TH.getAllThreads({limit:1,offset:1}), "getThreadsLimitOffset")
	equal(i0.length, 1, "limit 1 did not give 1 result")
	deepEqual(i0[0], items[0], "ordering differs")
	deepEqual(i1[0], items[1], "offset did not give second result")
	deepEqual(i1[0], items[1], "ordering differs 2nd item")
	await promise(TH.getThreadByID(uuid), "getThredByID")
	const com1 = await promise(TH.filterThread({addComments:true}), "addComments")
	const com2 = await promise(TH.addComments(TH.filterThread({})), "addComments2")
	deepEqual(com2, com1, "adding comments manually is not the same...")
	await promise(TH.addCommentSingle(TH.getThreadByID(uuid)), "addCommentSingle")

	await promise(TH.getThreadsBySubmission(uuid), "getThreadsBySubmission")
	await promise(TH.getThreadsByFile(uuid), "getThreadsByFile")
	const T1 = await promise(TH.addThread(T0), "addThread")
	equal("snippet" in T1, false, "undefined snippet is still returned")
	equal("file" in T1, false, "file is still returned")
	const T2 = {commentThreadID:T1.ID, visibilityState:threadState.private}
	await promise(TH.updateThread(T2), "updateThread")
	await promise(TH.deleteThread(T1.ID), "deleteThread")
	await promise(FH.deleteFile(fileID), "deleteNullFile")
}

async function commentHelper(){
	log("\n\nCOMMENTHELPER\n\n")
	await promise(C.getAllComments(), "getAllComments")
	await promise(C.getCommentByID(uuid), "getCommentByID")
	await promise(C.getCommentsByThread(uuid), "getCommentsBySubmission")
	const C1 = await promise(C.addComment({commentThreadID:uuid, userID:uuid, body:"this is a comment i just made!"}), 'addComment')
	await promise(C.updateComment({commentID:C1.ID, body: "this is an edited comment"}), "updateComment")
	await promise(C.deleteComment(C1.ID), "deleteComment")
	await promise(C.filterComment({body:'comment'}), "textSearch")
}

async function mentionHelper(){
	await promise(M.getAllMentions(), "getAllMentions")
	await promise(M.getMentionByID(uuid), "getMentionByID")
	await promise(M.getMentionsByComment(uuid), "getMentionsByComment")
	await promise(M.getMentionsByUser(uuid), "getMentionsByUser")
	const m1 : Mention = {userID:uuid,commentID:uuid} 
	m1.mentionID = (await promise(M.addMention(m1), "addMention")).mentionID
	await promise(M.updateMention(m1), "updateMention")
	await promise(M.updateMention({mentionID:m1.mentionID}), "updateMention2")
	await promise(M.deleteMention(m1.mentionID), "deleteMention")
}

async function courseInviteHelper(){
	const invite = {creatorID: uuid, courseID: uuid, type:'', joinRole: courseRole.TA}
	await promise(CI.filterInvite({}), "filterInvite")
	const resinv = await promise(CI.addInvite(invite), "addInvite")
	await(promise(CI.deleteInvite(resinv.inviteID!), "deleteInvite"))
}

async function pluginHelper(){
	const plugins = await promise(P.filterPlugins({}),"filterPlugin")
	const ID = plugins[0].pluginID
	await promise(P.filterHooks({}), "filterHooks")
	await promise(P.filterHooks({pluginID:ID}), "filterHooks2")
	const plugin = await promise(P.filterPlugins({pluginID:ID}),"filterPlugin").then(one)
	const pluginExt = await promise(P.addHooks(plugin), "add hooks")

	//disable warnings, this is what we want to do, as we are adding the same entry back in later
	const warn = console.warn
	console.warn = ()=>{}
	await promise(P.deletePlugin(plugin.pluginID), "deletePlugin")
	console.warn = warn;

	await promise(P.addPlugin(plugin), "addPlugin")
	for (const el of pluginExt.hooks) await promise(P.addHook({pluginID:ID, hook:el}), "addPlugin")
	for (const el of pluginExt.hooks) await promise(P.deleteHook({pluginID:ID, hook:el}), "deletePlugin")
	for (const el of pluginExt.hooks) await promise(P.addHook({pluginID:ID, hook:el}), "addPlugin")
}

async function run(...funs : Function[]){
	for (let i=0;i<funs.length; i++){
		stored =''
		try {
			await funs[i]()
			console.log('\t'+ok+' '+funs[i].name)
		} catch(error){
			const err = util.inspect(error).split('\n').map(s=>'\n\t\t'+s)
			console.log('\t'+fail+' '+funs[i].name+err)
			console.log(stored)
			errors++;
		}
	}
	const s = errors === 0 ? 'all OK' : ('there were '+errors+' errors')
	console.log('\n-----------------',errors===0? 'all OK\n' : 'there were '+errors+' error(s)\n')
	equal(errors===0, true, s)
}
export async function main(){
	return await run(
		rolesHelper,
		commentHelper, 
		snippetHelper, 
		fileHelper, 
		ThreadHelper,
		submissionHelper,
		courseRegistrationHelper,
		coursesHelper,
		usersHelper,
		mentionHelper,
		courseInviteHelper,
		pluginHelper,
		)
}
if (require.main === module){
	(async ()=>{
		// await makeDB(()=>{console.log("fin")}, console.error)
		await main()
		end();
	})()
}