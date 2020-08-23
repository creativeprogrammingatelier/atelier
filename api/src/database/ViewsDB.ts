/**
 * most exported functions in this file, contain the query string for some view of the database
 * By calling these functions, the respective query can be inserted into some string at the callee's end.
 * parameters given to these functions replace tables `FROM` which data is pulled.
 * this can be used to allow the data from an insert or update to be utilized in the respective view
 * All these queries have a `WHERE` clause specified, so to add more checks can be done by appending `AND <condition>`
 * but is generally not best practice, as it requires to know what names are used in the query.
 *
 */
export function usersView(userTable = `"Users"`) {
	return `
		SELECT userID, 
			userName, 
			email,
            globalRole,
            researchAllowed,
			permission | (
				SELECT permission 
				FROM "GlobalRolePermissions" 
				WHERE globalRoleID=globalRole
			) AS permission
		FROM ${userTable}
		WHERE 1=1	
		`;
}

export function CourseUsersView(courseRegistrationTable = `"CourseRegistration"`) {
	return `
		SELECT 
			c.courseID, u.userID, e.courseRole,
			u.userName, u.email, u.globalRole,
			u.permission | e.permission | crp.permission AS permission
		FROM  
			"UsersView" as u, 
			"Courses" as c,
			"CourseRolePermissions" as crp,
			${courseRegistrationTable} as e
		WHERE e.courseID = c.courseID 
		AND e.userID = u.userID
		AND e.courseRole = crp.courseRoleID
	`;
}

