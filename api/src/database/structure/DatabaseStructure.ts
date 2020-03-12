import {end} from "../HelperDB";
import {makeDB} from "../makeDB";

if (require.main === module){
	makeDB(console.log, console.error).then(end)
} else {
	// makeDB(()=>{console.log("made the database")}, console.error)
}