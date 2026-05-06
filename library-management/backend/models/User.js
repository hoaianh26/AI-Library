import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { TIERS, DEFAULT_TIER } from "../../shared/tiers.js";

const membershipHistorySchema = new mongoose.Schema(
  {
    tier: {
      type: String,
      enum: TIERS,
      required: true,
    },
    start: { type: Date, required: true },
    end: { type: Date, required: true },
    paymentId: { type: String },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },

    // New roles
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },

    // Membership
    membershipTier: {
      type: String,
      enum: TIERS,           // ['bronze','silver','gold']
      default: DEFAULT_TIER, // 'bronze'
    },
    membershipExpiresAt: { type: Date, default: null },
    isMembershipActive: { type: Boolean, default: true },
    membershipHistory: [membershipHistorySchema],

    // User details
    gender: { type: String },
    address: { type: String },
    phoneNumber: { type: String },
    dateOfBirth: { type: Date },
    libraryId: { type: String, unique: true, sparse: true },
    avatar: { type: String },

    // Preferences
    favoriteCategories: [{ type: String }],
    favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: "Book" }],

    viewHistory: [
      {
        bookId: { type: mongoose.Schema.Types.ObjectId, ref: "Book" },
        viewedAt: { type: Date, default: Date.now },
      },
    ],
    //field valid email 
    isEmailVerified: {
    type: Boolean,
    default: false,
    },
    emailVerificationToken: {
  type: String,
    },
    emailVerificationExpires: {
    type: Date,
    },
  },
  { timestamps: true }
);

// Hash password
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model("User", userSchema);
export default User;
