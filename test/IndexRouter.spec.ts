import * as app from '../api/src/app';
import chai from 'chai';
import chaiHttp from 'chai-http';
import 'mocha';

chai.use(chaiHttp);
const expect = chai.expect;
const appUrl = 'http://localhost:5000'

describe('GET /', () => {
    it('should serve default index', () => {
        return chai.request(appUrl)
            .get('/')
            .then(res => {
                console.log(res)
                expect(res).to.have.status(200);
            })
    })
})