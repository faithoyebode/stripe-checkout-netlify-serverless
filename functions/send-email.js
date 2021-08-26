const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');
const messageBody = fs.readFileSync(path.resolve(__dirname, '../public/email.html'), 'utf8')

exports.handler = async (event) => {
    const { session_id } = JSON.parse(event.body);
    const session = await stripe.checkout.sessions.retrieve(session_id);
    const customer = await stripe.customers.retrieve(session.customer);

    // const messageBody = async () => {
    //     const html = `
    //         <DOCTYPE html>
    //         <html>
    //             <head><title>Greetings</title></head>
    //             <body>
    //                 <p>Your test transaction went through! Technology is neat</p>    
    //             </body>
    //         </html>
    //     `;

    //     return html;
    // }

    const sendEmail = async (options) => {
        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASSWORD,
            }
        });

        const message = {
            from: `${process.env.SENDER_NAME} <${process.env.SENDER_EMAIL}>`,
            to: options.email,
            subject: options.subject,
            html: options.message
        };

        await transporter.sendMail(message);
    }

    try {
        const result = await sendEmail({
            email: customer.email,
            subject: "Purchase successful!",
            message: messageBody,
        });

        return {
            statusCode: 200,
            body: JSON.stringify({
                customer: customer
            }),
        };

    } catch (error) {
        console.log(error);
    }
    
};