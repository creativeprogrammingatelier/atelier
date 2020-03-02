const pg = require('pg');

const pool = new pg.Pool({
	user: 'assistantassistant',
	host: '127.0.0.1',
	database: 'assistantassistant',
	password: '0disabled-Dusky-lags-Nursery4-Nods-2Floss-Coat-Butte-4Ethel-Hypnosis-bel',
	port: 5432,
	max: 1
});
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
pool.query(`
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

ALTER ROLE assistantassistant WITH SUPERUSER INHERIT CREATEROLE CREATEDB LOGIN REPLICATION BYPASSRLS PASSWORD 'md594b9257ac7635f4597e055106a53fddd';
DROP VIEW IF EXISTS 
     "SubmissionsRefs", "CommentThreadRefs",
     "UsersView", "CoursesView",
     "SubmissionsView", "FilesView",
     "SnippetsView", "CommentsView",
     "CommentThreadView";

DROP TABLE IF EXISTS 
     "CourseRolePermissions", "Users", 
     "Courses", "CourseRegistration", 
     "Submissions", "Files", "Snippets", 
     "CommentThread", "Comments";

CREATE TABLE "CourseRolePermissions" (
    courseRoleID      text PRIMARY KEY,
    permission        bit(40) NOT NULL
);
INSERT INTO "CourseRolePermissions" VALUES
	('student', 0::bit(40)),
	('TA', 1::bit(40)),
	('teacher', 3::bit(40));


CREATE TABLE "Users" (
     userID       uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
     userName     text NOT NULL CHECK (userName <> ''),
     globalRole   text NOT NULL DEFAULT 'user',
     email        text NOT NULL UNIQUE CHECK (email <> ''),
     hash         char(60) NOT NULL
);
INSERT INTO "Users" VALUES
     (DEFAULT, 'Caaas', DEFAULT, 'Cas@Caaas', '$2b$10$/AP8x6x1K3r.bWVZR8B.l.LmySZwKqoUv8WYqcZTzo/w6.CHt7TOu'),
	('00000000-0000-0000-0000-000000000000', 'Cas', DEFAULT, 'Cas@Cas', '$2b$10$/AP8x6x1K3r.bWVZR8B.l.LmySZwKqoUv8WYqcZTzo/w6.CHt7TOu');

CREATE TABLE "Courses" (
     courseID    uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
     courseName  text NOT NULL CHECK (courseName <> ''),
     state       text NOT NULL DEFAULT 'open',
     creator     uuid REFERENCES "Users" (userID)
);
INSERT INTO "Courses" VALUES
	('00000000-0000-0000-0000-000000000000', 'Pearls of Computer Science', DEFAULT, (SELECT userID from "Users" LIMIT 1));


CREATE TABLE "CourseRegistration" (
     courseID       uuid NOT NULL REFERENCES "Courses"(courseID),
     userID         uuid NOT NULL REFERENCES "Users"(userID),
     courseRole     text NOT NULL REFERENCES "CourseRolePermissions"(courseRoleID),
     permission     bit(40) NOT NULL,
     PRIMARY KEY (courseID, userID)
);
INSERT INTO "CourseRegistration" VALUES
	((SELECT courseID from "Courses" LIMIT 1), (SELECT userID from "Users" LIMIT 1), 'student', 3::bit(40));


CREATE TABLE "Submissions" (
     submissionID   uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
     courseID       uuid NOT NULL REFERENCES "Courses"(courseID),
     userID         uuid NOT NULL REFERENCES "Users"(userID),
     title           text NOT NULL CHECK (title <> ''),
     date           timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
     state          text NOT NULL DEFAULT 'new'
);
INSERT INTO "Submissions" VALUES
	('00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000000', 'MyFirstSubmission', DEFAULT, DEFAULT);

CREATE TABLE "Files" (
     fileID         uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
     submissionID   uuid NOT NULL REFERENCES "Submissions"(submissionID),
     pathname       text NOT NULL,
     type           text NOT NULL DEFAULT 'unsupported'
);
INSERT INTO "Files" VALUES
     ('00000000-0000-0000-0000-000000000000', (SELECT submissionID from "Submissions" LIMIT 1), 'uploads/00000000-0000-0000-0000-000000000000/MyFirstSubmission/MyFirstSubmission', 'processing'),
     ('ffffffff-ffff-ffff-ffff-ffffffffffff', (SELECT submissionID from "Submissions" LIMIT 1), '', '');

CREATE TABLE "Snippets" (
     snippetID         uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
     lineStart         integer NOT NULL,
     lineEnd           integer NOT NULL,
     charStart         integer NOT NULL,
     charEnd           integer NOT NULL,
     body              text NOT NULL
);
INSERT INTO "Snippets" VALUES
     (    '00000000-0000-0000-0000-000000000000', 
          0, 1, 0, 0, 
          'this is a snippet of a file'
     ),
     ( -- a null snippet
          'ffffffff-ffff-ffff-ffff-ffffffffffff',
          -1, -1, -1, -1,
          ''
     );

CREATE TABLE "CommentThread" (
     commentThreadID   uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
     submissionID      uuid NOT NULL REFERENCES "Submissions"(submissionID),
     fileID            uuid NOT NULL REFERENCES "Files"(fileID),
     snippetID         uuid NOT NULL REFERENCES "Snippets"(snippetID),
     visibilityState   text NOT NULL DEFAULT 'public'
);
INSERT INTO "CommentThread" VALUES
	('00000000-0000-0000-0000-000000000000', (SELECT submissionID from "Submissions" LIMIT 1), (SELECT fileID from "Files" LIMIT 1), (SELECT snippetID from "Snippets" LIMIT 1), DEFAULT),
	(DEFAULT, (SELECT submissionID from "Submissions" LIMIT 1), (SELECT fileID from "Files" LIMIT 1), 'ffffffff-ffff-ffff-ffff-ffffffffffff', DEFAULT),
	(DEFAULT, (SELECT submissionID from "Submissions" LIMIT 1), (SELECT fileID from "Files" LIMIT 1), 'ffffffff-ffff-ffff-ffff-ffffffffffff', DEFAULT);

CREATE TABLE "Comments" (
     commentID         uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
     commentThreadID   uuid NOT NULL REFERENCES "CommentThread"(commentThreadID) ON DELETE CASCADE,
     userID            uuid NOT NULL REFERENCES "Users"(userID),
     date              timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
     body              text NOT NULL
);
INSERT INTO "Comments" VALUES
	('00000000-0000-0000-0000-000000000000', (SELECT commentThreadID from "CommentThread" LIMIT 1), (SELECT userID from "Users" LIMIT 1), DEFAULT, 'This is comment 0.'),
	(DEFAULT, (SELECT commentThreadID from "CommentThread" LIMIT 1), (SELECT userID from "Users" LIMIT 1), DEFAULT, 'This is a multi\\nline comment!'),
	(DEFAULT, (SELECT commentThreadID from "CommentThread" LIMIT 1), (SELECT userID from "Users" LIMIT 1), DEFAULT, 'This is a comment about nothing at all..');

-- ALTER TABLE "Snippets" ADD CONSTRAINT "Snippets_commentthreadid_fkey" FOREIGN KEY (commentThreadID) REFERENCES "CommentThread"(commentThreadID);

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
     SELECT userID, userName, globalRole, email
     FROM "Users"
);

CREATE VIEW "CoursesView" AS (
     SELECT c.*, u.userName, u.globalrole, u.email
     FROM "Courses" as c, "UsersView" u
     where c.creator = u.userID
);

CREATE VIEW "SubmissionsView" AS (
     SELECT s.*, u.userName, u.globalrole, u.email
     FROM "Submissions" as s, "UsersView" as u
     WHERE s.userID = u.userID
);

CREATE VIEW "FilesView" as (
     SELECT f.*, sr.courseID
     FROM "Files" as f, "SubmissionsRefs" as sr
     WHERE f.submissionID = sr.submissionID
);

CREATE VIEW "SnippetsView" as (
     SELECT s.*, fv.*, ctr.commentThreadID
     FROM "Snippets" as s, "CommentThreadRefs" as ctr, "FilesView" as fv
     WHERE ctr.snippetID = s.snippetID
       AND fv.fileID = ctr.fileID
);

CREATE VIEW "CommentsView" AS (
     SELECT c.*, u.userName, u.globalrole, u.email, ctr.submissionID, ctr.courseID
     FROM "Comments" as c, "UsersView" as u, "CommentThreadRefs" as ctr
     WHERE c.userID = u.userID
       AND ctr.commentThreadID = c.commentThreadID
);

CREATE VIEW  "CommentThreadView" as (
     SELECT 
          sr.courseID, sr.submissionID, ct.commentThreadID, ct.snippetID, ct.fileID,
          ct.visibilityState,
          sv.body, sv.lineStart, sv.charStart, sv.lineEnd, sv.charEnd,
          fv.pathname, fv.type
     FROM "CommentThread" as ct, "SubmissionsRefs" as sr, "SnippetsView" as sv, "FilesView" as fv
     WHERE ct.submissionID = sr.submissionID
       AND ct.snippetID = sv.snippetID
       AND fv.fileID = ct.fileID
);

`).then(console.debug).catch(console.error).then(pool.end.bind(pool));
// pool.query("SELECT * from Users").then(res => console.log(res, res.rows, res.rows[0])).then(pool.end())
