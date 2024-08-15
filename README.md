# Email Notification-Service
build a simple notification service in Node.js/Express.js/Nest.js with email retrying logic. The system must retry the primary email-sending service upon failure and switch to a backup service after three consecutive failed attempts.
Here's a concise and informative README file for your GitHub project:

---
This project implements an email notification service using Node.js with Express and Nodemailer. It is designed to handle sending emails with automatic fallback to a backup email account if the primary account fails. Additionally, it logs and notifies an admin when the backup email account is used.

## Features

- **Primary Email Account**: Sends emails using the primary email account.
- **Retry Logic**: Retries sending emails up to 3 times with the primary account/sender's account before switching to the backup account.
- **Backup Email Account**: Uses a backup email account if the primary account fails after 3 attempts.
- **Notification**: Sends a notification email to an admin when the backup email account is used.
- **Logging**: Records notification events and errors in a log file.

## Setup

1. **Clone the Repository**:

   ```bash
   git clone <repository-url>
   cd <repository-directory>
   ```

2. **Install Dependencies**:

   ```bash
   npm install
   ```

3. **Configure Environment Variables**:

   Create a `config.json` file in the root directory with the following structure:

   ```json
   {
     "primaryEmail": "your_primary_email@gmail.com",
     "primaryPassword": "your_primary_password",
     "internEmail": "your_backup_email@gmail.com",
     "internPassword": "your_backup_password",
     "adminEmail": "admin_email@example.com"
   }
   ```

   Replace the placeholders with your actual email credentials and admin email address.

4. **Run the Application**:

   ```bash
   npm start/node index.js
   ```

   The server will start on port 3000 by default.

## API Endpoint

- **POST /send**: Sends an email to the primary email address. Retries with the primary account up to 3 times and switches to the backup account if necessary. Notifies the admin when the backup account is used.

   **Request Body:**

   ```json
   {
     "subject": "Email Subject",
     "text": "Email body text"
   }
   ```

   **Responses:**

   - `200 OK` if the email is successfully sent.
   - `500 Internal Server Error` if there is an error sending the email.

## Logging

- The console logs provide real-time updates about the email sending process, including success, retry attempts, and notification of backup email usage.
- Logs are also saved in `notifications.log`.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

Feel free to adjust the sections as needed based on your specific project requirements or preferences!
