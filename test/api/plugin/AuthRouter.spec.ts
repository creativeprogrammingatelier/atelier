import chai, {expect} from "chai";
import chaiHttp from "chai-http";
import jwt from "jsonwebtoken";
import "mocha";

import {app} from "../../../api/src/app";
import {decodeToken} from "../../../api/src/database/helpers/AuthenticationHelper";
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
		expect(res.body.token).to.not.equal(undefined);
		expect(decodeToken<{userID: string}>(res.body.token).userID).to.equal(plugin.pluginID);
	});
});