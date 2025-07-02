const nodemailer = require('nodemailer')
const sendEmail = async(mailData)=>{
    const {subject,receiverMail} = mailData
    console.log('📧 Sending email to:', receiverMail);
    console.log('📧 From email:', process.env.ADMIN1_EMAIL);
    
    const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false,
        auth: {
          user: process.env.ADMIN1_EMAIL,
          pass: process.env.APP_PASS,
        },
        tls:{
            rejectUnauthorized:false
        }
    });
    
    var mailOptions;
    if(mailData.html){
        mailOptions = {
            from: process.env.ADMIN1_EMAIL,
            to: receiverMail,
            subject: subject,
            html: mailData.html
        }
    }else{
        mailOptions = {
            from: process.env.ADMIN1_EMAIL,
            to: receiverMail,
            subject: subject,
            text: mailData.body
        }
    }
    
    try{
        await transporter.sendMail(mailOptions);
        console.log('✅ Mail sent successfully to:', receiverMail);
    }catch(err){
        console.log('❌ Error sending email:', err.message);
        throw err; // Re-throw to handle in calling function
    }
}
module.exports = sendEmail