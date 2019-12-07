import * as app from '../api/src/app';
import chai from 'chai';
import chaiHttp from 'chai-http';
import 'mocha';

chai.use(chaiHttp);
const expect = chai.expect;

describe('GET /', () => {
    it('should serve default index', () => {
        return chai.request(app)
            .get('/')
            .then(res => {
                expect(res).to.have.status(200);
            })
    })
})