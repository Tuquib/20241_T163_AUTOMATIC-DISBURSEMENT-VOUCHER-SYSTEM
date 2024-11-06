import mongoose from "mongoose";
const Schema = mongoose.Schema;

const authenticationSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

const authenticationModel = mongoose.model(
  "authentication",
  authenticationSchema
);
export default authenticationModel;
