const HH = require("./HelperHelper")

import {Submission, DBSubmission, convert} from '../../../models/Submission';
import {submissionStatus, checkEnum} from '../../../enums/submissionStatusEnum'
import RolePermissionHelper from './RolePermissionsHelper'
/**
 * submissionID, userID, name, date, state
 * @Author Rens Leendertz
 */
const {pool, extract, one, map}= HH

export default class ThreadHelper {
}