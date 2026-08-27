const mongoose = require("mongoose");
const dns = require("dns");

// Set DNS servers to Google & Cloudflare DNS to avoid querySrv ECONNREFUSED issues with ISP DNS
dns.setServers(["8.8.8.8", "8.8.4.4", "1.1.1.1"]);

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.log(`mongoDB Connection error: ${error.message}`);
        process.exit(1);
    }
}

module.exports = connectDB;