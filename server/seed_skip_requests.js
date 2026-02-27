require("dotenv").config();
const mongoose = require("mongoose");

const connectDB = require("./config/db");
const User = require("./models/User");
const SkipRequest = require("./models/SkipRequest");

const seedSkipRequests = async () => {
  try {
    await connectDB();

    console.log("🔍 Fetching existing users...");
    const users = await User.find().limit(5);
    
    if (users.length === 0) {
      console.log("❌ No users found! Please run seed.js first to create demo users.");
      process.exit(1);
    }

    console.log(`Found ${users.length} users. Creating skip requests...`);

    // Clear existing skip requests
    await SkipRequest.deleteMany();
    console.log("Cleared existing skip requests");

    // Create test skip requests for different meals
    const mealTypes = ["Breakfast", "Lunch", "Snacks", "Dinner"];
    
    for (let i = 0; i < users.length; i++) {
      const user = users[i];
      // Create 1-2 skip requests per user for different meals
      const mealsToSkip = mealTypes.slice(0, Math.min(i + 1, mealTypes.length));
      
      for (const mealType of mealsToSkip) {
        const skipRequest = new SkipRequest({
          studentId: user._id,
          mealType,
          status: "Pending",
          date: new Date()
        });
        await skipRequest.save();
        console.log(`✓ Created skip request for ${user.name} - ${mealType}`);
      }
    }

    const totalRequests = await SkipRequest.countDocuments();
    console.log(`\n✅ Successfully created ${totalRequests} test skip requests!`);
    process.exit();
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  }
};

seedSkipRequests();
