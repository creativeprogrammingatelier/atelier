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
const uuid = "'00000000-0000-0000-0000-000000000000'"
 export const permissionBits = 40
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
          sv.body, sv.lineStart, sv.charStart, sv.lineEnd, sv.charEnd,
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

export async function makeDB(out: (value: {}) => void, err : (error : Error) => void){
return pool.query(`
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

ALTER ROLE assistantassistant WITH SUPERUSER INHERIT CREATEROLE CREATEDB LOGIN REPLICATION BYPASSRLS PASSWORD 'md594b9257ac7635f4597e055106a53fddd';
DROP VIEW IF EXISTS 
     "SubmissionsRefs", "CommentThreadRefs",
     "UsersView", "CoursesView",
     "SubmissionsView", "FilesView",
     "SnippetsView", "CommentsView",
     "CommentThreadView", "CourseRegistrationView",
     "MentionsView";

DROP TABLE IF EXISTS 
     "GlobalRolePermissions",
     "CourseRolePermissions", "Users", 
     "Courses", "CourseRegistration", 
     "Submissions", "Files", "Snippets", 
     "CommentThread", "Comments", "Mentions";

CREATE TABLE "CourseRolePermissions" (
    courseRoleID      text PRIMARY KEY,
    permission        bit(${permissionBits}) NOT NULL
);
INSERT INTO "CourseRolePermissions" VALUES
	('student', 1::bit(${permissionBits})),
	('TA', 3::bit(${permissionBits})),
     ('teacher', 7::bit(${permissionBits})),
     ('unauthorized', 0::bit(${permissionBits})),
     ('plugin', 0::bit(${permissionBits}));

CREATE TABLE "GlobalRolePermissions" (
     globalRoleID        text PRIMARY KEY,
     permission          bit(${permissionBits}) NOT NULL
);
INSERT INTO "GlobalRolePermissions" VALUES
     ('admin', '${'1'.repeat(permissionBits)}'),
     ('user', 1::bit(${permissionBits})),
     ('unauthorized', 0::bit(${permissionBits})),
     ('plugin', 0::bit(${permissionBits}));

CREATE TABLE "Users" (
     userID         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
     samlID         text UNIQUE, --can be null
     userName       text NOT NULL CHECK (userName <> ''),
     email          text NOT NULL UNIQUE CHECK (email <> ''),
     globalRole     text NOT NULL REFERENCES "GlobalRolePermissions"(globalRoleID) DEFAULT 'unauthorized',
     permission     bit(${permissionBits}) NOT NULL,
     hash           char(60) NOT NULL
);
INSERT INTO "Users" VALUES
     (DEFAULT, NULL, 'normal', 'Cas@Caaas', 'admin', 0::bit(${permissionBits}), '$2b$10$/AP8x6x1K3r.bWVZR8B.l.LmySZwKqoUv8WYqcZTzo/w6.CHt7TOu'),
     (${uuid}, 'samling_admin','Cs', 'admin@Cas', 'admin', 0::bit(${permissionBits}), ''),
     (DEFAULT, 'samling_user','Cas', 'user@Cas', 'user', 0::bit(${permissionBits}), ''),
     (DEFAULT, 'samling_teacher','Caas', 'teacher@Cas', 'user', 0::bit(${permissionBits}), ''),
     (DEFAULT, 'samling_TA','Caaas', 'TA@Cas', 'user', 0::bit(${permissionBits}), ''),
     (DEFAULT, NULL, 'pmd plugin', 'pmd@plugin', 'plugin', 0::bit(${permissionBits}), ''),
     (DEFAULT, NULL, 'test user', 'test@test', 'user', 0::bit(${permissionBits}), '');

CREATE TABLE "Courses" (
     courseID    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
     courseName  text NOT NULL CHECK (courseName <> ''),
     state       text NOT NULL DEFAULT 'open',
     creator     uuid REFERENCES "Users" (userID)
);
INSERT INTO "Courses" VALUES
	(${uuid}, 'Pearls of Computer Science', DEFAULT, (SELECT userID from "Users" LIMIT 1));


CREATE TABLE "CourseRegistration" (
     courseID       uuid NOT NULL REFERENCES "Courses"(courseID) ON DELETE CASCADE,
     userID         uuid NOT NULL REFERENCES "Users"(userID),
     courseRole     text NOT NULL REFERENCES "CourseRolePermissions"(courseRoleID) DEFAULT 'unauthorized',
     permission     bit(${permissionBits}) NOT NULL,
     PRIMARY KEY (courseID, userID)
);
INSERT INTO "CourseRegistration" VALUES
	((SELECT courseID from "Courses" LIMIT 1), (SELECT userID from "Users" LIMIT 1), 'student', 3::bit(40)),
     (${uuid}, (SELECT userID from "Users" WHERE samlID='samling_user'), 'student', 0::bit(${permissionBits})),
     (${uuid}, (SELECT userID from "Users" WHERE samlID='samling_teacher'), 'teacher', 0::bit(${permissionBits})),
     (${uuid}, (SELECT userID from "Users" WHERE samlID='samling_TA'), 'TA', 0::bit(${permissionBits})),
     (${uuid}, (SELECT userID from "Users" WHERE globalRole='plugin'), 'plugin', 0::bit(${permissionBits}));

CREATE TABLE "Submissions" (
     submissionID   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
     courseID       uuid NOT NULL REFERENCES "Courses"(courseID) ON DELETE CASCADE,
     userID         uuid NOT NULL REFERENCES "Users"(userID),
     title           text NOT NULL CHECK (title <> ''),
     date           timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
     state          text NOT NULL DEFAULT 'new'
);
INSERT INTO "Submissions" VALUES
	(${uuid}, ${uuid}, ${uuid}, 'MyFirstSubmission', DEFAULT, DEFAULT);

CREATE TABLE "Files" (
     fileID         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
     submissionID   uuid NOT NULL REFERENCES "Submissions"(submissionID) ON DELETE CASCADE,
     pathname       text NOT NULL,
     type           text NOT NULL DEFAULT 'unsupported'
);
INSERT INTO "Files" VALUES
     (${uuid}, (SELECT submissionID from "Submissions" LIMIT 1), 'uploads/00000000-0000-0000-0000-000000000000/MyFirstSubmission/MyFirstSubmission', 'processing'),
     ('ffffffff-ffff-ffff-ffff-ffffffffffff', (SELECT submissionID from "Submissions" LIMIT 1), '', 'undefined/undefined');

CREATE TABLE "Snippets" (
     snippetID         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
     lineStart         integer NOT NULL,
     lineEnd           integer NOT NULL,
     charStart         integer NOT NULL,
     charEnd           integer NOT NULL,
     body              text NOT NULL
);
INSERT INTO "Snippets" VALUES
     (    ${uuid}, 
          0, 1, 0, 0, 
          'this is a snippet of a file'
     ),
     ( -- a null snippet
          'ffffffff-ffff-ffff-ffff-ffffffffffff',
          -1, -1, -1, -1,
          ''
     );

CREATE TABLE "CommentThread" (
     commentThreadID   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
     submissionID      uuid NOT NULL REFERENCES "Submissions"(submissionID) ON DELETE CASCADE,
     fileID            uuid NOT NULL REFERENCES "Files"(fileID),
     snippetID         uuid NOT NULL UNIQUE REFERENCES "Snippets"(snippetID),
     visibilityState   text NOT NULL DEFAULT 'public'
);

INSERT INTO "CommentThread" VALUES
	(${uuid}, (SELECT submissionID from "Submissions" LIMIT 1), (SELECT fileID from "Files" LIMIT 1), ${uuid}, DEFAULT),
	(DEFAULT, (SELECT submissionID from "Submissions" LIMIT 1), (SELECT fileID from "Files" LIMIT 1), 'ffffffff-ffff-ffff-ffff-ffffffffffff', DEFAULT);

CREATE TABLE "Comments" (
     commentID         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
     commentThreadID   uuid NOT NULL REFERENCES "CommentThread"(commentThreadID) ON DELETE CASCADE,
     userID            uuid NOT NULL REFERENCES "Users"(userID),
     date              timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
     body              text NOT NULL
);
INSERT INTO "Comments" VALUES
	(${uuid}, (SELECT commentThreadID from "CommentThread" LIMIT 1), (SELECT userID from "Users" LIMIT 1), DEFAULT, 'This is comment 0. It has a mention to @Caaas, a TA.'),
	(DEFAULT, (SELECT commentThreadID from "CommentThread" LIMIT 1), (SELECT userID from "Users" LIMIT 1), DEFAULT, 'This is a multi\\nline comment!'),
	(DEFAULT, (SELECT commentThreadID from "CommentThread" LIMIT 1), (SELECT userID from "Users" LIMIT 1), DEFAULT, 'This is a comment about nothing at all..');

CREATE TABLE "Mentions" (
     mentionID      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
     commentID      uuid REFERENCES "Comments"(commentID) ON DELETE CASCADE,
     userID         uuid REFERENCES "Users"(userID) ON DELETE CASCADE
);
INSERT INTO "Mentions" VALUES
     (${uuid}, ${uuid}, (SELECT userID FROM "Users" WHERE samlid='samling_TA'));

CREATE OR REPLACE FUNCTION delSnippet() 
     returns trigger AS
     $$ 
     begin
          DELETE FROM "Snippets" 
          WHERE snippetID = old.snippetID;

          return null;
     end;
     $$
     LANGUAGE plpgsql;

CREATE TRIGGER DEL_SNIPPET
     AFTER DELETE ON "CommentThread"
     FOR EACH ROW
     EXECUTE FUNCTION delSnippet();

CREATE OR REPLACE FUNCTION defaultFile()
     returns TRIGGER AS
     $$
     BEGIN
          INSERT INTO "Files" VALUES (
               DEFAULT, 
               (SELECT new.submissionID),
               '',
               'undefined/undefined'
          );
          return null;
     END;
     $$
     LANGUAGE plpgsql;

CREATE TRIGGER DEFAULT_FILE
     AFTER INSERT ON "Submissions"
     FOR EACH ROW
     EXECUTE FUNCTION defaultFile();

CREATE VIEW "SubmissionsRefs" AS (
     SELECT courseID, submissionID
     FROM "Submissions"
);

CREATE VIEW "CommentThreadRefs" AS (
     SELECT sr.*, ct.commentThreadID, ct.snippetID, ct.fileID
     FROM "CommentThread" as ct, "SubmissionsRefs" as sr
     WHERE sr.submissionID = ct.submissionID
);

CREATE VIEW "UsersView" AS (
     ${usersView(`"Users"`)}
);
CREATE VIEW "CourseRegistrationView" AS (
     ${CourseRegistrationView()}
);

CREATE VIEW "CoursesView" AS (
     ${CoursesView()}
);

CREATE VIEW "SubmissionsView" AS (
     ${submissionsView()}
);

CREATE VIEW "FilesView" as (
     ${filesView()}
);

CREATE VIEW "SnippetsView" as (
     ${snippetsView()}
);

CREATE VIEW "CommentsView" AS (
     ${commentsView()}
);

CREATE VIEW "CommentThreadView" as (
     ${commentThreadView()}
);
CREATE VIEW "MentionsView" as (
     ${MentionsView()}
)

`).then(out).catch(e=>{err(e);throw e});
}
// pool.query("SELECT * from Users").then(res => console.log(res, res.rows, res.rows[0])).then(pool.end())
if (require.main === module){
     makeDB(console.log, console.error).then(end)
} else {
     // makeDB(()=>{console.log("made the database")}, console.error)
}