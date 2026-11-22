import mongoose from "mongoose";
import FoodEntry from "../models/FoodEntry.js";

const MEAL_TYPES = ["Breakfast", "Lunch", "Dinner", "Snack"];
const NUTRIENT_FIELDS = [
  "calories",
  "protein",
  "carbohydrates",
  "fat",
  "fibre",
  "sugar",
  "saturatedFat"
];
const ENTRY_FIELDS = [
  "foodName",
  "mealType",
  "quantity",
  "unit",
  "nutrients",
  "notes",
  "consumedDate"
];

const isObject = (value) => value !== null && typeof value === "object" && !Array.isArray(value);
const hasOwn = (object, key) => Object.prototype.hasOwnProperty.call(object, key);

const isValidDateOnly = (value) => {
  if (typeof value !== "string") return false;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return false;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (year < 1 || month < 1 || month > 12 || day < 1) return false;

  const leapYear = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
  const daysInMonth = [31, leapYear ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  return day <= daysInMonth[month - 1];
};

const validateFoodEntry = (body, { partial = false } = {}) => {
  const errors = {};
  const value = {};

  if (!isObject(body)) {
    return { value, errors: { body: "A JSON object is required." } };
  }

  for (const field of Object.keys(body)) {
    if (!ENTRY_FIELDS.includes(field)) {
      errors[field] = "This field is not allowed.";
    }
  }

  if (partial && Object.keys(body).length === 0) {
    errors.body = "Provide at least one field to update.";
  }

  if (!partial) {
    for (const field of ["foodName", "mealType", "quantity", "unit", "nutrients", "consumedDate"]) {
      if (!hasOwn(body, field)) errors[field] = "This field is required.";
    }
  }

  if (hasOwn(body, "foodName")) {
    if (typeof body.foodName !== "string" || !body.foodName.trim() || body.foodName.trim().length > 120) {
      errors.foodName = "Food name must be between 1 and 120 characters.";
    } else {
      value.foodName = body.foodName.trim();
    }
  }

  if (hasOwn(body, "mealType")) {
    if (!MEAL_TYPES.includes(body.mealType)) {
      errors.mealType = "Choose Breakfast, Lunch, Dinner, or Snack.";
    } else {
      value.mealType = body.mealType;
    }
  }

  if (hasOwn(body, "quantity")) {
    if (
      typeof body.quantity !== "number" ||
      !Number.isFinite(body.quantity) ||
      body.quantity <= 0 ||
      body.quantity > 100000
    ) {
      errors.quantity = "Quantity must be a positive number no greater than 100000.";
    } else {
      value.quantity = body.quantity;
    }
  }

  if (hasOwn(body, "unit")) {
    if (typeof body.unit !== "string" || !body.unit.trim() || body.unit.trim().length > 24) {
      errors.unit = "Unit must be between 1 and 24 characters.";
    } else {
      value.unit = body.unit.trim();
    }
  }

  if (hasOwn(body, "nutrients")) {
    if (!isObject(body.nutrients)) {
      errors.nutrients = "Nutrients must be an object.";
    } else {
      const nutrientKeys = Object.keys(body.nutrients);
      for (const field of nutrientKeys) {
        if (!NUTRIENT_FIELDS.includes(field)) {
          errors[`nutrients.${field}`] = "This nutrient is not allowed.";
        }
      }

      if (partial && nutrientKeys.length === 0) {
        errors.nutrients = "Provide at least one nutrient to update.";
      }

      value.nutrients = {};
      for (const field of NUTRIENT_FIELDS) {
        if (!partial && !hasOwn(body.nutrients, field)) {
          errors[`nutrients.${field}`] = "This nutrient is required.";
          continue;
        }
        if (!hasOwn(body.nutrients, field)) continue;

        const amount = body.nutrients[field];
        if (typeof amount !== "number" || !Number.isFinite(amount) || amount < 0 || amount > 100000) {
          errors[`nutrients.${field}`] = "Enter a number from 0 to 100000.";
        } else {
          value.nutrients[field] = amount;
        }
      }
    }
  }

  if (hasOwn(body, "notes")) {
    if (typeof body.notes !== "string" || body.notes.trim().length > 500) {
      errors.notes = "Notes must be 500 characters or fewer.";
    } else {
      value.notes = body.notes.trim();
    }
  } else if (!partial) {
    value.notes = "";
  }

  if (hasOwn(body, "consumedDate")) {
    if (!isValidDateOnly(body.consumedDate)) {
      errors.consumedDate = "Date must be a real calendar date in YYYY-MM-DD format.";
    } else {
      value.consumedDate = body.consumedDate;
    }
  }

  return { value, errors };
};

const validationError = (res, errors) => (
  res.status(400).json({
    success: false,
    message: "Food entry data is invalid.",
    errors
  })
);

const notFound = (res) => (
  res.status(404).json({ success: false, message: "Food entry not found." })
);

const serverError = (res, error, action) => {
  console.error(`Unable to ${action} food entry:`, error.name);
  return res.status(500).json({
    success: false,
    message: `Unable to ${action} food entry right now.`
  });
};

export const getFoodEntries = async (req, res) => {
  const { date } = req.query;
  if (!isValidDateOnly(date)) {
    res.status(400).json({
      success: false,
      message: "A valid date query parameter in YYYY-MM-DD format is required."
    });
    return;
  }

  try {
    const entries = await FoodEntry.find({
      userId: req.userId,
      consumedDate: date
    }).sort({ createdAt: 1, _id: 1 });

    res.status(200).json({ success: true, entries });
  } catch (error) {
    serverError(res, error, "load");
  }
};

export const createFoodEntry = async (req, res) => {
  const { value, errors } = validateFoodEntry(req.body);
  if (Object.keys(errors).length > 0) {
    validationError(res, errors);
    return;
  }

  try {
    const entry = await FoodEntry.create({
      ...value,
      userId: req.userId
    });

    res.status(201).json({ success: true, entry });
  } catch (error) {
    if (error instanceof mongoose.Error.ValidationError || error instanceof mongoose.Error.CastError) {
      validationError(res, { body: "Food entry contains an invalid value." });
      return;
    }
    serverError(res, error, "create");
  }
};

export const updateFoodEntry = async (req, res) => {
  if (!mongoose.isObjectIdOrHexString(req.params.id)) {
    notFound(res);
    return;
  }

  const { value, errors } = validateFoodEntry(req.body, { partial: true });
  if (Object.keys(errors).length > 0) {
    validationError(res, errors);
    return;
  }

  const updates = {};
  for (const field of ["foodName", "mealType", "quantity", "unit", "notes", "consumedDate"]) {
    if (hasOwn(value, field)) updates[field] = value[field];
  }
  if (value.nutrients) {
    for (const [field, amount] of Object.entries(value.nutrients)) {
      updates[`nutrients.${field}`] = amount;
    }
  }

  try {
    const entry = await FoodEntry.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!entry) {
      notFound(res);
      return;
    }

    res.status(200).json({ success: true, entry });
  } catch (error) {
    if (error instanceof mongoose.Error.ValidationError || error instanceof mongoose.Error.CastError) {
      validationError(res, { body: "Food entry contains an invalid value." });
      return;
    }
    serverError(res, error, "update");
  }
};

export const deleteFoodEntry = async (req, res) => {
  if (!mongoose.isObjectIdOrHexString(req.params.id)) {
    notFound(res);
    return;
  }

  try {
    const entry = await FoodEntry.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId
    });

    if (!entry) {
      notFound(res);
      return;
    }

    res.status(200).json({ success: true, message: "Food entry deleted." });
  } catch (error) {
    serverError(res, error, "delete");
  }
};
