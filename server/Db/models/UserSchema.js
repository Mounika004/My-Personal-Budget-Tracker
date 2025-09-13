const mongoose = require("mongoose");

const CategorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    color: { type: String, default: "#7c5cff" },
  },
  { _id: false }
);

const UserSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true, trim: true },
    email: { type: String, required: true, unique: true, trim: true },
    password: { type: String, required: true },
    friends: { type: [String], default: [] },
    expensis: { type: Array, default: [] }, // legacy key, we keep using it
    categories: {
      type: [CategorySchema],
      default: [
        { name: "Food & Dining", color: "#7c5cff" },
        { name: "Transport", color: "#4dc8ff" },
        { name: "Shopping", color: "#ffa447" },
        { name: "Rent & Utilities", color: "#27d980" },
        { name: "Entertainment", color: "#ff5c7c" },
        { name: "Health", color: "#b86bff" },
        { name: "Other", color: "#a7b0c3" },
      ],
    },
  },
  { timestamps: true }
);

UserSchema.virtual("expenses")
  .get(function () {
    return this.expensis;
  })
  .set(function (v) {
    this.expensis = v;
  });

module.exports = mongoose.models.User || mongoose.model("User", UserSchema);
