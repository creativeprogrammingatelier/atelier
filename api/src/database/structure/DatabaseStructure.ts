import {PermissionEnum} from "../../../../models/enums/PermissionEnum";

import {isPostgresError} from "../../helpers/DatabaseErrorHelper";

import {end, pool, permissionBits, getClient, pgDB, toBin} from "../HelperDB";
import {usersView, CourseUsersView, CoursesView, submissionsView, filesView, snippetsView, commentsView, commentThreadView, MentionsView, CourseUsersViewAll} from "../ViewsDB";
import {databaseSamples} from "./DatabaseSamples";

const VERSION = 1;

if (require.main === module) {
	//args without node & path name
	const args = process.argv.splice(2);
	//check if the 'insert' option is specified
	const insertToo = args.find((el) => el === "-i");
	//create the database
	(async() => {
		const client = await getClient();
		try {
			await client.query("BEGIN");
			await makeDB(client);
			//if inserting too, then do insert as well
			if (insertToo) {
				await databaseSamples(client);
			}
			await client.query("COMMIT");
		} catch (e) {
			await client.query("ROLLBACK");
			throw e;
		} finally {

			await client.release();
			end();
		}
	})();
} else {
	// makeDB(()=>{console.log("made the database")}, console.error)
}

async function makeDB(client: pgDB = pool) {
	const query = makeDBString();
	//  const singles = query.split('CREATE').map(s=>'CREATE'+s).slice(1)
	//  console.log(singles)
	//  for (const item of singles){
	// 	 await client.query(item).then(()=>
	// 	 		console.log('database creation successful')
	// 		).catch((e : Error) =>{
	// 			if (isPostgresError(e) && e.position!==undefined){
	// 				console.log(item.substring(Number(e.position)-60, Number(e.position)+60))
	// 			}
	// 			throw e
	// 		});
	//  };
	//  return;
	return client.query(query
	).then(() =>
		console.log("database creation successful")
	).catch((e: Error) => {
		if (isPostgresError(e) && e.position !== undefined) {
			console.log(query.substring(Number(e.position) - 60, Number(e.position) + 60));
		}
		throw e;
	});
}
function makeDBString() {
	return `
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

DROP VIEW IF EXISTS 
	"SubmissionsRefs", "CommentThreadRefs",
	"UsersView", "CoursesView",
	"SubmissionsView", "FilesView",
	"SnippetsView", "CommentsView",
	"CommentThreadView", "CourseRegistrationView",
    "MentionsView", "CourseUsersView", "CourseUsersViewAll",
    "CourseRegistrationViewAll";

DROP TABLE IF EXISTS 
    "Metadata",
	"GlobalRolePermissions",
	"CourseRolePermissions", "Users", 
	"Courses", "CourseRegistration", 
	"Submissions", "Files", "Snippets", 
	"CommentThread", "Comments", 
	"Mentions", "CourseInvites",
    "Plugins", "PluginHooks";
    
CREATE TABLE "Metadata" (
    key         text PRIMARY KEY,
    value       text NOT NULL
);

INSERT INTO "Metadata" VALUES
    ('version', '${VERSION}');

CREATE TABLE "CourseRolePermissions" (
   courseRoleID      text PRIMARY KEY,
   permission        bit(${permissionBits}) NOT NULL
);

CREATE TABLE "GlobalRolePermissions" (
	globalRoleID        text PRIMARY KEY,
	permission          bit(${permissionBits}) NOT NULL
);

CREATE TABLE "Users" (
	userID         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	samlID         text UNIQUE, --can be null
	userName       text NOT NULL CHECK (userName <> ''),
	email          text NOT NULL UNIQUE CHECK (email <> ''),
	globalRole     text NOT NULL REFERENCES "GlobalRolePermissions"(globalRoleID) DEFAULT 'unregistered',
	permission     bit(${permissionBits}) NOT NULL,
	hash           char(60) NOT NULL
);

CREATE TABLE "Plugins" (
	pluginID 		uuid PRIMARY KEY REFERENCES "Users"(userID) ON DELETE CASCADE,
	webhookURL		text NOT NULL,
	webhookSecret	text NOT NULL,
	publicKey		text NOT NULL
);

CREATE TABLE "PluginHooks" (
	pluginID		uuid NOT NULL REFERENCES "Plugins"(pluginID) ON DELETE CASCADE,
	hook			text NOT NULL,
	UNIQUE (pluginID, hook)
);


CREATE TABLE "Courses" (
	courseID    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	courseName  text NOT NULL CHECK (courseName <> ''),
	state       text NOT NULL DEFAULT 'open',
	creator     uuid REFERENCES "Users" (userID)
);

CREATE TABLE "CourseRegistration" (
	courseID       uuid NOT NULL REFERENCES "Courses"(courseID) ON DELETE CASCADE,
	userID         uuid NOT NULL REFERENCES "Users"(userID) ON DELETE CASCADE,
	courseRole     text NOT NULL REFERENCES "CourseRolePermissions"(courseRoleID) DEFAULT 'unregistered',
	permission     bit(${permissionBits}) NOT NULL,
	PRIMARY KEY (courseID, userID)
);

CREATE TABLE "CourseInvites" (
	inviteID 		uuid PRIMARY KEY DEFAULT gen_random_uuid(), 
	creatorID		uuid NOT NULL REFERENCES "Users"(userID) ON DELETE CASCADE, 
	courseID		uuid NOT NULL REFERENCES "Courses"(courseID) ON DELETE CASCADE, 
	type			text NOT NULL, 
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

CREATE TABLE "Files" (
	fileID         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	submissionID   uuid NOT NULL REFERENCES "Submissions"(submissionID) ON DELETE CASCADE,
	pathname       text NOT NULL,
	type           text NOT NULL DEFAULT 'unsupported'
);


CREATE TABLE "Snippets" (
	snippetID         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	lineStart         integer NOT NULL,
	lineEnd           integer NOT NULL,
	charStart         integer NOT NULL,
	charEnd           integer NOT NULL,
	body              text NOT NULL,
	contextBefore	  text NOT NULL,
	contextAfter	  text NOT NULL
);


CREATE TABLE "CommentThread" (
	commentThreadID   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	submissionID      uuid NOT NULL REFERENCES "Submissions"(submissionID) ON DELETE CASCADE,
	fileID            uuid NOT NULL REFERENCES "Files"(fileID),
	snippetID         uuid NOT NULL UNIQUE REFERENCES "Snippets"(snippetID),
	visibilityState   text NOT NULL DEFAULT 'public'
);

CREATE TABLE "Comments" (
	commentID         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	commentThreadID   uuid NOT NULL REFERENCES "CommentThread"(commentThreadID) ON DELETE CASCADE,
	userID            uuid NOT NULL REFERENCES "Users"(userID),
	created           timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	edited			  timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	body              text NOT NULL
);

CREATE TABLE "Mentions" (
	mentionID      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	commentID      uuid NOT NULL REFERENCES "Comments"(commentID) ON DELETE CASCADE,
	userID         uuid REFERENCES "Users"(userID) ON DELETE CASCADE,
	userGroup	   text REFERENCES "CourseRolePermissions"(courseRoleID) ON DELETE CASCADE,
	CONSTRAINT either_or CHECK ((userID IS NULL) != (userGroup IS NULL))
);
	

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
	${usersView()}
);
CREATE VIEW "CourseUsersView" AS (
	${CourseUsersView()}
);

CREATE VIEW "CoursesView" AS (
	${CoursesView()}
);

CREATE VIEW "CourseUsersViewAll" AS (
	${CourseUsersViewAll()}
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
);


CREATE OR REPLACE FUNCTION _viewableSubmissions (userID uuid, courseID uuid)   
	RETURNS TABLE (submissionID uuid) AS $$  
	DECLARE  
	course_user "CourseUsersViewAll"%ROWTYPE;
	BEGIN  

	SELECT * INTO course_user -- get extra info on the current user
	FROM "CourseUsersViewAll" as c
	WHERE c.userID = $1
		AND c.courseID = $2;
	
	-- if a user can see all, return all
	IF ((b'${toBin(2 ** PermissionEnum.viewAllSubmissions)}' & course_user.permission) > 0::bit(${permissionBits})) THEN
		RETURN QUERY (
			SELECT s.submissionID 
			FROM "SubmissionsView" as s
			WHERE s.courseID=$2
		);
	ELSE
		RETURN QUERY ( -- your submission
			SELECT s.submissionID 
			FROM "SubmissionsView" as s
			WHERE s.courseID=$2
			AND s.userID = $1
		);
		RETURN QUERY ( -- you commented on it
			SELECT c.submissionID
			FROM "CommentsView" as c
			WHERE c.courseID=$2
			AND c.userID=$1
		);
		RETURN QUERY ( -- you are mentioned in a comment
			SELECT m.submissionID
			FROM "MentionsView" as m
			WHERE m.courseID = $2
			AND ( m.userID = $1
				OR m.courseRole = course_user.courseRole
				)
		);
	END IF;
	END; $$ LANGUAGE plpgsql;  


	CREATE OR REPLACE FUNCTION viewableSubmissions(userID uuid, courseID uuid)   
	RETURNS TABLE (submissionID uuid) AS $$
	BEGIN
	RETURN QUERY (
		SELECT DISTINCT *
		FROM _viewableSubmissions($1, $2)
	);
	END; $$ LANGUAGE plpgsql;
	 

-- the standard roles

INSERT INTO "CourseRolePermissions" VALUES
	('moduleCoordinator', 64898867406::bit(${permissionBits})),
    ('student', 25769803776::bit(${permissionBits})),
    ('TA', 64898465858::bit(${permissionBits})),
	('teacher', 64898859078::bit(${permissionBits})),
	('unregistered', 0::bit(${permissionBits})),
	('plugin', 0::bit(${permissionBits}));

INSERT INTO "GlobalRolePermissions" VALUES
	('admin', 64907262175::bit(${permissionBits})),
	('staff', 14528::bit(${permissionBits})),
	('user', 0::bit(${permissionBits})),
	('unregistered', 0::bit(${permissionBits})),
	('plugin', 0::bit(${permissionBits}));
`;
}