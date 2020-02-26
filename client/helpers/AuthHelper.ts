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
		return Fetch.fetch(`/api/auth/roles`, {
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

	private domain: string;
	// Initializing important variables
	constructor(domain: string) {
		//THIS LINE IS ONLY USED WHEN YOU'RE IN PRODUCTION MODE!
		this.domain = domain || 'http://localhost:3000'; // API server domain
	}

	static register(email: string, password: string, role: string, onSuccess: Function, onFailure: Function) {
		Fetch.fetch('/api/auth/register', {
			method: 'POST',
			body: JSON.stringify({
				email,
				password,
				role
			})
		}).then((res: any) => {
			res.json().then((json: any) => {
				this.setToken(json.token); // Setting the token in localStorage
				onSuccess();
			}).catch((e: any) => {
				console.log(e), onFailure();
			});
		}).catch((e: any) => {
			console.log(e), onFailure();
		});
	};

	static login(email: string, password: string, onSuccess: Function, onFailure: Function) {
		// Get a token from api server using the fetch api
		Fetch.fetch(`/api/auth/login`, {
			method: 'POST',
			body: JSON.stringify({
				email,
				password
			})
		}).then((res: any) => {
			res.json().then((json: any) => {
				this.setToken(json.token); // Setting the token in localStorage
				onSuccess();
			});
		}).catch((e: any) => {
			console.log(e), onFailure();
		});
    };

	static loggedIn(): boolean {
		const token = AuthHelper.getToken(); // Getting token from localstorage
		return !!token && !AuthHelper.isTokenExpired(token); // handwaiving here
	};

	static isTokenExpired(token: string): boolean {
		const decoded: any = decode(token);
		try {
			if (decoded.exp < Date.now() / 1000) {
				return true;
			} else {
				return false;
			}
		} catch (err) {
			console.log('Token expired check failed!');
			return false;
		}
	}

    /** Save token to local storage */
	static setToken(idToken: string) {
		localStorage.setItem('id_token', idToken);
	};

    /** Retrieve current token from storage */
	static getToken() {
		return localStorage.getItem('id_token');
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
