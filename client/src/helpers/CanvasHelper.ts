import { response } from "express";
import { Fetch } from "./api/FetchHelper";

export class CanvasHelper {
	static async removeLink() {
        let options ={ 
            method:"delete"
        }
        const response = await Fetch.fetch("/api/canvas/link", options);
        return response;
	}

    static async getLinked(){
        const response = await Fetch.fetch("/api/canvas/linked");
        return response.json();
    }

    static async createLink(){
        const response = await Fetch.fetch("/api/canvas/link",{redirect: 'follow'});
        return response.json();
    }

}