import {Fetch} from './api/FetchHelper';

/**
 * Helper with function to do with Authentication and users
 */
export class AuthHelper {
    static loggedIn(): boolean {
        // The backend sets two cookies: atelierToken and atelierTokenExp
        // The first one contains the token and is HTTP-Only (for security reasons)
        // The second contains the expiration timestamp for the token and is readable in JS
        // We are logged in if this cookie exists and the time is in the future
        const exp =
            document.cookie
                .split(";")
                .map(c => c.trim())
                .find(c => c.startsWith("atelierTokenExp"))
                ?.split("=")[1];
        // The JWT expiration is stored in seconds, Date.now() in milliseconds
        return exp !== undefined && Number(exp) * 1000 > Date.now();
    };

    static logout = () => Fetch.fetch("/api/auth/logout");
}
