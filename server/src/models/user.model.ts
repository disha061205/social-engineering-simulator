import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  role: { type: String, default: "user" },
  status: { type: String, default: "active" },
  lastLoginAt: Date
}, { timestamps: true });

userSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform: (_doc, ret: any) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.password;
    return ret;
  }
});

export default mongoose.model("User", userSchema);
