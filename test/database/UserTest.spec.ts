import {main} from '../../api/src/database/dbTester'
before((done)=>{
	require('../../database/makeDB')
	done()
})
it('database tests', ()=>{
	return main()
})
