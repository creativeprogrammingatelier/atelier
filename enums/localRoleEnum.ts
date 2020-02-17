enum localPermissions {
	None = 0,
	viewPublicComment = 1,
	viewPrivateComment = 2,
	writePublicComment = 4,
	writePrivateComment = 8,
	allowMention = 16,
	createAssignment = 32,
	submitAssignment = 64
}

const P = localPermissions
export enum localRoles {
	student = "student",
	TA = "TA",
	teacher = "teacher"
}
// export enum defaultRolePermissions {
// 	student = P.viewPublicComment 
// 			^ P.writePublicComment 
// 			^ P.allowMention 
// 			^ P.submitAssignment,

// 	TA 		= P.viewPublicComment 
// 			^ P.writePublicComment 
// 			^ P.viewPrivateComment 
// 			^ P.writePrivateComment
// 			^ P.allowMention,

// 	teacher = P.viewPublicComment 
// 			^ P.writePublicComment 
// 			^ P.viewPrivateComment 
// 			^ P.writePrivateComment
// 			^ P.allowMention
// 			^ P.createAssignment,
// }
