import {Request, Response} from 'express';


export default class RoutesHelper {


    static getValueFromBody(key: string, request: Request, response: Response): any {
        if (request.body === null) {
            RoutesHelper.requestMalformed(response);
        }
        const value: any = request.body[key];
        if (value === null) {
            RoutesHelper.requestMalformed(response);
        }
        return value;
    }

    static getValueFromParams(key: string, request: Request, response: Response): any {
        if (request.params == null && request.params === undefined) {
            RoutesHelper.requestMalformed(response);
        }
        const value = request.params[key];
        if (value === null) {
            RoutesHelper.requestMalformed(response);
        }
        return value;
    }

    private static requestMalformed(response: Response) {
        response.status(400).send();
    }


}
