const mongoose = require('mongoose');
const dotenv = require('dotenv'); // Dotenv for managing environment variables
const Admin = require('./models/admin.Schema');

// Loading environment variables from .env file
dotenv.config();

// Connect to the MongoDB database
mongoose.connect(process.env.MONGODB_URL);

// Sample data for seeding admins
const adminsData = [
  {
    firstName: 'Admin1',
    lastName: 'User',
    email: 'admin1@example.com',
    password: 'adminpassword1',
    role: 'admin',
  },
  {
    firstName: 'Admin2',
    lastName: 'User',
    email: 'admin2@example.com',
    password: 'adminpassword2',
    role: 'admin',
  },
  {
    firstName: 'Admin3',
    lastName: 'User',
    email: 'admin3@example.com',
    password: 'adminpassword3',
    role: 'admin',
  },
  {
    firstName: 'Admin4',
    lastName: 'User',
    email: 'admin4@example.com',
    password: 'adminpassword4',
    role: 'admin',
  },
  {
    firstName: 'Admin5',
    lastName: 'User',
    email: 'admin5@example.com',
    password: 'adminpassword5',
    role: 'admin',
  },
];

// Function to seed admins into the database
const seedAdmins = async () => {
  try {
    // Clear existing admin data
    // await Admin.deleteMany();

    // Seed new admin data
    for (const adminData of adminsData) {
      const newAdmin = new Admin(adminData);
      await newAdmin.save();
    }

    console.log('Admins seeded successfully');
  } catch (error) {
    console.error('Error seeding admins:', error.message);
  } finally {
    // Close the database connection
    mongoose.connection.close();
  }
};

// Call the seedAdmins function to start seeding
seedAdmins();
