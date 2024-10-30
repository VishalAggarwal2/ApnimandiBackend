const express = require("express");
const mongoose = require("mongoose");
const { addDataToMongoDB } = require("./SpecialFunction/addDataToMongoDB");
const {transferAndClearSheets}=require("./SpecialFunction/transferAndClear");
const app = express();
const connectDb = require("./connectDb");
const cron = require('node-cron'); // Import node-cron
const cors = require("cors");
const Productroutes = require("./Routes/productRoutes")  // Adjust the path as per your project structure
app.use(cors());
connectDb();

const userRoutes = require("./Routes/userRoutes");
const inventoryRoutes = require('./Routes/inventoryRoutes');
// Middleware to parse URL-encoded data (for form submissions, etc.)
// Schedule the function to run every day at 12:00 AM
cron.schedule('0 0 * * *', async() => {
  console.log('Running scheduled task to update MongoDB from Google Sheets');
 await addDataToMongoDB().catch(error => {
    console.error('Error running scheduled task:', error);
    return;
  });
  await transferAndClearSheet();

});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/user", userRoutes);
app.use('/inventory', inventoryRoutes);
app.use('/product', Productroutes);

// Define a basic route
app.get("/", (req, res) => {
  res.send("MongoDB Connection Successful");
});

// Start the server and listen on port 3000
app.listen(3000, async() => {
  // await transferAndClearSheet();
   console.log("Server is running on port 3000"); 
  //  setTimeout(async()=>{
// await addDataToMongoDB();
// await transferAndClearSheets();
  //  },4000)
});
