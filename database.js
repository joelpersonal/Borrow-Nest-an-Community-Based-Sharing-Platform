const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongod = null;

const connectDB = async () => {
  try {
    // Try to connect to local MongoDB first
    if (process.env.MONGODB_URI && process.env.MONGODB_URI.includes('mongodb://localhost')) {
      try {
        await mongoose.connect(process.env.MONGODB_URI, {
          useNewUrlParser: true,
          useUnifiedTopology: true,
        });
        console.log('✅ Connected to local MongoDB');
        return;
      } catch (localError) {
        console.log('❌ Local MongoDB not available, starting in-memory database...');
      }
    }

    // If local MongoDB fails or not configured, use in-memory MongoDB
    mongod = await MongoMemoryServer.create({
      instance: {
        port: 27017, // Use default MongoDB port
        dbName: 'borrownest'
      }
    });
    
    const uri = mongod.getUri();
    console.log('🚀 Starting in-memory MongoDB at:', uri);
    
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('✅ Connected to in-memory MongoDB database');
    
    // Seed initial data
    await seedInitialData();
    
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    process.exit(1);
  }
};

const seedInitialData = async () => {
  try {
    const User = require('./models/User');
    const Item = require('./models/Item');
    
    // Check if data already exists
    const userCount = await User.countDocuments();
    if (userCount > 0) {
      console.log('📊 Database already has data, skipping seed');
      return;
    }
    
    console.log('🌱 Seeding initial data...');
    
    // Create sample users
    const users = [
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
    
    const createdUsers = [];
    for (let userData of users) {
      const user = new User(userData);
      await user.save();
      createdUsers.push(user);
    }
    
    // Create sample items
    const items = [
      {
        title: 'Electric Drill',
        description: 'Powerful cordless drill perfect for home projects. Includes various drill bits.',
        category: 'Tools',
        pricePerDay: 5,
        owner: createdUsers[0]._id
      },
      {
        title: 'DSLR Camera',
        description: 'Canon EOS camera with 18-55mm lens. Great for photography enthusiasts.',
        category: 'Electronics',
        pricePerDay: 15,
        owner: createdUsers[1]._id
      },
      {
        title: 'JavaScript Programming Book',
        description: 'Complete guide to modern JavaScript programming. Excellent condition.',
        category: 'Books',
        pricePerDay: 0,
        owner: createdUsers[2]._id
      },
      {
        title: 'Tennis Racket',
        description: 'Professional tennis racket, recently restrung. Perfect for intermediate players.',
        category: 'Sports',
        pricePerDay: 3,
        owner: createdUsers[0]._id
      },
      {
        title: 'Stand Mixer',
        description: 'KitchenAid stand mixer with multiple attachments. Perfect for baking.',
        category: 'Kitchen',
        pricePerDay: 8,
        owner: createdUsers[1]._id
      },
      {
        title: 'Garden Hose',
        description: '50ft expandable garden hose with spray nozzle. Great for watering plants.',
        category: 'Garden',
        pricePerDay: 2,
        owner: createdUsers[2]._id
      }
    ];
    
    for (let itemData of items) {
      const item = new Item(itemData);
      await item.save();
    }
    
    console.log('✅ Sample data seeded successfully!');
    console.log('👤 Sample login credentials:');
    console.log('   Email: john@example.com | Password: password123');
    console.log('   Email: jane@example.com | Password: password123');
    console.log('   Email: mike@example.com | Password: password123');
    
  } catch (error) {
    console.error('❌ Error seeding data:', error.message);
  }
};

const disconnectDB = async () => {
  try {
    await mongoose.connection.close();
    if (mongod) {
      await mongod.stop();
    }
    console.log('🔌 Database disconnected');
  } catch (error) {
    console.error('Error disconnecting database:', error);
  }
};

module.exports = { connectDB, disconnectDB };