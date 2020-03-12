import {main} from '../../api/src/database/dbTester'
import {makeDB} from '../../api/src/database/makeDB'

before(async ()=>{
	return makeDB(()=>console.log("done"), console.error)
})

it('database tests', ()=>{
	return main()
})
