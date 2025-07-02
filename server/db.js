const mongoose = require('mongoose')

const connectDB = async() => {
  try {
    // Fix the deprecation warning
    mongoose.set('strictQuery', false);
    
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    })
    console.log(`MongoDB connected ${conn.connection.host}`)
  } catch(err) {
    console.log(`Error occurred: ${err.message}`)
    process.exit(1)
  } 
}

module.exports = connectDB