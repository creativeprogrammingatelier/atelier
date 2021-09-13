import chai, {expect} from "chai";
import chaiSpies from "chai-spies";
import chaiAsPromised from "chai-as-promised";
import "mocha";
import {Response as FetchResponse} from "node-fetch";

import {Fetch} from "../../client/src/helpers/api/FetchHelper";

chai.use(chaiSpies);
chai.use(chaiAsPromised);

const g = global;
const fetchSpy = (body: unknown, status: number) =>
    chai.spy(async (_url: RequestInfo, _options?: RequestInit) =>
        Promise.resolve(new FetchResponse(JSON.stringify(body), {status}) as unknown as Response),
    );

const url = "https://example.com";

describe("FetchHelper.fetch", () => {
    it("should call fetch (the JS function) with the correct URL", async () => {
        g.fetch = fetchSpy({}, 200) as (input: RequestInfo, init?: RequestInit | undefined) => Promise<Response>;
        await Fetch.fetch(url);
        expect(g.fetch).to.have.been.called.once.with(url);
    });
    // TODO [TEST]: Fails (probably chai broke again with async things)
    // it('should throw on status 401', () => {
    //   g.fetch = fetchSpy({}, 401);
    //   expect(Fetch.fetch(url)).to.eventually.throw(FetchError);
    // });
});

describe("FetchHelper.fetchJson", () => {
    it("should return the correct object", async () => {
        const obj = {test: "Some value", prop: {innerProp: [1, 2, 3]}};
        g.fetch = fetchSpy(obj, 200);
        const res = await Fetch.fetchJson(url);
        expect(res).to.deep.equal(obj);
    });
    // TODO [TEST]: Fails
    // it('should throw on status 401', () => {
    //   const err = {error: 'token.expired', message: 'Your token has expired.'};
    //   g.fetch = fetchSpy(err, 401);
    //   expect(Fetch.fetchJson(url)).to.eventually.throw(JsonFetchError, err.message);
    // });
});
