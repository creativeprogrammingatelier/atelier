import { getAllSearch, randomString, getUserSearch, getCourseSearch, getSubmissionSearch, getThreadSearch, getFileSearch, getSnippetSearch, adminRegisterCourse, adminUnregisterCourse, SearchParameters } from "../APIRequestHelper"
import { expect, assert } from "chai";
import { SearchResult, SearchResultFile, SearchResultComment, SearchResultSnippet } from "../../../models/api/SearchResult";
import { Course } from "../../../models/api/Course";
import { Submission } from "../../../models/api/Submission";
import { User } from "../../../models/api/User";
import { deepStrictEqual, equal } from "assert";
import { instanceOfUser, instanceOfCoursePartial, instanceofCourse, instanceOfSearch, instanceOfSubmission, instanceOfSearchComment, instanceOfSearchFile, instanceOfSearchSnippet } from "../../InstanceOf";

export function searchTest(){
	/**
	 * GET requests: @TODO
	 * /api/search?q={string}[&limit={number}][&offset={number}][&courseID={id}]
	 * - response should be {large object}
	 * - when Q is not given: bad request
	 * - when limit is given: all entries limited to that amount.
	 * - when offset is given, receive a later part of the list.
	 * - when course is given, allow items from within a course (submission, snippet, file, comment)
	 * - when course is not given, allow course
	 * - when having adequate permissions, receive a list of all users.
	 * /api/search/courses? ...
	 * 
	 * /api/search/users? ...
	 * 
	 * /api/search/comments? ...
	 * 
	 * /api/search/snippets? ...
	 * 
	 * /api/search/submissions? ...
	 * 
	 * /api/search/files? ...
	 * 
	 * 
	 */
    describe("Search", ()=>{
		beforeEach(async ()=>adminRegisterCourse())
		it("should be possible to search", async ()=>{
			await equalResults({query:'s'})
		})
		it("should not give back every kind of item", async ()=>{
			const params = {query:'s',limit:2}
			let result = await fetchAll(params)
			equal(result.submissions.length, 0, "no submissions should be there when outside a course")
			equal(result.snippets.length, 0, "no snippets should be there when outside a course")
			equal(result.files.length, 0, "no files should be there when outside a course")
			equal(result.comments.length, 0, "no comments should be there when outside a course")
			
			result = await fetchAll({query:'s',limit:2, courseID:true})
			equal(result.courses.length, 0, "no courses should be there when inside a course")
		})
		it("should throw on no query", async ()=>{
			const params : SearchParameters= {}
			await badAll(params)
			await badCourses(params)
			await badUsers(params)

			params.courseID=true
			await badAll(params)
			// await badUsers(params)
			// await badComments(params)
			// await badFiles(params)
			// await badSnippets(params)
			// await badSubmissions(params)
		})
		it("should throw on empty request", async ()=>{
			const params : SearchParameters= {query:'', }
			await badAll(params)
			await badCourses(params)
			await badUsers(params)

			params.courseID=true
			await badAll(params)
			await badUsers(params)
			await badComments(params)
			await badFiles(params)
			await badSnippets(params)
			await badSubmissions(params)
		})
		it("should throw when courseID is wrongly given", async ()=>{
			const params : SearchParameters = {query:'s', courseID:false}
			await badComments(params)
			await badFiles(params)
			await badSnippets(params)
			await badSubmissions(params)
			params.courseID=true
			await badCourses(params)
		})
		

		it("should be possible to add limit", async ()=>{
			await equalResults({query:'s', limit:2})
		})
		it("should be possible to add an offset", async ()=>{
			await equalResults({query:'s', limit:2, offset:1})
		})
		it("should receive a maximum of limit items", async ()=>{
			const params = {query:'s',limit:1}
			let result = await fetchAll(params)
			expect(result.users.length).to.be.below(2)
			expect(result.submissions.length).to.be.below(2)
			expect(result.snippets.length).to.be.below(2)
			expect(result.files).length.to.be.below(2)
			expect(result.courses.length).to.be.below(2)
			expect(result.comments.length).to.be.below(2)

			result = await fetchAll({query:'s',limit:1, courseID:true})
			expect(result.users.length).to.be.below(2)
			expect(result.submissions.length).to.be.below(2)
			expect(result.snippets.length).to.be.below(2)
			expect(result.files).length.to.be.below(2)
			expect(result.courses.length).to.be.below(2)
			expect(result.comments.length).to.be.below(2)
		})
		it("should be possible to search within a user", async ()=>{
			await fetchAll({query:'s', userID:true})
		})
		it("should be possible to search within a submission", async ()=>{
			await fetchAll({query:'s', submissionID:true})
		})
			
	})
}
async function equalResults(params: SearchParameters){
	it("should contain the same result for all and specific paths, input="+params, async ()=>{
		await equalResultsGlobal(params)
		await equalResultsCourse(params)
	})
}

