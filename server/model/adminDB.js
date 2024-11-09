import mongoose from "mongoose";
const Schema = mongoose.Schema;

const adminSchema = new Schema({
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
});

const studentModel = mongoose.model("staff", studentSchema);
export default studentModel;
