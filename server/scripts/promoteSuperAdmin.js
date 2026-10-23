require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const promoteSuperAdmin = async () => {
  const email = process.argv[2]?.trim().toLowerCase();
  if (!email) {
    throw new Error('Provide the existing account email to promote.');
  }
  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI must be configured.');
  }

  await mongoose.connect(process.env.MONGODB_URI);

  const user = await User.findOneAndUpdate(
    { email },
    { $set: { role: 'super_admin' } },
    { new: true, runValidators: true },
  );

  if (!user) {
    throw new Error(`No account found for ${email}. Register the account before promoting it.`);
  }

  console.log(`Granted SUPER_ADMIN role to ${user.email}.`);
};

promoteSuperAdmin()
  .catch((error) => {
    console.error(`SUPER_ADMIN promotion failed: ${error.message}`);
    process.exitCode = 1;
  })
  .finally(async () => {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
  });
