
import User from "../models/user";
import fs from "fs";
import jwt from "jsonwebtoken";
import {Constants} from "../lib/constants";
import {Request, Response} from "express";

/**
 * Files middleware provides helper methods for interacting with comments in the DB
 * @Author Andrew Heath
 */
export default class UsersMiddleware{
    static getAllStudents (onSuccess: Function, onFailure: Function){
        User.find({
            role: "student"
        }, -"password",(error, result) => {
            if (!error) {
                onSuccess(result);
            } else {
                onFailure(error);
            }
        })
    }
        /**
     * Get the user object corresponding to the request
     * @param {*} request 
     * @param {*} next callback
     */
    static getUser(request: Request, onSuccess: Function, onFailure: Function) {
        const token =
            request.headers.authorization;
        jwt.verify(token, Constants.AUTHSECRETKEY,  (error: Error, decoded: any) => {
            if (error) {
                onFailure(error);
            } else {
                let email = decoded.email;
                User.findOne({
                    email
                }, (error, user) => {
                    if (user) {
                        onSuccess(user, request)
                    } else {
                        onFailure(error);
                    }
            }).catch((error) => {
                console.log(error)
                onFailure(error);
            });
            }
        });
    }
}