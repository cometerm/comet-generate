import mongoose, { Document, Schema } from "mongoose";

export interface IUser extends Document {
  _id: string;
  name: string;
  email: string;
  image?: string;
  provider: "google" | "credentials";
  googleId?: string;
  password?: string;
  emailVerified?: Date;
  isActive: boolean;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

interface IUserModel extends mongoose.Model<IUser> {
  findOrCreateOAuthUser(profile: any, provider: string): Promise<IUser>;
}

const UserSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      maxlength: [100, "Name cannot exceed 100 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please enter a valid email address",
      ],
    },
    image: {
      type: String,
      default: null,
    },
    provider: {
      type: String,
      enum: ["google", "credentials"],
      required: [true, "Provider is required"],
    },
    googleId: {
      type: String,
      sparse: true,
      unique: true,
    },
    password: {
      type: String,
      minlength: [6, "Password must be at least 6 characters long"],
      select: false,
    },
    emailVerified: {
      type: Date,
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLoginAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: function (doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        delete ret.password;
        return ret;
      },
    },
  },
);

UserSchema.index({ email: 1 });
UserSchema.index({ googleId: 1 });
UserSchema.index({ provider: 1 });
UserSchema.index({ createdAt: -1 });

UserSchema.pre("save", function (next) {
  if (this.isNew) {
    this.lastLoginAt = new Date();
  }
  next();
});

UserSchema.statics.findOrCreateOAuthUser = async function (
  profile: any,
  provider: string,
) {
  const email = profile.email;
  const googleId = profile.sub || profile.id;

  let user = await this.findOne({ email });

  if (user) {
    if (provider === "google" && !user.googleId) {
      user.googleId = googleId;
      user.lastLoginAt = new Date();
      await user.save();
    }
    return user;
  }

  user = await this.create({
    name: profile.name,
    email: profile.email,
    image: profile.picture,
    provider: provider,
    googleId: provider === "google" ? googleId : undefined,
    emailVerified: provider === "google" ? new Date() : null,
    isActive: true,
    lastLoginAt: new Date(),
  });

  return user;
};

export default (mongoose.models.User as unknown as IUserModel) ||
  mongoose.model<IUser, IUserModel>("User", UserSchema);
