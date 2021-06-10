import {SearchResultSnippet} from '../../../models/api/SearchResult';
import {fileToAPI} from '../../../models/database/File';
import {Snippet, snippetToAPI, convertSnippet, filterNullSnippet} from '../../../models/database/Snippet';
import {submissionToAPI} from '../../../models/database/Submission';
import {Sorting} from '../../../models/enums/SortingEnum';

import {UUIDHelper} from './helpers/UUIDHelper';

import {pool, extract, map, one, pgDB, checkAvailable, DBTools, searchify, doIf} from './HelperDB';
import {snippetsView} from './ViewsDB';

/**
 *
 * @Author Rens Leendertz
 */
export class SnippetDB {
  static async getAllSnippets(params: DBTools = {}) {
    return SnippetDB.filterSnippet(params);
  }
  static async getSnippetsByFile(fileID: string, params: DBTools = {}) {
    return SnippetDB.filterSnippet({...params, fileID});
  }
  static async getSnippetByID(snippetID: string, params: DBTools = {}) {
    return SnippetDB.filterSnippet({...params, snippetID}).then(one);
  }

  static async filterSnippet(snippet: Snippet) {
    const {
      snippetID = undefined,
      commentThreadID = undefined,
      submissionID = undefined,
      courseID = undefined,
      fileID = undefined,
      lineStart = undefined,
      lineEnd = undefined,
      charStart = undefined,
      charEnd = undefined,
      body = undefined,
      contextBefore = undefined,
      contextAfter = undefined,

      limit = undefined,
      offset = undefined,
      client = pool,
      includeNulls = false, // exclude them normally
    } = snippet;
    const snippetid = UUIDHelper.toUUID(snippetID);
    const fileid = UUIDHelper.toUUID(fileID);
    const commentthreadid = UUIDHelper.toUUID(commentThreadID);
    const submissionid = UUIDHelper.toUUID(submissionID);
    const courseid = UUIDHelper.toUUID(courseID);
    const searchBody = searchify(body);
    const searchBefore = searchify(contextBefore);
    const searchAfter = searchify(contextAfter);

    return client.query(
        `SELECT * FROM "SnippetsView"
			WHERE
				($1::uuid IS NULL OR snippetID=$1)
			AND ($2::uuid IS NULL OR fileID=$2)
			AND ($3::uuid IS NULL OR commentThreadID=$3)
			AND ($4::uuid IS NULL OR submissionID=$4)
			AND ($5::uuid IS NULL OR courseID=$5)
			AND ($6::integer IS NULL OR lineStart=$6)
			AND ($7::integer IS NULL OR lineEnd=$7)
			AND ($8::integer IS NULL OR charStart=$8)
			AND ($9::integer IS NULL OR charEnd=$9)
			AND ($10::text IS NULL OR body ILIKE $10)
			AND ($11::text IS NULL OR contextBefore ILIKE $11)
			AND ($12::text IS NULL OR contextAfter ILIKE $12)
			ORDER BY snippetID
			LIMIT $13
			OFFSET $14
			`, [snippetid, fileid, commentthreadid, submissionid, courseid,
          lineStart, lineEnd, charStart, charEnd, searchBody, searchBefore, searchAfter,
          limit, offset])
        .then(extract).then(map(snippetToAPI)).then(doIf(!includeNulls, filterNullSnippet));
  }
  static async searchSnippets(searchString: string, extras: Snippet): Promise<SearchResultSnippet[]> {
    checkAvailable(['currentUserID', 'courseID'], extras);
    const {
      snippetID = undefined,
      commentThreadID = undefined,
      submissionID = undefined,
      courseID = undefined,
      fileID = undefined,

      lineStart = undefined,
      lineEnd = undefined,
      charStart = undefined,
      charEnd = undefined,
      body = searchString,
      contextBefore = undefined,
      contextAfter = undefined,

      limit = undefined,
      offset = undefined,
      sorting = Sorting.datetime,
      currentUserID = undefined,
      client = pool,
      includeNulls = false, // exclude them normally
    } = extras;
    const snippetid = UUIDHelper.toUUID(snippetID);
    const fileid = UUIDHelper.toUUID(fileID);
    const commentthreadid = UUIDHelper.toUUID(commentThreadID);
    const submissionid = UUIDHelper.toUUID(submissionID);
    const courseid = UUIDHelper.toUUID(courseID);
    const currentuserid = UUIDHelper.toUUID(currentUserID);
    const searchBody = searchify(body);
    const searchBefore = searchify(contextBefore);
    const searchAfter = searchify(contextAfter);
    return client.query(`
		SELECT * 
		FROM "SnippetsView" as s, "FilesView" as f, "SubmissionsView" as sv, viewableSubmissions($13, $5) as opts
		WHERE
			s.fileid = f.fileid
		AND s.submissionID = sv.submissionID
		AND ($1::uuid IS NULL OR s.snippetID=$1)
		AND ($2::uuid IS NULL OR s.fileID=$2)
		AND ($3::uuid IS NULL OR s.commentThreadID=$3)
		AND ($4::uuid IS NULL OR s.submissionID=$4)
		AND ($5::uuid IS NULL OR s.courseID=$5)
		AND ($6::integer IS NULL OR s.lineStart=$6)
		AND ($7::integer IS NULL OR s.lineEnd=$7)
		AND ($8::integer IS NULL OR s.charStart=$8)
		AND ($9::integer IS NULL OR s.charEnd=$9)
		AND ($10::text IS NULL OR s.body ILIKE $10)
		AND ($11::text IS NULL OR s.contextBefore ILIKE $11)
		AND ($12::text IS NULL OR s.contextAfter ILIKE $12)

		AND s.submissionID = opts.submissionID
		ORDER BY ${sorting === Sorting.datetime ? `sv.date DESC` : 's.body'}, s.snippetID
		LIMIT $14
		OFFSET $15
		`, [snippetid, fileid, commentthreadid, submissionid, courseid,
      lineStart, lineEnd, charStart, charEnd, searchBody, searchBefore, searchAfter,
      currentuserid, limit, offset])
        .then(extract).then(map((entry) => ({
          // no checks for null snippets/files, since we are literally searching inside a snippet body
          snippet: snippetToAPI(entry),
          file: fileToAPI(entry),
          submission: submissionToAPI(entry),
        })));
  }

