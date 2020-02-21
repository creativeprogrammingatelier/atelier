import 'mocha';
import chai, { expect } from 'chai';
import chaiSpies from 'chai-spies';

import { Request, Response } from 'express';
import { AuthMiddleware } from '../../api/src/middleware/AuthMiddleware';
import { issueToken } from '../../api/src/helpers/AuthenticationHelper';

chai.use(chaiSpies);

describe("AuthMiddleware.requireAuth", () => {
    function getSpies() {
        const response = { 
            status: chai.spy(() => response), 
            json: chai.spy(() => response) 
        } as unknown as Response;
        return { next: chai.spy(), response };
    }

    it("should reject requests without a token", async () => {
        const spies = getSpies();
        await AuthMiddleware.requireAuth(
            { headers: {} } as Request, 
            spies.response, 
            spies.next
        );
        expect(spies.response.status).to.have.been.called.with(401);
        expect(spies.next).to.not.have.been.called();
    });

    it("should reject requests with an expired token", async () => {
        const spies = getSpies();
        const token = issueToken("", "0s");
        await AuthMiddleware.requireAuth(
            { headers: { authorization: token } } as Request, 
            spies.response, 
            spies.next
        );
        expect(spies.response.status).to.have.been.called.with(401);
        expect(spies.next).to.not.have.been.called();
    });

    it("should reject requests with an invalid token", async () => {
        const spies = getSpies();
        await AuthMiddleware.requireAuth(
            { headers: { authorization: "this is not a valid token" } } as Request,
            spies.response,
            spies.next
        );
        expect(spies.response.status).to.have.been.called.with(401);
        expect(spies.next).to.not.have.been.called();
    });

    it("should accept requests with a valid token", async () => {
        const spies = getSpies();
        const token = issueToken("");
        await AuthMiddleware.requireAuth(
            { headers: { authorization: token } } as Request, 
            spies.response, 
            spies.next
        );
        expect(spies.response.status).to.not.have.been.called();
        expect(spies.next).to.have.been.called.with.exactly();
    });
});