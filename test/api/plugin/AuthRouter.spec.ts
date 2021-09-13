import chai, {expect} from "chai";
import chaiHttp from "chai-http";
import jwt from "jsonwebtoken";
import "mocha";

import {app} from "../../../api/src/app";
import {decodeToken} from "../../../api/src/helpers/AuthenticationHelper";
import {privateKey, plugin} from "./Plugin";

chai.use(chaiHttp);

describe("GET /api/auth/token", () => {
    it("should return a token with plugin userID", async() => {
        const reqToken = jwt.sign({}, privateKey.export({format: "pem", type: "pkcs1"}), {
            issuer: plugin.pluginID,
            algorithm: "RS256"
        });
        const res = await chai.request(app).get("/api/auth/token").auth(reqToken, {type: "bearer"});

        expect(res).to.have.status(200);
        const token = (res.body as { token: string }).token;
        expect(token).to.not.equal(undefined);
        expect(decodeToken<{userID: string}>(token).userID).to.equal(plugin.pluginID);
    });
});
