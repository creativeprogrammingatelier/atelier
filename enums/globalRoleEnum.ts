export enum globalRole {
	admin = "teacher",
	user = "user",
	unauthorized = 'unauthorized',
	plugin = 'plugin',
	DEBUG = "DEBUG"
}

export function checkEnum(str : string) : str is keyof typeof globalRole {
	return str in globalRole
}