  static async createNullSnippet(params: DBTools = {}) {
    const nullSnippet = {
      ...params,
      body: '',
      contextAfter: '',
      contextBefore: '',
      lineStart: -1,
      lineEnd: -1,
      charEnd: -1,
      charStart: -1,
    };
    return SnippetDB.addSnippet(nullSnippet);
  }

  static async addSnippet(snippet: Snippet): Promise<string> {
    checkAvailable(['lineStart', 'lineEnd', 'charStart', 'charEnd', 'body', 'contextBefore', 'contextAfter'], snippet);
    const {
      lineStart,
      lineEnd,
      charStart,
      charEnd,
      body,
      contextBefore,
      contextAfter,
      client = pool,
    } = snippet;
    // if (lineStart === -1){
    // 	throw new Error()
    // }
    return client.query(`
			INSERT INTO "Snippets"
			VALUES (DEFAULT, $1, $2, $3, $4, $5, $6, $7) 
			RETURNING snippetID
			`, [lineStart, lineEnd, charStart, charEnd, body, contextBefore, contextAfter])
        .then(extract).then(one).then((res) => UUIDHelper.fromUUID(res.snippetid as string));
  }
  static async updateSnippet(snippet: Snippet) {
    checkAvailable(['snippetID'], snippet);
    const {
      snippetID,
      lineStart = undefined,
      lineEnd = undefined,
      charStart = undefined,
      charEnd = undefined,
      body = undefined,
      contextBefore = undefined,
      contextAfter = undefined,
      client = pool,
    } = snippet;
    const snippetid = UUIDHelper.toUUID(snippetID);
    return client.query(`
			WITH update AS (
				UPDATE "Snippets" SET 
				lineStart = COALESCE($2, lineStart),
				lineEnd = COALESCE($3, lineEnd),
				charStart = COALESCE($4, charStart),
				charEnd = COALESCE($5, charEnd),
				body = COALESCE($6, body),
				contextBefore = COALESCE($7, contextBefore),
				contextAfter = COALESCE($8, contextAfter)
				WHERE snippetID=$1
				RETURNING *
			)
			${snippetsView('update')}
			`, [snippetid, lineStart, lineEnd, charStart, charEnd, body, contextBefore, contextAfter])
        .then(extract).then(map(snippetToAPI)).then(one);
  }
  static async deleteSnippet(snippetID: string, client: pgDB = pool) {
    const snippetid = UUIDHelper.toUUID(snippetID);
    return client.query(`
		
		DELETE FROM "Snippets" 
		WHERE snippetID = $1 
		RETURNING *
	
		`, [snippetid])
        .then(extract).then(map(convertSnippet)).then(one);
  }
}
