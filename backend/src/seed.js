import 'dotenv/config';
import mongoose from 'mongoose';
import User from './models/user.model.js';
import Category from './models/category.model.js';

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB for seeding...');

    // Clear existing data
    await User.deleteMany({});
    await Category.deleteMany({});
    console.log('Cleared existing users and categories.');

    // Create Admin
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@resolvehub.com',
      password: 'admin123',
      role: 'ADMIN',
    });
    console.log('Created Admin:', admin.email);

    // Create Agents
    const agent1 = await User.create({
      name: 'Amit Kumar',
      email: 'amit@resolvehub.com',
      password: 'agent123',
      role: 'AGENT',
    });
    console.log('Created Agent:', agent1.email);

    const agent2 = await User.create({
      name: 'Priya Sharma',
      email: 'priya@resolvehub.com',
      password: 'agent123',
      role: 'AGENT',
    });
    console.log('Created Agent:', agent2.email);

    // Create Customers
    const customer1 = await User.create({
      name: 'Rahul Verma',
      email: 'rahul@example.com',
      password: 'customer123',
      role: 'CUSTOMER',
    });
    console.log('Created Customer:', customer1.email);

    const customer2 = await User.create({
      name: 'Sneha Patel',
      email: 'sneha@example.com',
      password: 'customer123',
      role: 'CUSTOMER',
    });
    console.log('Created Customer:', customer2.email);

    // Create Categories
    const categories = [
      { name: 'Payment', description: 'Payment related issues' },
      { name: 'Product', description: 'Product quality or defect issues' },
      { name: 'Service', description: 'Service related complaints' },
      { name: 'Delivery', description: 'Delivery and shipping issues' },
      { name: 'Technical', description: 'Technical problems and bugs' },
      { name: 'Account', description: 'Account and profile issues' },
      { name: 'Other', description: 'Other complaints' },
    ];

    await Category.insertMany(categories);
    console.log('Created categories:', categories.map(c => c.name).join(', '));

    console.log('\n--- Seed Data Summary ---');
    console.log('Admin:    admin@resolvehub.com / admin123');
    console.log('Agent 1:  amit@resolvehub.com / agent123');
    console.log('Agent 2:  priya@resolvehub.com / agent123');
    console.log('Customer: rahul@example.com / customer123');
    console.log('Customer: sneha@example.com / customer123');
    console.log('Categories: Payment, Product, Service, Delivery, Technical, Account, Other');
    console.log('-------------------------\n');

    console.log('Seeding complete!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error.message);
    process.exit(1);
  }
};

seedData();
