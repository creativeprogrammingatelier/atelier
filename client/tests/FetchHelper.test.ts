import 'mocha';
import chai, { expect } from 'chai';
import chaiSpies from 'chai-spies';
import chaiAsPromised from 'chai-as-promised';
import { Response } from 'node-fetch';

import { Fetch, FetchError, JsonFetchError } from '../src/helpers/api/FetchHelper';

chai.use(chaiSpies);
chai.use(chaiAsPromised);

// tslint:disable-next-line: no-any
const g = global as any;
// tslint:disable-next-line: no-any
const fetchSpy = (body: any, status: number) => 
    chai.spy(
        (_url: RequestInfo, _options?: RequestInit) => 
            Promise.resolve(new Response(JSON.stringify(body), { status })));

const url = "https://example.com";

describe("FetchHelper.fetch", () => {
    it("should call fetch (the JS function) with the correct URL", async () => {
        g.fetch = fetchSpy({}, 200);
        await Fetch.fetch(url);
        expect(g.fetch).to.have.been.called.once.with(url);
    });

    it("should throw on status 401", () => {
        g.fetch = fetchSpy({}, 401);
        expect(Fetch.fetch(url)).to.eventually.throw(FetchError);
    });
});

describe("FetchHelper.fetchJson", () => {
    it("should return the correct object", async () => {
        const obj = { test: "Some value", prop: { innerProp: [ 1, 2, 3 ] } };
        g.fetch = fetchSpy(obj, 200);
        const res = await Fetch.fetchJson(url);
        expect(res).to.deep.equal(obj);
    });

    it("should throw on status 401", () => {
        const err = { error: "token.expired", message: "Your token has expired." };
        g.fetch = fetchSpy(err, 401);
        expect(Fetch.fetchJson(url)).to.eventually.throw(JsonFetchError, err.message);
    });
})