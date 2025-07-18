const express = require('express')
//for razorpay api
const razorpay = require('razorpay')
const dotenv = require('dotenv')
const connectDB = require('./db')
const webpush = require('web-push')
const { sendNotifs } = require('./Utils/sendNotifs')


dotenv.config({path:'./config/config.env'})

const app = express()

//connect to mongodb database
connectDB()

//set web push notification configuration
//webpush.setVapidDetails(process.env.WEB_PUSH_CONTACT,process.env.PUBLIC_VAPID_KEY,process.env.PRIVATE_VAPID_KEY)
//const webpush = require('web-push');

const vapidKeys = {
  publicKey: 'BL1I2vVRS257XJ9Dm5WXyItiesF5Hu0e1ZYyhW8QGj1WpEWfYVv2LbKS5bEHuwlh61HQw-5tWlOCE6s4i7thLfI',
  privateKey: 'qPkiFL_wa7ScqLrPtPekBA-G_8coJN3POtV5MrxeMO4',
};

const subject = 'mailto:anishudr1@gmail.com';

webpush.setVapidDetails(subject, vapidKeys.publicKey, vapidKeys.privateKey);


app.get('/',(req,res)=>{
    res.send("Smart parking API running")
})

//to accept json data
app.use(express.json({ limit: "80mb", extended: true }))
app.use(express.urlencoded({limit:"80mb",extended:true}))

// app.use(helmet());
// app.use(helmet.crossOriginResourcePolicy({policy:"cross-origin"}));
// app.use(cors())

//function to send recurring push notification before parking slot booking time
sendNotifs()

//for cross origin request - Improved CORS configuration
app.use((req, res, next) => {
    // Allow requests from frontend
    const allowedOrigins = [
        'http://localhost:3000',
        'http://localhost:3001', 
        'https://parking-management-system-1-zbo8.onrender.com',
        process.env.REACT_APP_URL
    ].filter(Boolean);
    
    const origin = req.headers.origin;
    if (allowedOrigins.includes(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
    }
    
    res.setHeader('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,PATCH,OPTIONS');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'authorization,Content-Type,origin, x-requested-with'
    );
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Max-Age', '86400');
    
    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    next();
});

//routes
app.use('/api/v1/users',require('./routes/users'))
app.use('/api/v1/parkingLots',require('./routes/parkingLots'))
app.use('/api/v1/admin',require('./routes/admin'))
app.use('/api/v1/payments',require('./routes/payments'))
app.use('/api/v1/news',require('./routes/news'))
app.use('/api/v1/parking-registration',require('./routes/parkingLotRegistration'))



const PORT = process.env.PORT

app.listen(PORT,()=>console.log(`Server Running ${PORT}`))
