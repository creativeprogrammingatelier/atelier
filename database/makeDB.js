const pg = require('pg')

const pool = new pg.Pool({
	host: '127.0.0.1',
	database: 'template1',
	port: '5432'
});
//This script can only be run locally, 
// to use this with a remote server, change the host. user and password will be required in all other instances of pool.
// user: 'assistantassistant',
// password: '0disabled-Dusky-lags-Nursery4-Nods-2Floss-Coat-Butte-4Ethel-Hypnosis-bel',
pool.query(`
CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\";

DROP USER IF EXISTS assistantassistant;
CREATE ROLE assistantassistant;
ALTER ROLE assistantassistant WITH SUPERUSER INHERIT CREATEROLE CREATEDB LOGIN REPLICATION BYPASSRLS PASSWORD 'md594b9257ac7635f4597e055106a53fddd';

DROP TABLE IF EXISTS 
	CourseRolePermissions, Users, 
	Courses, CourseRegistration, 
	Submissions, Files, Snippets, 
	CommentThread, Comments;

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
     name         text NOT NULL CHECK (name <> ''),
     globalRole   text NOT NULL DEFAULT 'user',
     email        text NOT NULL UNIQUE CHECK (email <> ''),
     hash         char(60) NOT NULL
);
INSERT INTO "Users" VALUES
     (DEFAULT, 'Caaas', DEFAULT, 'Cas@Caaas', '$2b$10$/AP8x6x1K3r.bWVZR8B.l.LmySZwKqoUv8WYqcZTzo/w6.CHt7TOu'),
	('00000000-0000-0000-0000-000000000000', 'Cas', DEFAULT, 'Cas@Cas', '$2b$10$/AP8x6x1K3r.bWVZR8B.l.LmySZwKqoUv8WYqcZTzo/w6.CHt7TOu');



CREATE TABLE "Courses" (
     courseID   uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
     name       text NOT NULL CHECK (name <> ''),
     state      text NOT NULL DEFAULT 'open',
     creator    uuid REFERENCES "Users" (userID)
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
     userID         uuid NOT NULL REFERENCES "Users"(userID),
     name           text NOT NULL CHECK (name <> ''),
     date           timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
     state          text NOT NULL DEFAULT 'new'
);
INSERT INTO "Submissions" VALUES
	('00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000000', 'my_first_submission', DEFAULT, DEFAULT);


CREATE TABLE "Files" (
     fileID         uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
     submissionID   uuid NOT NULL REFERENCES "Submissions"(submissionID),
     pathname       text NOT NULL CHECK (pathname <> ''),
     type           text NOT NULL DEFAULT 'unsupported'
);
INSERT INTO "Files" VALUES
     ('00000000-0000-0000-0000-000000000000', (SELECT submissionID from "Submissions" LIMIT 1), 'my_first_submission', 'processing');


CREATE TABLE "Snippets" (
     snippetID         uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
     lineStart         integer NOT NULL,
     lineEnd           integer NOT NULL,
     charStart         integer,
     charEnd           integer,
     fileID            uuid REFERENCES "Files"(fileID)
);
INSERT INTO "Snippets" VALUES
	('00000000-0000-0000-0000-000000000000', 0, 1, 0, 0, (SELECT fileID from "Files" LIMIT 1));


CREATE TABLE "CommentThread" (
     commentThreadID   uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
     submissionID      uuid NOT NULL REFERENCES "Submissions"(submissionID),
     fileID            uuid REFERENCES "Files"(fileID),
     snippetID         uuid REFERENCES "Snippets"(snippetID),
     visibilityState   text NOT NULL DEFAULT 'public'
);
INSERT INTO "CommentThread" VALUES
	('00000000-0000-0000-0000-000000000000', (SELECT submissionID from "Submissions" LIMIT 1), (SELECT fileID from "Files" LIMIT 1), (SELECT snippetID from "Snippets" LIMIT 1), DEFAULT),
	(DEFAULT, (SELECT submissionID from "Submissions" LIMIT 1), (SELECT fileID from "Files" LIMIT 1), NULL, DEFAULT),
	(DEFAULT, (SELECT submissionID from "Submissions" LIMIT 1), NULL, NULL, DEFAULT);


CREATE TABLE "Comments" (
     commentID         uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
     commentThreadID   uuid NOT NULL REFERENCES "CommentThread"(commentThreadID),
     userID            uuid NOT NULL REFERENCES "Users"(userID),
     date              timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
     body              text NOT NULL
);
INSERT INTO "Comments" VALUES
	('00000000-0000-0000-0000-000000000000', (SELECT commentThreadID from "CommentThread" LIMIT 1), (SELECT userID from "Users" LIMIT 1), DEFAULT, 'This is comment 0.'),
	(DEFAULT, (SELECT commentThreadID from "CommentThread" LIMIT 1), (SELECT userID from "Users" LIMIT 1), DEFAULT, 'This is a multi\\nline comment!'),
	(DEFAULT, (SELECT commentThreadID from "CommentThread" LIMIT 1), (SELECT userID from "Users" LIMIT 1), DEFAULT, 'This is a comment about nothing at all..');

`).then(console.log).catch(console.error);
// pool.query("SELECT * from Users").then(res => console.log(res, res.rows, res.rows[0])).then(pool.end())
