import mongoose from "mongoose";

const nutrientSchema = new mongoose.Schema(
  {
    calories: { type: Number, required: true, min: 0, max: 100000 },
    protein: { type: Number, required: true, min: 0, max: 100000 },
    carbohydrates: { type: Number, required: true, min: 0, max: 100000 },
    fat: { type: Number, required: true, min: 0, max: 100000 },
    fibre: { type: Number, required: true, min: 0, max: 100000 },
    sugar: { type: Number, required: true, min: 0, max: 100000 },
    saturatedFat: { type: Number, required: true, min: 0, max: 100000 }
  },
  { _id: false }
);

const foodEntrySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    foodName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120
    },
    mealType: {
      type: String,
      required: true,
      enum: ["Breakfast", "Lunch", "Dinner", "Snack"]
    },
    quantity: {
      type: Number,
      required: true,
      min: 0.000001,
      max: 100000
    },
    unit: {
      type: String,
      required: true,
      trim: true,
      maxlength: 24
    },
    nutrients: {
      type: nutrientSchema,
      required: true
    },
    notes: {
      type: String,
      trim: true,
      maxlength: 500,
      default: ""
    },
    consumedDate: {
      type: String,
      required: true,
      match: /^\d{4}-\d{2}-\d{2}$/
    }
  },
  { timestamps: true }
);

foodEntrySchema.index({ userId: 1, consumedDate: 1 });

const FoodEntry =
  mongoose.models.FoodEntry ||
  mongoose.model("FoodEntry", foodEntrySchema);

export default FoodEntry;
