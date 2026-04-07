import mongoose, { Document, Schema } from 'mongoose';

export type UserRole = 'student' | 'teacher' | 'admin';
export type UserLevel = 'beginner' | 'elementary' | 'pre-intermediate' | 'intermediate' | 'upper-intermediate' | 'advanced';

export interface ICurrentZPD {
  minLevel: number;
  maxLevel: number;
  currentLevel: number;
}

export interface IUser extends Document {
  email: string;
  passwordHash: string;
  name: string;
  role: UserRole;
  level: UserLevel;
  currentZPD: ICurrentZPD;
  targetScenarioIds: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const CurrentZPDSchema = new Schema<ICurrentZPD>(
  {
    minLevel: { type: Number, default: 1 },
    maxLevel: { type: Number, default: 3 },
    currentLevel: { type: Number, default: 2 },
  },
  { _id: false }
);

const UserSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: { type: String, required: true },
    name: { type: String, required: true, trim: true },
    role: {
      type: String,
      enum: ['student', 'teacher', 'admin'],
      default: 'student',
    },
    level: {
      type: String,
      enum: ['beginner', 'elementary', 'pre-intermediate', 'intermediate', 'upper-intermediate', 'advanced'],
      default: 'elementary',
    },
    currentZPD: { type: CurrentZPDSchema, default: () => ({}) },
    targetScenarioIds: [{ type: Schema.Types.ObjectId, ref: 'Scenario' }],
  },
  { timestamps: true }
);

export const User = mongoose.model<IUser>('User', UserSchema);
