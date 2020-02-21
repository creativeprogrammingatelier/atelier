import 'mocha';
import chai, { expect } from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { randomBytes } from 'crypto';

import { Request } from 'express';
import jwt from 'jsonwebtoken';
import * as auth from '../../api/src/helpers/AuthenticationHelper';

chai.use(chaiAsPromised);

describe("AuthenticationHelper", () => {
    const userID = randomBytes(16).toString('hex');

    it("should issue verifiable tokens", async () => {
        const token = auth.issueToken(userID);
        const props = await auth.verifyToken(token);
        expect((props as { userID: string }).userID).to.equal(userID);
    });

    it("should throw on expired token", () => {
        const token = auth.issueToken(userID, "1m");
        const verification = auth.verifyToken(token, Date.now() + 61 * 1000);
        expect(verification).to.be.rejectedWith(jwt.TokenExpiredError);
    });

    it("should retrieve the userID from a request", async () => {
        const token = auth.issueToken(userID);
        const req = { headers: { authorization: token } } as Request;
        const result = await auth.getCurrentUserID(req);
        expect(result).to.equal(userID);
    });

    it("should retrieve the userID from a request using a Bearer header", async () => {
        const token = auth.issueToken(userID);
        const req = { headers: { authorization: `Bearer ${token}` } } as Request;
        const result = await auth.getCurrentUserID(req);
        expect(result).to.equal(userID);
    });
});