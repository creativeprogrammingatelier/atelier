import { response } from "express";
import { Fetch } from "./api/FetchHelper";

export class CanvasHelper {

    static async getLinked(){
        const response = await Fetch.fetch("/api/canvas/linked");
        return response;
    }

}