import { User } from "./User";

export interface Plugin {
	pluginID : string,
	webhookUrl : string,
	webhookSecret : string,
    publicKey : string,
    hooks : string[],
    user : User
}