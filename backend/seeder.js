require("dotenv").config();
const connectDB = require("./config/db");
const Product = require("./models/Product");
const Blog = require("./models/Blog");
const Category = require("./models/Category");
const User = require("./models/User");
const Order = require("./models/Order");

// Import seed datasets
const productsData = require("./data/products");
const blogsData = require("./data/blogs");
const categoriesData = require("./data/categories");
const usersData = require("./data/users");
const ordersData = require("./data/orders");

connectDB();

const importData = async () => {
  try {
    console.log("Clearing existing collections...");
    await Product.deleteMany();
    await Blog.deleteMany();
    await Category.deleteMany();
    await User.deleteMany();
    await Order.deleteMany();

    console.log("Seeding real datasets to MongoDB...");
    await Product.insertMany(productsData);
    await Blog.insertMany(blogsData);
    await Category.insertMany(categoriesData);
    await User.insertMany(usersData);
    await Order.insertMany(ordersData);

    console.log("✅ All Real Datasets Successfully Seeded to MongoDB!");
    process.exit(0);
  } catch (error) {
    console.error(`❌ Error importing data: ${error.message}`);
    process.exit(1);
  }
};

importData();