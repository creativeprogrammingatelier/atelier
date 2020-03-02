import decode from 'jwt-decode';
import { Fetch } from './FetchHelper';

/**
 * Helper with function to do with Authentication and users
 */
export default class AuthHelper {


	static checkRole(role: string) {
		return Fetch.fetch(`/api/auth/role`, {
			method: 'POST',
			body: JSON.stringify({
				role
			})
		});
	}
	static checkRoles(roles: string[]) {
		return Fetch.fetch(`/api/auth/role`, {
			method: 'POST',
			body: JSON.stringify({
				roles
			})
		});
	}

	static getRole() {
		return Fetch.fetch(`/api/auth/role`, {
			method: 'GET'
		});
	}

	static register(email: string, password: string, role: string, onSuccess: Function, onFailure: Function) {
		Fetch.fetchJson('/api/auth/register', {
			method: 'POST',
			body: JSON.stringify({
				email,
				password,
				role
			})
		}).then((res: any) => {
            onSuccess();
		}).catch((e: any) => {
			console.log(e), onFailure();
		});
	};

	static login(email: string, password: string, onSuccess: Function, onFailure: Function) {
		// Get a token from api server using the fetch api
		Fetch.fetchJson(`/api/auth/atelier/login`, {
			method: 'POST',
			body: JSON.stringify({
				email,
				password
			})
		}).then((res: any) => {
            onSuccess();
		}).catch((e: any) => {
			console.log(e), onFailure();
		});
    };

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

	static logout = () => {
		// Clear user token and profile data from localStorage
		localStorage.removeItem('id_token');
	};

	static _checkStatus = (response: {status: number; statusText: string;}) => {
		// raises an error in case response status is not a success
		if (response.status >= 200 && response.status < 300) {
			// Success status lies between 200 to 300
			return response;
		} else {
			var error = new Error(response.statusText);
			error.message = response.statusText;
			throw error;
		}
	};
}
