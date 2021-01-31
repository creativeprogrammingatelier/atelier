/**
 * Roles within defined within Atelier
 */
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
	/**
	 * Displays the role value associated with the role key passed.
	 * 
	 * @param role Role key passed in.
	 * @returns The value corresponding to the key passed or unregistered if role is not found.
	 */
	static displayName(role: string): string {
		if (role in roleNames) {
			return roleNames[role];
		}
		return roleNames["unregistered"];
	}
}