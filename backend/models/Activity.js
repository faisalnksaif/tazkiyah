const mongoose = require('mongoose');

const subItemSchema = new mongoose.Schema(
  { label: { type: String, required: true } },
  { _id: false }
);

const ACTIVITY_TYPES = ['counter', 'duration', 'checkbox', 'checklist'];
const SCORING_MODELS = ['proportional', 'fixed'];

const activitySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    type: { type: String, enum: ACTIVITY_TYPES, required: true },
    // Meaningful for counter/duration: the daily target (e.g. 6000 dhikr, 360 minutes).
    // Meaningful for checklist: defaults to subItems.length if not provided.
    targetValue: { type: Number, default: 1 },
    unit: { type: String, default: '' }, // e.g. "count", "minutes", "km"
    pointsWeight: { type: Number, required: true, default: 10 },
    scoringModel: { type: String, enum: SCORING_MODELS, default: 'proportional' },
    subItems: { type: [subItemSchema], default: undefined }, // only for checklist type
    isActive: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

activitySchema.statics.TYPES = ACTIVITY_TYPES;
activitySchema.statics.SCORING_MODELS = SCORING_MODELS;

module.exports = mongoose.model('Activity', activitySchema);
