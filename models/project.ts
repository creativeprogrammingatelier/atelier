/**
 * Modeling the course object
 * Author: Andrew Heath
 * Date created: 15/08/19
 */
/**
 * Dependecies
 */
import mongoose, {Schema, Document} from 'mongoose';


export interface IProject extends Document {
	name: string,
	course: string,
}
const ProjecSchema = new mongoose.Schema({

	name: {
		type: String,
		required: true
	},
	course: {
		type: Schema.Types.ObjectId,
		required: false,
		ref: 'Course'
	}

});


export default mongoose.model<IProject>('Project', ProjecSchema);