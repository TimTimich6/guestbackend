import mongoose, { Schema } from "mongoose";

interface Guest {
  name: string;
  guy: boolean;
  sleepover: boolean;
  createdAt: Date;
  createdBy: string;
  driving: boolean;
  notes: string;
  left: boolean;
}
const GuestSchema = new Schema<Guest>({
  name: { type: String, required: true },
  sleepover: {
    type: Boolean,
    required: true,
  },
  createdAt: {
    type: Date,
    default: () => new Date(),
    imutable: true,
  },
  guy: {
    type: Boolean,
    required: true,
  },
  left: {
    type: Boolean,
    default: false,
  },
  driving: { type: Boolean, required: true },
  createdBy: { type: String, required: true },

  notes: { type: String, required: false, maxLength: [300, "Too much text"] },
});

export default mongoose.model("Guest", GuestSchema);
