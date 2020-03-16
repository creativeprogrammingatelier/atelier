import {pool, end} from './HelperDB'


//This script can only be run locally, 
// to use this with a remote server, change the host. user and password will be required in all other instances of pool.
// user: 'assistantassistant',
// password: '0disabled-Dusky-lags-Nursery4-Nods-2Floss-Coat-Butte-4Ethel-Hypnosis-bel',

// pool.query(`
// 	CREATE OR REPLACE FUNCTION doit()
// 	RETURNS TABLE (commentThreadID uuid, body text[]) AS $fun$
// 	DECLARE
// 		res "CommentThread";
// 		ids uuid;
// 		com text[];
// 	BEGIN
// 		SELECT * into res FROM "CommentThread";
// 		SELECT commentThreadID into ids from res;
// 		SELECT array_agg(body) into com
// 			from "Comments"
// 			where commentThreadID in ids
// 			group by commentThreadID
// 			order by date
// 		RETURN res.*, com;
// 	END
// 	$fun$ LANGUAGE plpgsql;
// `).then((res) =>console.log(res.rows)).catch(console.error)

/*
SELECT c.userID, array_agg(c) 
     from "Comments" as c INNER JOIN "Users" as u ON  c.userid=u.userid
     group by c.userID



DROP USER IF EXISTS assistantassistant;
CREATE ROLE assistantassistant;
 */

 /**
  * most exported functions in this file, contain the query string for some view of the database
  * By calling these functions, the respective query can be inserted into some string at the callee's end.
  * parameters given to these functions replace tables `FROM` which data is pulled.
  * this can be used to allow the data from an insert or update to be utilized in the respective view
  * All these queries have a `WHERE` clause specified, so to add more checks can be done by appending `AND <condition>`
  * but is generally not best practice, as it requires to know what names are used in the query.
  * 
  */
export function usersView(userTable = `"Users"`){
     return `
     SELECT userID, 
          userName, 
          email,
          globalRole, 
          permission | (SELECT permission 
                         FROM "GlobalRolePermissions" 
                         WHERE globalRoleID=globalRole
                         ) AS permission
     FROM ${userTable}
     WHERE 1=1`
}

export function CourseRegistrationView(courseRegistrationTable = `"CourseRegistration"`){
     return `SELECT
          cr.userID, 
          cr.courseID, 
          cr.courseRole, 
          cr.permission | (
                              SELECT permission 
                              FROM "CourseRolePermissions" 
                              WHERE courseRoleID=courseRole
                         ) | (SELECT permission
                              FROM "UsersView" as uv
                              WHERE uv.userID = cr.userID
                         ) AS permission
     FROM ${courseRegistrationTable} as cr
     WHERE 1=1
     `
}

export function CoursesView(coursesTable=`"Courses"`, usersView=`"UsersView"`){
     return `SELECT c.*, u.userName, u.globalrole, u.email, u.userID, u.permission
     FROM ${coursesTable} as c, ${usersView} as u
     WHERE c.creator = u.userID
     `
}

export function submissionsView(submissionsTable=`"Submissions"`, usersView=`"UsersView"`){
     return `SELECT s.*, u.userName, u.globalrole, u.email, u.permission
     FROM ${submissionsTable} as s, ${usersView} as u
     WHERE s.userID = u.userID`
}

export function filesView(filesTable=`"Files"`){
     return `SELECT f.*, sr.courseID
     FROM ${filesTable} as f, "SubmissionsRefs" as sr
     WHERE f.submissionID = sr.submissionID`
}

export function snippetsView(snippetsTable=`"Snippets"`, filesView=`"FilesView"`){
     return `SELECT s.*, fv.*, ctr.commentThreadID
     FROM ${snippetsTable} as s, "CommentThreadRefs" as ctr, ${filesView} as fv
     WHERE ctr.snippetID = s.snippetID
       AND fv.fileID = ctr.fileID`
}

export function commentsView(commentsTable=`"Comments"`, usersView=`"UsersView"`){
     return `SELECT c.*, u.userName, u.globalrole, u.email, u.permission, ctr.submissionID, ctr.courseID
     FROM ${commentsTable} as c, ${usersView} as u, "CommentThreadRefs" as ctr
     WHERE c.userID = u.userID
       AND ctr.commentThreadID = c.commentThreadID`
}

export function commentThreadView(commentThreadTable=`"CommentThread"`){
     return `SELECT 
          sr.courseID, sr.submissionID, ct.commentThreadID, ct.snippetID, ct.fileID,
          ct.visibilityState,
          sv.body, sv.contextBefore, sv.contextAfter, sv.lineStart, sv.charStart, sv.lineEnd, sv.charEnd,
          fv.pathname, fv.type
     FROM ${commentThreadTable} as ct, "SubmissionsRefs" as sr, "Snippets" as sv, "Files" as fv
     WHERE ct.submissionID = sr.submissionID
       AND ct.snippetID = sv.snippetID
       AND fv.fileID = ct.fileID`
}

export function MentionsView(mentionsTable=`"Mentions"`){
     return `
          SELECT m.mentionID, uv.*, cv.commentID, cv.commentThreadID, cv.submissionID, cv.courseID
          FROM ${mentionsTable} as m, "CommentsView" as cv, "UsersView" as uv
          WHERE m.commentID = cv.commentID
            AND m.userID = uv.userID
     `
}
