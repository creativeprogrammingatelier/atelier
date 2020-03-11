import {main} from '../../api/src/database/dbTester'
before((done)=>{
	require('../../api/src/database/makeDB')
	done()
})
it('database tests', ()=>{
	return main()
})
