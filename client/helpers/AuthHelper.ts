import decode from "jwt-decode";
/**
 * Helper with function to do with Authentication and users
 */
export default class AuthHelper {


    static checkRole(role: string) {
        return this.fetch(`/checkRole`, {
            method: "POST",
            body: JSON.stringify({
                role,
            })
        });
    }

    private domain: any;
    // Initializing important variables
    constructor(domain: any) {
        //THIS LINE IS ONLY USED WHEN YOU'RE IN PRODUCTION MODE!
        this.domain = domain || "http://localhost:3000"; // API server domain
    }

    // static register(email: string, password: string, role: string, next: Function) {
    //     this.fetch('/register', {
    //         method: "POST",
    //         body: JSON.stringify({
    //             email,
    //             password,
    //             role
    //         })
    //     }).then((res: any) => {
    //         res.json().then((json: any) => {
    //             this.setToken(json.token); // Setting the token in localStorage
    //             next();
    //         });
    //     })
    // };

    static login(email: string, password: string, next: Function) {
        // Get a token from api server using the fetch api
        this.fetch(`/login`, {
            method: "POST",
            body: JSON.stringify({
                email,
                password
            })
        }).then((res: any) => {
            res.json().then((json: any) => {
                this.setToken(json.token); // Setting the token in localStorage
                next();
            });
        });
    };

    static loggedIn(): boolean {
        // Checks if there is a saved token and it's still valid
        const token = AuthHelper.getToken(); // Getting token from localstorage
        return !!token && !AuthHelper.isTokenExpired(token); // handwaiving here
    };

    static isTokenExpired(token: string): boolean {
        const decoded: any = decode(token);
        try {
            if (decoded.exp < Date.now() / 1000) {
                // Checking if token is expired.
                return true;
            } else return false;
        } catch (err) {
            console.log("expired check failed!");
            return false;
        }
        return false;

    }

    static setToken = (idToken: string) => {
        // Saves user token to localStorage
        localStorage.setItem("id_token", idToken);
    };

    static getToken(): string {
        // Retrieves the user token from localStorage
        return localStorage.getItem("id_token");
    };

    static logout = () => {
        // Clear user token and profile data from localStorage
        localStorage.removeItem("id_token");
    };

    static getConfirm = () => {
        // Using jwt-decode npm package to decode the token
        let answer = decode(AuthHelper.getToken());
        console.log("Recieved answer!");
        return answer;
    };
    /**
     * Helper method to do API calls, should / could be repalced with AXIOS
     */
    static fetch = (url: RequestInfo, options: RequestInit) => {
        // performs api calls sending the required authentication headers
        const headers: any = {
            Accept: "application/json",
            "Content-Type": "application/json"
        };
        // Setting Authorization header
        // Authorization: Bearer xxxxxxx.xxxxxxxx.xxxxxx
        if (AuthHelper.loggedIn()) {
            headers["Authorization"] = AuthHelper.getToken();
        }

        return fetch(url, {
            headers,
            ...options
        })
            .then(AuthHelper._checkStatus).catch(reponse => reponse)
            .then(response => response);
    };

    static _checkStatus = (response: { status: number; statusText: string; }) => {
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
