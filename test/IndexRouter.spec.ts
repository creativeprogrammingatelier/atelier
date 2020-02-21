import { app } from '../api/src/app';
import chai, { expect } from 'chai';
import chaiHttp from 'chai-http';
import 'mocha';

chai.use(chaiHttp);

describe('GET /', () => {
	it('should serve default index', async () => {
		const res = await chai.request(app).get('/');
        expect(res).to.have.status(200);
	});
});