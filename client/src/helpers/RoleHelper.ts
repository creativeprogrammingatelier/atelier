const roleNames: {[key: string]: string} = {
	admin: "Admin",
	staff: "Staff",
	user: "User",
	plugin: "Plugin",
	unregistered: "Not registered",
	moduleCoordinator: "Module coordinator",
	teacher: "Teacher",
	TA: "Teaching assistant",
	student: "Student"
};

export class RoleHelper {
	static displayName(role: string): string {
		if (role in roleNames) {
			return roleNames[role];
		}
		return roleNames["unregistered"];
	}
}