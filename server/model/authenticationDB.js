import mongoose from "mongoose";
// import bcrypt from "bcrypt";

// Define the schema for the Task
const authenticationSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

// authenticationSchema.pre("save", async function (next) {
//   if (!this.isModified("password")) return next();
//   const salt = await bcrypt.genSalt(10);
//   this.password = await bcrypt.hash(this.password, salt);
//   next();
// });

const Authentication = mongoose.model("Authentication", authenticationSchema);

export default Authentication;
