import {expect} from "chai";
import {Request, Response, NextFunction} from "express";
import "mocha";

import {issueToken} from "../../../api/src/helpers/AuthenticationHelper";
import {AuthMiddleware} from "../../../api/src/middleware/AuthMiddleware";

describe("AuthMiddleware.requireAuth", () => {
	const response = {} as unknown as Response;
	let nextCount = 0;
	
	// tslint:disable-next-line: no-any
	function next(check: (args: any[]) => void = () => {
	}) {
		// tslint:disable-next-line: no-any
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
				expect(args[0].reason).to.equal("token.notProvided");
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
				expect(args[0].reason).to.equal("token.expired");
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
				expect(args[0].reason).to.equal("token.invalid");
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