/** NOTE: this is almost the same as CourseUsersView, but now non-existent rows are added with nulls in the right locations */
export function CourseUsersViewAll(courseRegistrationTable = `"CourseRegistration"`) {
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
		SELECT abp.courseID, abp.userID, abp.courseRole, abp.permission | 
			COALESCE( -- if entry not present, use 0 for no permissions
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
	`;
}

export function CoursesView(coursesTable = `"Courses"`, usersView = `"UsersView"`) {
	return `
		SELECT c.*, u.userName, u.globalrole, u.email, u.userID, u.permission
		FROM ${coursesTable} as c, ${usersView} as u
		WHERE c.creator = u.userID
	`;
}

export function submissionsView(submissionsTable = `"Submissions"`, usersView = `"UsersView"`) {
	return `
		SELECT s.*, u.userName, u.globalrole, u.email, u.permission
		FROM ${submissionsTable} as s, ${usersView} as u
		WHERE s.userID = u.userID
	`;
}

export function filesView(filesTable = `"Files"`) {
	return `
		SELECT f.*, sr.courseID
		FROM ${filesTable} as f, "SubmissionsRefs" as sr
		WHERE f.submissionID = sr.submissionID
	`;
}

export function snippetsView(snippetsTable = `"Snippets"`, filesView = `"FilesView"`) {
	return `
		SELECT s.*, fv.*, ctr.commentThreadID
		FROM ${snippetsTable} as s, "CommentThreadRefs" as ctr, ${filesView} as fv
		WHERE ctr.snippetID = s.snippetID
		AND fv.fileID = ctr.fileID
	`;
}

export function commentsView(commentsTable = `"Comments"`, usersView = `"UsersView"`) {
	return `
		SELECT 
			c.*, 
			u.userName, u.globalrole, u.email, u.permission, 
			ctr.submissionID, ctr.courseID, ctr.fileID, ctr.snippetID,
			fv.type, sv.lineStart --null checks
		FROM ${commentsTable} as c, ${usersView} as u, "CommentThreadRefs" as ctr, "FilesView" as fv, "SnippetsView" as sv
		WHERE c.userID = u.userID
		AND ctr.commentThreadID = c.commentThreadID
		AND fv.fileID = ctr.fileID
		AND sv.snippetID = ctr.snippetID
	`;
}

export function commentThreadView(commentThreadTable = `"CommentThread"`) {
	return `
		SELECT 
			sr.courseID, sr.submissionID, ct.commentThreadID, ct.snippetID, ct.fileID,
			ct.visibilityState, ct.automated,
			sv.body, sv.contextBefore, sv.contextAfter, sv.lineStart, sv.charStart, sv.lineEnd, sv.charEnd,
            fv.pathname, fv.type,
            u.userID as sharedByID, u.userName as sharedByName, u.email as sharedByEmail, 
            u.globalRole as sharedByGlobalRole, u.courseRole as sharedByCourseRole, u.permission as sharedByPermission,
            (SELECT MIN(created) FROM "Comments" as c WHERE c.commentThreadID = ct.commentThreadID) AS created
        FROM ${commentThreadTable} as ct
        JOIN "SubmissionsRefs" as sr ON ct.submissionID = sr.submissionID 
        JOIN "Snippets" as sv ON ct.snippetID = sv.snippetID
        JOIN "Files" as fv ON fv.fileID = ct.fileID
        LEFT JOIN "CourseUsersView" as u ON ct.sharedBy = u.userID AND sr.courseID = u.courseID
	`;
}

export function MentionsView(mentionsTable = `"Mentions"`) {
	return `
		SELECT 
			m.mentionID, m.userGroup,
			cv.commentID, cv.fileID, cv.commentThreadID, cv.snippetID, 
			cv.submissionID, cv.courseID, cv.created, cv.edited, 
			cv.body, cv.type, cv.lineStart,
			cu.userID, cu.userName, cu.email, cu.globalRole, 
			cu.courseRole, cu.permission, 
			cmu.userID as cmuUserID, 
			cmu.userName as cmuUserName, cmu.email as cmuEmail, 
			cmu.globalRole as cmuGlobalRole,
			cmu.permission as cmuPermission, 
			subm.title as submTitle, 
			c.courseName
		FROM 
			${mentionsTable} as m, 
			"CommentsView" as cv, 
			"CourseUsersView" as cu,
			"UsersView" as cmu, 
			"Submissions" as subm, 
			"Courses" as c
		WHERE m.commentID = cv.commentID
		AND m.userID = cu.userID
		AND cv.courseID = cu.courseID
		AND cv.userID = cmu.userID
		AND cv.submissionID = subm.submissionID
		AND cv.courseID = c.courseID
		UNION -- if addressing a group, user is null. account for that.
		SELECT 
			m.mentionID, m.userGroup, 
			cv.commentID, cv.fileID, cv.commentThreadID, cv.snippetID, 
			cv.submissionID, cv.courseID, cv.created, cv.edited,
			cv.body, cv.type, cv.lineStart,
			NULL, NULL, NULL, NULL, 
			NULL, NULL, 
			cmu.userID as cmuUserID, 
			cmu.userName as cmuUserName, 
			cmu.email as cmuEmail, 
			cmu.globalRole as cmuGlobalRole,
			cmu.permission as cmuPermission, 
			subm.title as submTitle, 
			c.courseName
		FROM 
			${mentionsTable} as m , 
			"CommentsView" as cv, 
			"CourseUsersView" as cmu, 
			"Submissions" as subm, 
			"Courses" as c
		WHERE m.commentID = cv.commentID
		AND m.userID IS NULL
		AND cv.userID = cmu.userID
		AND cv.submissionID = subm.submissionID
		AND cv.courseID = c.courseID
	`;
}

export function TagsView(tagsTable = `"Tags"`) {
	return `
		SELECT 
			t.tagID, t.tagbody,
			cv.commentID, cv.fileID, cv.commentThreadID, cv.snippetID, 
			cv.submissionID, cv.courseID, cv.created, cv.edited, 
			cv.body, cv.type, cv.lineStart,
			cmu.userID as cmuUserID, 
			cmu.userName as cmuUserName, cmu.email as cmuEmail, 
			cmu.globalRole as cmuGlobalRole,
			cmu.permission as cmuPermission, 
			subm.title as submTitle, 
			c.courseName
		FROM 
			${tagsTable} as t, 
			"CommentsView" as cv, 
			"Submissions" as subm, 
			"CourseUsersView" as cmu, 
			"Courses" as c
		WHERE t.commentID = cv.commentID
		AND cv.submissionID = subm.submissionID
		AND cv.courseID = c.courseID
		AND cv.userID = cmu.userID
		AND cv.courseID = cmu.courseID
	`;
}