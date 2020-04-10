import {main} from '../../api/src/database/dbTester'


describe("database testing", () => {
    //This makeDB doesn't run squentially with other files, and breaks them consequentially
    // before(async ()=>{
    // 	return makeDB(()=>console.log("done"), console.error)
    // })

    it('database tests', () => {

        return main()
    })
});
