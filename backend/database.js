const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer = null;

const connectDatabase = async () => {
  try {
    // Try local MongoDB first
    if (process.env.MONGODB_URI && process.env.MONGODB_URI.includes('localhost')) {
      try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to local MongoDB');
        return;
      } catch (error) {
        console.log('Local MongoDB not available, starting in-memory database...');
      }
    }

    // Use in-memory MongoDB
    mongoServer = await MongoMemoryServer.create({
      instance: {
        port: 27017,
        dbName: 'borrownest'
      }
    });
    
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);
    
    console.log('Connected to in-memory MongoDB');
    
    // Load sample data
    await loadSampleData();
    
  } catch (error) {
    console.error('Database connection failed:', error.message);
    process.exit(1);
  }
};

const loadSampleData = async () => {
  try {
    const User = require('./models/User');
    const Item = require('./models/Item');
    
    const userCount = await User.countDocuments();
    if (userCount > 0) {
      console.log('Sample data already exists');
      return;
    }
    
    console.log('Loading sample data...');
    
    // Create sample users
    const users = [
      { name: 'John Smith', email: 'john@example.com', password: 'password123' },
      { name: 'Jane Wilson', email: 'jane@example.com', password: 'password123' },
      { name: 'Mike Johnson', email: 'mike@example.com', password: 'password123' }
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
        description: 'Powerful cordless drill with various bits included',
        category: 'Tools',
        pricePerDay: 5,
        owner: createdUsers[0]._id
      },
      {
        title: 'Digital Camera',
        description: 'DSLR camera with 18-55mm lens for photography',
        category: 'Electronics',
        pricePerDay: 15,
        owner: createdUsers[1]._id
      },
      {
        title: 'Programming Books',
        description: 'Collection of JavaScript and React programming books',
        category: 'Books',
        pricePerDay: 0,
        owner: createdUsers[2]._id
      },
      {
        title: 'Tennis Racket',
        description: 'Professional tennis racket in excellent condition',
        category: 'Sports',
        pricePerDay: 3,
        owner: createdUsers[0]._id
      },
      {
        title: 'Kitchen Mixer',
        description: 'Stand mixer perfect for baking and cooking',
        category: 'Kitchen',
        pricePerDay: 8,
        owner: createdUsers[1]._id
      },
      {
        title: 'Garden Tools',
        description: 'Set of basic gardening tools including shovel and rake',
        category: 'Garden',
        pricePerDay: 2,
        owner: createdUsers[2]._id
      }
    ];
    
    for (let itemData of items) {
      const item = new Item(itemData);
      await item.save();
    }
    
    console.log('Sample data loaded successfully');
    console.log('Login credentials:');
    console.log('Email: john@example.com | Password: password123');
    console.log('Email: jane@example.com | Password: password123');
    console.log('Email: mike@example.com | Password: password123');
    
  } catch (error) {
    console.error('Error loading sample data:', error.message);
  }
};

const disconnectDatabase = async () => {
  try {
    await mongoose.connection.close();
    if (mongoServer) {
      await mongoServer.stop();
    }
    console.log('Database disconnected');
  } catch (error) {
    console.error('Error disconnecting database:', error);
  }
};

module.exports = { connectDatabase, disconnectDatabase };