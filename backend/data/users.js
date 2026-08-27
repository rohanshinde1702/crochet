const bcrypt = require("bcryptjs");

// Passwords pre-hashed for 'admin123'
const defaultHashedPassword = bcrypt.hashSync("admin123", 10);

module.exports = [
  {
    name: "Admin User",
    email: "admin@cozyloops.com",
    phone: "+91 98200 12345",
    password: defaultHashedPassword,
    avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=AdminMasterArtisan",
    role: "admin",
    isVerified: true
  },
  {
    name: "Aarav Sharma",
    email: "aarav.s@gmail.com",
    phone: "+91 98201 44521",
    password: defaultHashedPassword,
    avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=Aarav",
    role: "user",
    isVerified: true
  },
  {
    name: "Priya Patel",
    email: "priya.p@outlook.com",
    phone: "+91 97654 32109",
    password: defaultHashedPassword,
    avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=Priya",
    role: "user",
    isVerified: true
  },
  {
    name: "Ananya Iyer",
    email: "ananya.iyer@gmail.com",
    phone: "+91 99887 76655",
    password: defaultHashedPassword,
    avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=Ananya",
    role: "user",
    isVerified: true
  },
  {
    name: "Vikram Malhotra",
    email: "vikram.m@yahoo.com",
    phone: "+91 98112 33445",
    password: defaultHashedPassword,
    avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=Vikram",
    role: "user",
    isVerified: true
  },
  {
    name: "Sneha Roy",
    email: "sneha.roy@gmail.com",
    phone: "+91 91234 56789",
    password: defaultHashedPassword,
    avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=Sneha",
    role: "user",
    isVerified: true
  },
  {
    name: "Rohan Patil",
    email: "rohan.p@gmail.com",
    phone: "+91 94567 89012",
    password: defaultHashedPassword,
    avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=RohanP",
    role: "user",
    isVerified: true
  },
  {
    name: "Kavya Menon",
    email: "kavya.m@gmail.com",
    phone: "+91 93456 78901",
    password: defaultHashedPassword,
    avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=Kavya",
    role: "user",
    isVerified: true
  }
];
