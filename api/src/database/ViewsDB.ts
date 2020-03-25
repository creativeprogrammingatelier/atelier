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
export function CourseUsersView(courseRegistrationTable=`"CourseRegistration"`){
     return `
     WITH allButPermissions AS (
          SELECT 
             c.courseID, 
             u.userID, 
             u.permission,
             COALESCE( -- if no entry present, use 'unregistered'
                (
                   SELECT e.courseRole 
                   FROM ${courseRegistrationTable} as e
                   WHERE e.courseID=c.courseID 
                     AND e.userID=u.userID
                ), 
                'unregistered'
             ) AS courseRole
          FROM  
             "UsersView" as u, 
             "Courses" as c
     )
     SELECT abp.courseID, abp.userID, abp.courseRole,
        abp.permission 
        | COALESCE( -- if entry not present, use 0 for no permissions
           (
              SELECT e.permission
              FROM ${courseRegistrationTable} as e
              WHERE e.courseID=abp.courseID 
                AND e.userID=abp.userID
           ),
           0::bit(40)
        ) | ( -- the permissions of this role in a course
           SELECT permission 
           FROM "CourseRolePermissions" 
           WHERE courseRoleID=courseRole
        ) AS permission,
     u.userName, 
     u.email,
     u.globalRole

       FROM allButPermissions as abp, "UsersView" as u
       WHERE u.userID = abp.userID
     `
}

/** NOTE: this is almost the same as CourseUsers, but now there is no filler for non-existent rows, to be used specifically with some table */
export function CourseUsersSingle(courseRegistrationTable=`"CourseRegistration"`){

     return `
     SELECT 
          c.courseID, u.userID, e.courseRole,
          u.userName, u.email, u.globalRole,
          u.permission | e.permission | crp.permission AS permission,
          e.courseRole
     FROM  
          "UsersView" as u, 
          "Courses" as c,
          "CourseRolePermissions" as crp,
          ${courseRegistrationTable} as e
     WHERE e.courseID = c.courseID 
          AND e.userID = u.userID
          AND e.courseRole = crp.courseRoleID
  `
}


/*
 * 
 WITH entries as (
 select * from "CourseRegistration"
 ), defaults as (
 select c.courseID, u.userID, 'unregistered' as courseRole, 0::bit(40) as permission from "Users" as u, "Courses" as c
 )
 select d.courseID, d.userID, COALESCE((SELECT e.courseRole from entries as e where e.courseID=d.courseID AND e.userID=d.userID), d.courseRole) FROM defaults as d
 * 
 * 
 */

export function CoursesView(coursesTable=`"Courses"`, usersView=`"UsersView"`){
     return `SELECT c.*, u.userName, u.globalrole, u.email, u.userID, u.permission
     FROM ${coursesTable} as c, ${usersView} as u
     WHERE c.creator = u.userID
     `
}

export function submissionsView(submissionsTable=`"Submissions"`, usersView=`"UsersView"`){
     return `
     SELECT s.*, u.userName, u.globalrole, u.email, u.permission
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
     return `SELECT c.*, u.userName, u.globalrole, u.email, u.permission, ctr.submissionID, ctr.courseID, ctr.fileID, ctr.snippetID
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
          SELECT m.mentionID, m.userGroup, cv.commentID, cv.fileID, cv.commentThreadID, 
                 cv.snippetID, cv.submissionID, cv.courseID, cv.created, cv.edited, 
                 cv.body, cu.userID, cu.userName, cu.email, cu.globalRole, 
                 cu.courseRole, cu.permission, cmu.userID as cmuUserID, 
                 cmu.userName as cmuUserName, cmu.email as cmuEmail, 
                 cmu.globalRole as cmuGlobalRole,
                 cmu.permission as cmuPermission, subm.title as submTitle, c.courseName
          FROM ${mentionsTable} as m, "CommentsView" as cv, "CourseUsersView" as cu,
               "UsersView" as cmu, "Submissions" as subm, "Courses" as c
          WHERE m.commentID = cv.commentID
            AND m.userID = cu.userID
            AND cv.courseID = cu.courseID
            AND cv.userID = cmu.userID
            AND cv.submissionID = subm.submissionID
            AND cv.courseID = c.courseID
          UNION -- if addressing a group, user is null. account for that.
          SELECT m.mentionID, m.userGroup, cv.commentID, cv.fileID, cv.commentThreadID, 
                 cv.snippetID, cv.submissionID, cv.courseID, cv.created, cv.edited,
                 cv.body, NULL, NULL, NULL, NULL, 
                 NULL, NULL, cmu.userID as cmuUserID, 
                 cmu.userName as cmuUserName, cmu.email as cmuEmail, 
                 cmu.globalRole as cmuGlobalRole,
                 cmu.permission as cmuPermission, subm.title as submTitle, c.courseName
          FROM ${mentionsTable} as m , "CommentsView" as cv, "CourseUsersView" as cmu, "Submissions" as subm, "Courses" as c
          WHERE m.commentID = cv.commentID
            AND m.userID IS NULL
            AND cv.userID = cmu.userID
            AND cv.submissionID = subm.submissionID
            AND cv.courseID = c.courseID
     `
}