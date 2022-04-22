/* eslint-disable @typescript-eslint/await-thenable */
// ESLint doesn't think a RequestHandler is 'thenable', but it really just returns a Promise

import {expect} from "chai";
import {Request, Response, NextFunction} from "express";
import "mocha";

import {AuthError, issueToken} from "../../../api/src/helpers/AuthenticationHelper";
import {AuthMiddleware} from "../../../api/src/middleware/AuthMiddleware";

describe("AuthMiddleware.requireAuth", () => {
    const response = {} as unknown as Response;
    let nextCount = 0;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-empty-function
    function next(check: (args: any[]) => void = () => {}) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return ((...args: any[]) => {
            nextCount++;
            check(args);
        }) as NextFunction;
    }

    beforeEach(() => {
        nextCount = 0;
    });

    it("should reject requests without a token", async() => {
        await AuthMiddleware.requireAuth(
            {headers: {}} as Request,
            response,
            next(args => {
                expect(args).to.have.length(1);
                expect((args[0] as AuthError).reason).to.equal("token.notProvided");
            })
        );
        expect(nextCount).to.equal(1);
    });
    it("should reject requests with an expired token", async() => {
        const token = issueToken("", "0s");
        await AuthMiddleware.requireAuth(
            {headers: {authorization: token}} as Request,
            response,
            next(args => {
                expect(args).to.have.length(1);
                expect((args[0] as AuthError).reason).to.equal("token.expired");
            })
        );
        expect(nextCount).to.equal(1);
    });
    it("should reject requests with an invalid token", async() => {
        await AuthMiddleware.requireAuth(
            {headers: {authorization: "this is not a valid token"}} as Request,
            response,
            next(args => {
                expect(args).to.have.length(1);
                expect((args[0] as AuthError).reason).to.equal("token.invalid");
            })
        );
        expect(nextCount).to.equal(1);
    });
    it("should accept requests with a valid token", async() => {
        const token = issueToken("");
        await AuthMiddleware.requireAuth(
            {headers: {authorization: token}} as Request,
            response,
            next(args => {
                expect(args).to.have.length(0);
            })
        );
        expect(nextCount).to.equal(1);
    });
});
