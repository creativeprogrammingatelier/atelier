import { EnumError } from './enumHelper'

export enum globalRole {
	admin = "admin",
	staff = "staff",
	user = "user",
	plugin = 'plugin',
	unauthorized = 'unauthorized',
	none = 'none'
}
