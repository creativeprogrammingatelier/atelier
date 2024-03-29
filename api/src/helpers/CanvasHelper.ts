// The Canvas API uses snake_case everywhere, so for consistency with that we'll
// allow sake_case in this file
/* eslint-disable camelcase */

import {UserDB} from "../database/UserDB";
import {getCurrentUserID} from "./AuthenticationHelper";
import {Request} from "express";
import Link from "http-link-header";
import fetch from "node-fetch";
import {config} from "./ConfigurationHelper";

export class IntegrationNotEnabledError extends Error {
    integration: string;

    constructor(integration: string) {
        super(`The integration with ${integration} is not enabled and can not be used.`);
        this.integration = integration;
    }
}

export interface CanvasUser {
    name: string
    email?: string
}

function canvasConfig() {
    const cnv = config.canvas;
    if (cnv === undefined) throw new IntegrationNotEnabledError("Canvas");
    return {
        canvas_url_root: cnv.baseUrl,
        redirect_uri: config.baseUrl + "/api/canvas/oauth_complete",
        client_id: cnv.clientId,
        client_secret: cnv.clientSecret
    };
}

export function isCanvasIntegrationEnabled() {
    return config.canvas !== undefined;
}

export async function getAccessToken(refreshToken: string) {
    const {canvas_url_root, client_id, client_secret, redirect_uri} = canvasConfig();
    const grant_type = "refresh_token";
    const result = await fetch(`${canvas_url_root}/login/oauth2/token?grant_type=${grant_type}&client_id=${client_id}&client_secret=${client_secret}&redirect_uri=${redirect_uri}&refresh_token=${refreshToken}`, {method: "POST"});
    const {access_token} = await result.json() as { access_token: string };
    return access_token;
}

export async function getRefreshToken(request: Request) {
    const userID: string = await getCurrentUserID(request);
    const user = await UserDB.getUserByID(userID);
    return user.canvasrefresh;
}

export async function deleteCanvasLink(access_token: string) {
    const {canvas_url_root} = canvasConfig();
    await fetch(`${canvas_url_root}/login/oauth2/token?access_token=${access_token}`, {method: "DELETE"});
}

export async function createRefreshToken(request: Request) {
    const {canvas_url_root, client_id, client_secret, redirect_uri} = canvasConfig();
    const code = request.query.code as string;
    const grant_type = "authorization_code";
    const result = await fetch(`${canvas_url_root}/login/oauth2/token?grant_type=${grant_type}&client_id=${client_id}&client_secret=${client_secret}&redirect_uri=${redirect_uri}&code=${code}`, {method: "POST"});
    const {refresh_token} = await result.json() as { refresh_token: string };
    return refresh_token;
}

export function setUpCanvasLinkJson() {
    const {canvas_url_root, client_id, redirect_uri} = canvasConfig();
    return {redirect: `${canvas_url_root}/login/oauth2/auth?client_id=${client_id}&scope=url:GET|/api/v1/courses url:GET|/api/v1/courses/:course_id/users &response_type=code&state=YYY&redirect_uri=${redirect_uri}`};
}


export async function getCourses(access_token: string) {
    const {canvas_url_root} = canvasConfig();
    const url = (`${canvas_url_root}/api/v1/courses?access_token=${access_token}&per_page=${100}`);
    return handlePagination(url);
}


export async function getCourseUsersTAs(course_id: string, access_token: string) {
    const {canvas_url_root} = canvasConfig();
    const url = `${canvas_url_root}/api/v1/courses/${course_id}/users?access_token=${access_token}&enrollment_type[]=ta&per_page=${100}`;
    return await handlePagination<CanvasUser>(url);
}

export async function getCourseUsersStudents(course_id: string, access_token: string) {
    const {canvas_url_root} = canvasConfig();
    const url = `${canvas_url_root}/api/v1/courses/${course_id}/users?access_token=${access_token}&enrollment_type[]=student&per_page=${100}`;
    return await handlePagination<CanvasUser>(url);
}


export async function handlePagination<T>(url: string): Promise<T[]> {
    let results: T[] = [];
    let next = false;
    do {
        const response = await fetch(url);
        const link: Link = Link.parse(response.headers.get("link") || "");
        const result = await response.json() as T;
        results = results.concat(result);
        if (link.has("rel", "next")) {
            next = true;
            url = link.get("rel", "next")[0].uri;
        } else {
            next = false;
        }
    } while (next);
    return results;
}
