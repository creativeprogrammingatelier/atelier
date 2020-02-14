const pg = require('pg')

const pool = new pg.Pool({
	user: 'assistantassistant',
	host: '127.0.0.1',
	database: 'template1',
	password: '0disabled-Dusky-lags-Nursery4-Nods-2Floss-Coat-Butte-4Ethel-Hypnosis-bel',
	port: '5432'
});

pool.query(`
DROP TABLE IF EXISTS 
	CourseRolePermissions, Users, 
	Courses, CouresRegistration, 
	Submissions, Files, Snippets, 
	CommentThread, Comments;

DROP TABLE IF EXISTS 
     "CourseRolePermissions", "Users", 
     "Courses", "CouresRegistration", 
     "Submissions", "Files", "Snippets", 
     "CommentThread", "Comments";

CREATE TABLE "CourseRolePermissions" (
    courseRoleID      varchar(40) PRIMARY KEY,
    permission        bit(40) NOT NULL
);
INSERT INTO "CourseRolePermissions" VALUES
	('student', 0::bit(40)),
	('TA', 1::bit(40)),
	('teacher', 3::bit(40));


CREATE TABLE "Users" (
     userID       bigserial PRIMARY KEY,
     name         varchar(70) NOT NULL CHECK (name <> ''),
     globalRole   varchar(40) NOT NULL DEFAULT 'user',
     email        varchar(150) NOT NULL UNIQUE CHECK (email <> ''),
     hash         char(60) NOT NULL
);
INSERT INTO "Users" VALUES
	(DEFAULT, 'Cas', DEFAULT, 'Cas@Cas', '$2b$10$/AP8x6x1K3r.bWVZR8B.l.LmySZwKqoUv8WYqcZTzo/w6.CHt7TOu');


CREATE TABLE "Courses" (
     courseID   bigserial PRIMARY KEY,
     name       varchar(70) NOT NULL CHECK (name <> ''),
     state      varchar(40) NOT NULL DEFAULT 'open',
     creator    bigint REFERENCES "Users" (userID)
);
INSERT INTO "Courses" VALUES
	(DEFAULT, 'Pearls of Computer Science', DEFAULT, 1);


CREATE TABLE "CouresRegistration" (
     courseID       bigint NOT NULL REFERENCES "Courses"(courseID),
     userID         bigint NOT NULL REFERENCES "Users"(userID),
     courseRole     varchar(40) NOT NULL REFERENCES "CourseRolePermissions"(courseRoleID),
     permission     bit(40) NOT NULL,
     PRIMARY KEY (courseID, userID)
);
INSERT INTO "CouresRegistration" VALUES
	(1, 1, 'student', 3::bit(40));


CREATE TABLE "Submissions" (
     submissionID   bigserial PRIMARY KEY,
     userID         bigint NOT NULL REFERENCES "Users"(userID),
     name           varchar(40) NOT NULL CHECK (name <> ''),
     date           timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
     state          varchar(40) NOT NULL DEFAULT 'new'
);
INSERT INTO "Submissions" VALUES
	(DEFAULT, 1, 'my_first_submission', DEFAULT, DEFAULT);


CREATE TABLE "Files" (
     fileID         bigserial PRIMARY KEY,
     submissionID   bigint NOT NULL REFERENCES "Submissions"(submissionID),
     pathname       varchar(40) NOT NULL CHECK (pathname <> ''),
     type           varchar(40) NOT NULL DEFAULT 'unsupported'
);
INSERT INTO "Files" VALUES
     (DEFAULT, 1, 'my_first_submission', 'processing');


CREATE TABLE "Snippets" (
     snippetID         bigserial PRIMARY KEY,
     startLine         integer NOT NULL,
     endLine           integer NOT NULL,
     startChar         integer,
     endChar           integer,
     fileID            bigint REFERENCES "Files"(fileID)
);
INSERT INTO "Snippets" VALUES
	(DEFAULT, 0, 1, 0, 0, 1);


CREATE TABLE "CommentThread" (
     commentThreadID   bigserial PRIMARY KEY,
     submissionID      bigint NOT NULL REFERENCES "Submissions"(submissionID),
     fileID            bigint REFERENCES "Files"(fileID),
     snippetID         bigint REFERENCES "Snippets"(snippetID),
     visibilityState   varchar(40) NOT NULL DEFAULT 'public'
);
INSERT INTO "CommentThread" VALUES
	(DEFAULT, 1, 1, 1, DEFAULT),
	(DEFAULT, 1, 1, NULL, DEFAULT),
	(DEFAULT, 1, NULL, NULL, DEFAULT);


CREATE TABLE "Comments" (
     commentID         bigserial PRIMARY KEY,
     commentThreadID   bigint NOT NULL REFERENCES "CommentThread"(commentThreadID),
     userID            bigint NOT NULL REFERENCES "Users"(userID),
     date              timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
     body              text NOT NULL
);
INSERT INTO "Comments" VALUES
	(DEFAULT, 1, 1, DEFAULT, 'This is comment 0.'),
	(DEFAULT, 2, 1, DEFAULT, 'This is a multi\\nline comment!'),
	(DEFAULT, 3, 1, DEFAULT, 'This is a comment about nothing at all..');

`, (err, res) => {
	console.log('Comments\n', err, res,'\n')
});
// pool.query("SELECT * from Users").then(res => console.log(res, res.rows, res.rows[0])).then(pool.end())
