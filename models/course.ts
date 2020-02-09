/**
 * Modeling the course object
 * Author: Andrew Heath
 * Date created: 15/08/19
 */
/**
 * Dependecies
 */
import mongoose, {Schema, Document} from 'mongoose';


export interface ICourse extends Document {
	name: string,
	students: string[],
	coordinator: string

}
const CourseSchema = new mongoose.Schema({

	name: {
		type: String,
		required: true
	},
	coordinator: {
		type: Schema.Types.ObjectId,
		ref: 'User'
	},
	students: {
		type: [Schema.Types.ObjectId],
		required: false,
		ref: 'User'
	}

});


export default mongoose.model<ICourse>('Course', CourseSchema);