import * as postmark from "postmark";
import { utils } from "./registerUtils";

// Email Configuration
export async function sendVerificationEmail(
  email: string,
  firstname: string,
  password: string
) {
  const jwtToken = utils.generateJWTTokenWithEmail(email);
  // Construct reset password link with JWT token
  const resetLink = `${utils.getBaseURL()}/verified?jwt=${jwtToken}`;
  // html content
  const htmlContent = `
    <body style="background-color: #F5F3EB">
      <table style="width: 100%; max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; font-size: 14px; line-height: 1.6;background-color:white">
      <tr>
       <td style="text-align: center;">
         <h2 style="font-size: 18px;color:orangered;margin:5px"><strong>${firstname}</strong></h2>
         <p style="font-size: 16px;margin:5px"><strong>Congratulations !!!</strong></p>
         <p>You have successfully registered on . Welcome to our community!</p>
         <p>Email:${email}</p>
         <p>Password:${password}</p>
         <p>We're excited to have you join us. Here are a few things you can do:</p>
         <p>Please use the following link to verify your account:</p>
         <a href="${resetLink}"style="display: inline-block; padding: 10px 20px; background-color: orangered; color: #ffffff; font-size: 18px; text-decoration: none; border-radius: 5px;">Verify Email</a>
         <ul style="list-style-type: none;">
           <li>Explore our platform and discover new features.</li>
           <li>Connect with other users and start engaging in discussions.</li>
           <li>Customize your profile to make it uniquely yours.</li>
         </ul>

         <p>If you have any questions or need assistance, feel free to contact our support team at .</p>

         <p>Thank you once again for choosing us. We look forward to seeing you around!</p>

         <p>Best regards</p>
         <h3 style="font-size: 18px;color:orangered"> Team</h3>
          </td>
         </tr>
       </table>
    </body>
  `;

  // Sending mail for verify email
  const client = new postmark.ServerClient(process.env.POSTMARK_SERVER_TOKEN!);
  // Send email
  await client.sendEmail({
    From: process.env.POSTMARK_FROM_EMAIL as string,
    To: email,
    Subject: ` Cv Registration Successful ${firstname} `,
    HtmlBody: htmlContent,
  });
}
