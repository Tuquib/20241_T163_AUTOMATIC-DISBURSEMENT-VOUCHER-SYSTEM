
import mongoose from 'mongoose'
const Schema = mongoose.Schema;

const studentSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    position: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    contact_num: {
        type: Int,
    }
});

const studentModel = mongoose.model('admin', studentSchema);
export default studentModel;