async function equalResultsCourse(params : SearchParameters){
	params = {...params, courseID:true}
	const all = await fetchAll(params)
	const users = await fetchUser(params);
	const submissions = await fetchSubmissions(params);
	const comments = await fetchComments(params);
	const files = await fetchFiles(params);
	const snippets = await fetchSnippet(params);
	deepStrictEqual(all.users, users, "the users object should be the same");
	deepStrictEqual(all.submissions, submissions, "the submissions object should be the same");
	deepStrictEqual(all.comments, comments, "the comments object should be the same");
	deepStrictEqual(all.files, files, "the files object should be the same");
	deepStrictEqual(all.snippets, snippets, "the snippets object should be the same");
}
async function equalResultsGlobal(params : SearchParameters){
	params = {...params, courseID:false}
	const all = await fetchAll(params)
	const users = await fetchUser(params);
	const courses = await fetchCourses(params);
	deepStrictEqual(all.users, users, "the users object should be the same");
	deepStrictEqual(all.courses, courses,"the courses object should be the same");
}

async function badAll(params : SearchParameters){
	const response = await getAllSearch(params);
	expect(response).to.have.status(400);
}
async function badCourses(params : SearchParameters){
	const response = await getCourseSearch(params);
	expect(response).to.have.status(400);
}
async function badSubmissions(params : SearchParameters){
	const response = await getSubmissionSearch(params);
	expect(response).to.have.status(400);
}
async function badComments(params : SearchParameters){
	const response = await getThreadSearch(params);
	expect(response).to.have.status(400);
}
async function badFiles(params : SearchParameters){
	const response = await getFileSearch(params);
	expect(response).to.have.status(400);
}
async function badSnippets(params : SearchParameters){
	const response = await getSnippetSearch(params);
	expect(response).to.have.status(400);
}
async function badUsers(params : SearchParameters){
	const response = await getUserSearch(params);
	expect(response).to.have.status(400);
}


async function fetchAll(params : SearchParameters){
	const response = await getAllSearch(params);
	expect(response).to.have.status(200);
	assert(instanceOfSearch(response.body), "not an instance of Search")
	return response.body as SearchResult
}
async function fetchCourses(params : SearchParameters){
	const response = await getCourseSearch(params);
	expect(response).to.have.status(200);
	assert((response.body as []).every(instanceofCourse), "not an instance of Course")
	return response.body as Course[];
}
async function fetchSubmissions(params : SearchParameters){
	const response = await getSubmissionSearch(params);
	expect(response).to.have.status(200);
	assert((response.body as []).every(instanceOfSubmission), "not an instance of Submission")
	return response.body as Submission[];
}
async function fetchComments(params : SearchParameters){
	const response = await getThreadSearch(params);
	expect(response).to.have.status(200);
	assert((response.body as []).every(instanceOfSearchComment), "not an instance of Comment")
	return response.body as SearchResultComment[];
}
async function fetchFiles(params : SearchParameters){
	const response = await getFileSearch(params);
	expect(response).to.have.status(200);
	assert((response.body as []).every(instanceOfSearchFile), "not an instance of File")
	return response.body as SearchResultFile[];
}
async function fetchSnippet(params : SearchParameters){
	const response = await getSnippetSearch(params);
	expect(response).to.have.status(200);
	assert((response.body as []).every(instanceOfSearchSnippet), "not an instance of Snippet")
	return response.body as SearchResultSnippet[];
}
async function fetchUser(params : SearchParameters){
	const response = await getUserSearch(params);
	expect(response).to.have.status(200);
	assert((response.body as []).every(instanceOfUser), "not an instance of User")
	return response.body as User[]
}