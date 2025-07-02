// Test Email Configuration
require('dotenv').config({ path: './config/config.env' });
const nodemailer = require('nodemailer');

const testEmail = async () => {
  console.log('🔍 Testing email configuration...');
  console.log('📧 Email:', process.env.ADMIN1_EMAIL);
  console.log('🔑 App Password:', process.env.APP_PASS ? 'Found' : 'Missing');
  
  if (!process.env.ADMIN1_EMAIL || !process.env.APP_PASS) {
    console.log('❌ Email configuration missing');
    return;
  }

  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: process.env.ADMIN1_EMAIL,
      pass: process.env.APP_PASS,
    },
    tls: {
      rejectUnauthorized: false
    }
  });

  try {
    // Test connection
    await transporter.verify();
    console.log('✅ Email configuration is valid');
    
    // Send test email
    const mailOptions = {
      from: process.env.ADMIN1_EMAIL,
      to: process.env.ADMIN1_EMAIL, // Send to yourself
      subject: 'Test Email from Parking System',
      text: 'This is a test email to verify your email configuration is working.'
    };
    
    await transporter.sendMail(mailOptions);
    console.log('✅ Test email sent successfully!');
    console.log('📬 Check your inbox for the test email');
    
  } catch (error) {
    console.log('❌ Email test failed:', error.message);
    
    if (error.message.includes('Invalid login')) {
      console.log('💡 Tip: Check your Gmail app password');
    } else if (error.message.includes('Username and Password not accepted')) {
      console.log('💡 Tip: Enable 2-factor authentication and use app password');
    }
  }
};

testEmail(); 