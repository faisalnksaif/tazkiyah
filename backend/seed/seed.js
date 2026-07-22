require('dotenv').config();
const bcrypt = require('bcryptjs');
const connectDB = require('../config/db');
const User = require('../models/User');
const Activity = require('../models/Activity');
const ChallengeConfig = require('../models/ChallengeConfig');
const { toDateKey } = require('../utils/dateUtils');

const DEFAULT_ACTIVITIES = [
  { name: 'Dhikr', description: 'Daily remembrance count', type: 'counter', targetValue: 6000, unit: 'count', pointsWeight: 20, order: 1 },
  { name: 'Thawheed', description: 'Study of tawheed', type: 'duration', targetValue: 360, unit: 'minutes', pointsWeight: 30, order: 2 },
  { name: 'Tahajjud', description: 'Night prayer', type: 'checkbox', targetValue: 1, unit: '', pointsWeight: 10, order: 3 },
  {
    name: '5 Daily Prayers',
    description: 'All five mandatory prayers on time',
    type: 'checklist',
    targetValue: 5,
    unit: '',
    pointsWeight: 25,
    order: 4,
    subItems: [{ label: 'Fajr' }, { label: 'Dhuhr' }, { label: 'Asr' }, { label: 'Maghrib' }, { label: 'Isha' }],
  },
  { name: 'Walk', description: 'Daily walking distance', type: 'counter', targetValue: 2, unit: 'km', pointsWeight: 15, order: 5 },
];

async function seed() {
  await connectDB(process.env.MONGO_URI);

  const adminEmail = (process.env.SEED_ADMIN_EMAIL || 'admin@tazkiyah.app').toLowerCase();
  let admin = await User.findOne({ email: adminEmail });
  if (!admin) {
    const passwordHash = await bcrypt.hash(process.env.SEED_ADMIN_PASSWORD || 'ChangeMe123!', 10);
    admin = await User.create({
      name: process.env.SEED_ADMIN_NAME || 'Super Admin',
      email: adminEmail,
      passwordHash,
      role: 'admin',
    });
    console.log(`Created super admin: ${admin.email}`);
  } else {
    console.log(`Super admin already exists: ${admin.email}`);
  }

  for (const activityData of DEFAULT_ACTIVITIES) {
    const existing = await Activity.findOne({ name: activityData.name });
    if (existing) continue;
    await Activity.create({ ...activityData, createdBy: admin._id });
    console.log(`Created activity: ${activityData.name}`);
  }

  const existingConfig = await ChallengeConfig.findOne();
  if (!existingConfig) {
    await ChallengeConfig.create({ startDate: new Date(toDateKey()), durationDays: 21, isActive: true });
    console.log('Created default 21-day challenge config starting today.');
  } else {
    console.log('Challenge config already exists, skipping.');
  }

  console.log('Seed complete.');
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
