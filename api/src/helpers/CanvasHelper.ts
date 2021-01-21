import { UserDB } from "../database/UserDB";
import { getCurrentUserID } from "./AuthenticationHelper";
import express, {Request, Response} from "express";
import LinkHeader from 'http-link-header'

const url_root = "https://utwente-dev.instructure.com";
const redirect_uri = "http://localhost:5000/api/canvas/oauth_complete";
const client_id = "182170000000000110"
const client_secret =  "XWQdS65BrQyur2LCugFlmigNpNEfjLSLCnPx9SINAnX9pojYI8lrefoeFdSLJQXD"
import requestPromise from 'request-promise';
import Link from "http-link-header";
export async function  getAccessToken(refreshToken: string){
    let requestPromise = require('request-promise');
    let grant_type = "refresh_token";
    let result = await requestPromise.post(`${url_root}/login/oauth2/token?grant_type=${grant_type}&client_id=${client_id}&client_secret=${client_secret}&redirect_uri=${redirect_uri}&refresh_token=${refreshToken}`);
    let access_token: string = JSON.parse(result).access_token
    return access_token;
}

export async function getRefreshToken(request: Request){
    const userID: string = await getCurrentUserID(request);
    const user: any = await UserDB.getUserByID(userID);
   return user.canvasrefresh
}

export async function deleteCanvasLink(access_token: String){
    await requestPromise.delete(`${url_root}/login/oauth2/token?access_token=${access_token}`);
}

export async function createRefreshToken(request: Request){
   let code = (request.query.code) 
   let grant_type = "authorization_code"
   let result = await requestPromise.post(`${url_root}/login/oauth2/token?grant_type=${grant_type}&client_id=${client_id}&client_secret=${client_secret}&redirect_uri=${redirect_uri}&code=${code}`);
   return JSON.parse(result).refresh_token
}

export function setUpCanvasLinkJson(){
    return {redirect:`${url_root}/login/oauth2/auth?client_id=${client_id}&scope=url:GET|/api/v1/courses url:GET|/api/v1/courses/:course_id/users &response_type=code&state=YYY&redirect_uri=${redirect_uri}`}
}


export async function getCourses(access_token: String){
    let url = (`${url_root}/api/v1/courses?access_token=${access_token}&per_page=${100}`)
     return  handlePagination(url);
}


export async function getCourseUsersTAs(course_id: String, access_token: String){
    let url = `${url_root}/api/v1/courses/${course_id}/users?access_token=${access_token}&enrollment_type[]=ta&per_page=${100}`
    return await handlePagination(url);

}

export async function getCourseUsersStudents(course_id: String, access_token: String){
    let url = `${url_root}/api/v1/courses/${course_id}/users?access_token=${access_token}&enrollment_type[]=student&per_page=${100}`
    return await handlePagination(url);
}


export async function handlePagination(url: string): Promise<any>{
    let results: any = []
    let next = false;
    do{
        let response = await requestPromise(url, {resolveWithFullResponse: true})
        let link: Link = LinkHeader.parse(response.caseless.dict.link)
        let result = JSON.parse(response.body)
        results = results.concat(result)
        if(link.has( 'rel', 'next' )){
            next = true
            url =  link.get( 'rel', 'next' )[0].uri
        } else { 
            next = false;
        }
    }while(next)
    return results;
}