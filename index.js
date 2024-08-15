require('dotenv').config(); // Load environment variables from a .env file into process.env

const express = require('express'); // Import Express framework for building web applications
const nodemailer = require('nodemailer'); // Import Nodemailer for sending emails
const fs = require('fs'); // Import File System module to interact with files

const app = express(); // Initialize an Express application
app.use(express.json()); // Middleware to parse JSON request bodies

// Load email configuration from a JSON file
const config = require('./config.json');

const PRIMARY_EMAIL = config.primaryEmail; // Primary email address for sending emails
const PRIMARY_PASSWORD = config.primaryPassword; // Password for the primary email account

const INTERN_EMAIL = config.internEmail; // Backup email address for retrying failed sends
const INTERN_PASSWORD = config.internPassword; // Password for the backup email account

const ADMIN_EMAIL = config.adminEmail; // Email address of the admin to receive notifications

let attemptCount = 0; // Variable to keep track of how many times sending has been attempted

// Read the attempt count from a file when the server starts
fs.readFile('attempt_count.txt', 'utf8', (err, data) => {
  if (err) {
    console.error(`[${new Date().toISOString()}] Error reading attempt count file:`, err.message); // Log error if file reading fails
  } else {
    attemptCount = parseInt(data, 10); // Parse the attempt count from the file
  }
});

// Define a POST route to handle email sending requests
app.post('/send', async (req, res) => {
  const subject = 'Test Email from Node.js'; // Subject of the email
  const text = 'This is a test email sent from Node.js'; // Body of the email

  // Define the mail options for the email
  const mailOptions = {
    from: PRIMARY_EMAIL, // Sender email address
    to: PRIMARY_EMAIL, // Recipient email address (same as sender for testing)
    subject, // Email subject
    text, // Email body text
  };

  // Create a Nodemailer transporter for the primary email account
  let transporter = nodemailer.createTransport({
    service: 'gmail', // Email service provider (Gmail)
    auth: {
      user: PRIMARY_EMAIL, // Email address used for authentication
      pass: PRIMARY_PASSWORD, // Password for the primary email account
    },
  });

  try {
    // Attempt to send the email
    const info = await transporter.sendMail(mailOptions); 
    console.log(`[${new Date().toISOString()}] Email sent: `, info.response); // Log success message and server response
    res.status(200).send('Email sent successfully'); // Send success response to client
    attemptCount = 0; // Reset attempt count after successful send
    fs.writeFileSync('attempt_count.txt', '0'); // Save reset attempt count to file
  } catch (error) {
    // Handle error if email sending fails
    console.error(`[${new Date().toISOString()}] Error: ${error.message}`); // Log error message
    attemptCount++; // Increment attempt count
    fs.writeFileSync('attempt_count.txt', attemptCount.toString()); // Save updated attempt count to file

    if (attemptCount < 4) { // Check if attempts are less than 4
      console.log(`[${new Date().toISOString()}] Attempt ${attemptCount}/3 failed. Retrying...`); // Log retry message
      setTimeout(() => {
        sendEmail(PRIMARY_EMAIL, PRIMARY_PASSWORD, mailOptions, res); // Retry sending the email
      }, 1000); // Retry after 1 second
    } else {
      console.log(`[${new Date().toISOString()}] Switching to backup account...Attempt ${attemptCount}/3`); // Log switch to backup account

      // Create a Nodemailer transporter for the backup email account
      transporter = nodemailer.createTransport({
        service: 'gmail', // Email service provider (Gmail)
        auth: {
          user: INTERN_EMAIL, // Backup email address used for authentication
          pass: INTERN_PASSWORD, // Password for the backup email account
        },
      });

      mailOptions.from = INTERN_EMAIL; // Change sender email to backup email
      mailOptions.to = PRIMARY_EMAIL; // Recipient email remains the same

      try {
        // Attempt to send the email using the backup account
        const info = await transporter.sendMail(mailOptions); 
        console.log(`[${new Date().toISOString()}] Backup Email sent: `, info.response); // Log success message and server response
        res.status(200).send('Email sent successfully'); // Send success response to client

        // Reset attempt count after successful send
        attemptCount = 0; 
        fs.writeFileSync('attempt_count.txt', '0'); // Save reset attempt count to file

        // Define the notification email options to notify the admin
        const notificationMailOptions = {
          from: INTERN_EMAIL, // Sender email address (backup account)
          to: ADMIN_EMAIL, // Recipient email address (admin)
          subject: 'Backup Email Account Used', // Subject of the notification email
          text: `Backup account was used to send an email to Primary account.`, // Body of the notification email
        };

        // Send notification email to the admin
        transporter.sendMail(notificationMailOptions, (err, info) => {
          if (err) {
            console.error(`[${new Date().toISOString()}] Error sending notification email: `, err.message); // Log error if notification email fails
          } else {
            console.log(`[${new Date().toISOString()}] Notification Email sent: `, info.response); // Log success message and server response
          }
        });

        // Log the notification event to a file
        const logMessage = `[${new Date().toISOString()}] Backup email used. Email sent to ${PRIMARY_EMAIL} via ${INTERN_EMAIL}.\n`;
        fs.appendFileSync('notifications.log', logMessage); // Append log message to notifications file
      } catch (error) {
        console.error(`[${new Date().toISOString()}] Backup Email error: `, error.message); // Log error if backup email sending fails
        res.status(500).send('Error sending email'); // Send error response to client
      }
    }
  }
});

// Start the server on port 3000
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`[${new Date().toISOString()}] Server running on port ${PORT}`); // Log server start message
});
