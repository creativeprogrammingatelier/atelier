const HH = require("./HelperHelper")

import {Thread, DBThread, convert} from '../../../models/Thread';
import {submissionStatus, checkEnum} from '../../../enums/submissionStatusEnum'
import RolePermissionHelper from './RolePermissionsHelper'
/**
 * submissionID, userID, name, date, state
 * @Author Rens Leendertz
 */
const {pool, extract, one, map}= HH

export default class ThreadHelper {

	static addThread(thread : Thread) {
		return pool.query(`INSERT INTO \"Thread\"`)
	}
}