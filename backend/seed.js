const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import models
const User = require('./models/User');
const Item = require('./models/Item');

// Sample data
const sampleUsers = [
  {
    name: 'John Doe',
    email: 'john@example.com',
    password: 'password123'
  },
  {
    name: 'Jane Smith',
    email: 'jane@example.com',
    password: 'password123'
  },
  {
    name: 'Mike Johnson',
    email: 'mike@example.com',
    password: 'password123'
  }
];

const sampleItems = [
  {
    title: 'Electric Drill',
    description: 'Powerful cordless drill perfect for home projects. Includes various drill bits.',
    category: 'Tools',
    pricePerDay: 5
  },
  {
    title: 'DSLR Camera',
    description: 'Canon EOS camera with 18-55mm lens. Great for photography enthusiasts.',
    category: 'Electronics',
    pricePerDay: 15
  },
  {
    title: 'JavaScript Programming Book',
    description: 'Complete guide to modern JavaScript programming. Excellent condition.',
    category: 'Books',
    pricePerDay: 0
  },
  {
    title: 'Tennis Racket',
    description: 'Professional tennis racket, recently restrung. Perfect for intermediate players.',
    category: 'Sports',
    pricePerDay: 3
  },
  {
    title: 'Stand Mixer',
    description: 'KitchenAid stand mixer with multiple attachments. Perfect for baking.',
    category: 'Kitchen',
    pricePerDay: 8
  },
  {
    title: 'Garden Hose',
    description: '50ft expandable garden hose with spray nozzle. Great for watering plants.',
    category: 'Garden',
    pricePerDay: 2
  },
  {
    title: 'Bluetooth Speaker',
    description: 'Portable waterproof speaker with excellent sound quality.',
    category: 'Electronics',
    pricePerDay: 4
  },
  {
    title: 'Cookbook Collection',
    description: 'Set of 5 popular cookbooks covering various cuisines.',
    category: 'Books',
    pricePerDay: 0
  }
];

async function seedDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/borrownest');
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Item.deleteMany({});
    console.log('Cleared existing data');

    // Create users
    const createdUsers = [];
    for (let userData of sampleUsers) {
      const user = new User(userData);
      await user.save();
      createdUsers.push(user);
      console.log(`Created user: ${user.name}`);
    }

    // Create items (distribute among users)
    for (let i = 0; i < sampleItems.length; i++) {
      const itemData = sampleItems[i];
      const owner = createdUsers[i % createdUsers.length]; // Rotate through users
      
      const item = new Item({
        ...itemData,
        owner: owner._id
      });
      
      await item.save();
      console.log(`Created item: ${item.title} (Owner: ${owner.name})`);
    }

    console.log('\n✅ Database seeded successfully!');
    console.log('\nSample login credentials:');
    console.log('Email: john@example.com | Password: password123');
    console.log('Email: jane@example.com | Password: password123');
    console.log('Email: mike@example.com | Password: password123');

  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    mongoose.connection.close();
  }
}

// Run the seeder
seedDatabase();