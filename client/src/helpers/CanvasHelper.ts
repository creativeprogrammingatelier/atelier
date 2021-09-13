import {Fetch} from "./api/FetchHelper";

export class CanvasHelper {
    static async isEnabled() {
        const response = await Fetch.fetchJson<{enabled: boolean}>("/api/canvas/enabled");
        return response.enabled;
    }

    static async removeLink() {
        const options = {
            method: "delete"
        };
        const response = await Fetch.fetch("/api/canvas/link", options);
        return response;
    }

    static async getLinked() {
        return Fetch.fetchJson<{ linked: boolean }>("/api/canvas/linked");
    }

    static async createLink() {
        return Fetch.fetchJson<{ redirect: string }>("/api/canvas/link", {redirect: "follow"});
    }

}
