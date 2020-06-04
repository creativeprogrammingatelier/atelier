import {Permission} from "./Permission";

export interface User {
	ID: string,
	name: string,
	email: string,
    permission: Permission,
    researchAllowed?: boolean
}