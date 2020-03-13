import {end, pool, permissionBits, getClient, pgDB} from "../HelperDB";
import {usersView, CourseRegistrationView, CoursesView, submissionsView, filesView, snippetsView, commentsView, commentThreadView, MentionsView} from "../ViewsDB";
import { isPostgresError, PostgresError } from '../../helpers/DatabaseErrorHelper'
import { databaseSamples } from "./DatabaseSamples";

if (require.main === module){
	//args without node & path name
	const args = process.argv.splice(2);
	//check if the 'insert' option is specified
	const insertToo = args.find((el) => el==='-i');
	//create the database
	(async () =>{
		const client = await getClient();
		try {
		await client.query("BEGIN")
		await makeDB(client)
		//if inserting too, then do insert as well
		if (insertToo){
			await databaseSamples(client)
		}
		await client.query("COMMIT")
		}catch (e) {
			await client.query("ROLLBACK")
			throw e
		} finally {
			
			await client.release()
			end()
		}

			
	})()
} else {
	// makeDB(()=>{console.log("made the database")}, console.error)
}
const uuid = "'00000000-0000-0000-0000-000000000000'"
async function makeDB(client : pgDB = pool){
     const query = makeDBString()
	 return client.query(query
	 ).then(()=>
		 console.log('database creation successful')
	).catch((e : Error) =>{
		if (isPostgresError(e) && e.position!==undefined){
			console.log(query.substring(Number(e.position)-20, Number(e.position)+20))
		}
		throw e
	});
}

function makeDBString(){
	return `
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

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
	"CommentThread", "Comments", 
	"Mentions", "CourseInvites";

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


CREATE TABLE "CourseInvites" (
	inviteID 		uuid PRIMARY KEY DEFAULT gen_random_uuid(), 
	userID 			uuid NOT NULL REFERENCES "Users"(userID) ON DELETE CASCADE, 
	courseID 		uuid NOT NULL REFERENCES "Courses"(courseID) ON DELETE CASCADE, 
	type 			text NOT NULL, 
	joinRole		text NOT NULL REFERENCES "CourseRolePermissions"(courseRoleID)
);

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
)`;
}