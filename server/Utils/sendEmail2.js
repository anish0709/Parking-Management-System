const nodemailer = require('nodemailer');

//send email using nodemailer
const sendEmail2 = async (mailData) => {
    const { subject, receiverMail, html } = mailData;
    console.log(receiverMail);

    // Create a transporter using Gmail settings
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.ADMIN1_EMAIL, // Your email address
            pass: process.env.APP_PASS      // Your app password
        }
    });

    // Email options
    const mailOptions = {
        from: process.env.ADMIN1_EMAIL,
        to: receiverMail,
        subject: subject,
        html: html
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log(`Mail sent: ${info.messageId}`);
    } catch (err) {
        console.log("Error occurred while sending email:", err);
    }
};

module.exports = sendEmail2;