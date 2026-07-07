import { Resend } from 'resend';

// Provide a mock instance if key is missing during build/dev
const resendApiKey = process.env.RESEND_API_KEY || 're_mock_key';
export const resend = new Resend(resendApiKey);

export async function sendWelcomeEmail(email: string, firstName: string) {
  try {
    const data = await resend.emails.send({
      from: 'CenterKick <onboarding@centerkick.com>',
      to: [email],
      subject: 'Welcome to CenterKick!',
      html: `
        <div style="font-family: sans-serif; padding: 20px; color: #171717;">
            <h1 style="color: #B91C1C;">Welcome, ${firstName}!</h1>
            <p>Thank you for joining CenterKick, the premium sports profile management platform.</p>
            <p>Your profile is currently pending review. You'll be notified as soon as it's approved.</p>
            <br/>
            <p>Best,<br/>The CenterKick Team</p>
        </div>
      `,
    });
    return data;
  } catch (error) {
    console.error('Failed to send email:', error);
    throw error;
  }
}

export async function sendAdminInvitationEmail(email: string, role: string, invitationLink: string) {
  try {
    const data = await resend.emails.send({
      from: 'CenterKick Admin <admin@centerkick.com>',
      to: [email],
      subject: 'Invitation to Join CenterKick Admin Dashboard',
      html: `
        <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; padding: 40px; color: #1f2937; background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 16px;">
            <div style="text-align: center; margin-bottom: 32px;">
                <div style="display: inline-block; padding: 12px; border-radius: 12px; background-color: #b50a0a; margin-bottom: 16px;">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                </div>
                <h1 style="font-size: 24px; font-weight: 800; color: #111827; margin: 0; text-transform: ; letter-spacing: -0.025em;">CenterKick Admin</h1>
                <p style="font-size: 14px; font-weight: 600; color: #b50a0a; margin-top: 4px; text-transform: ; letter-spacing: 0.1em;">Secure Invitation</p>
            </div>
            
            <div style="margin-bottom: 32px;">
                <p style="font-size: 16px; line-height: 24px; color: #4b5563; margin-bottom: 24px;">
                    Hello, <br/><br/>
                    You have been invited to join the CenterKick administrative team as a <strong>${role.toUpperCase()}</strong>.
                </p>
                
                <div style="background-color: #f9fafb; border: 1px solid #f3f4f6; border-radius: 12px; padding: 20px; margin-bottom: 24px; text-align: center;">
                    <p style="font-size: 13px; font-weight: 700; color: #6b7280; text-transform: ; letter-spacing: 0.05em; margin-bottom: 8px;">Your Role</p>
                    <p style="font-size: 18px; font-weight: 800; color: #111827; margin: 0;">${role.toUpperCase()}</p>
                </div>
                
                <div style="text-align: center;">
                    <a href="${invitationLink}" style="display: inline-block; padding: 16px 32px; background-color: #b50a0a; color: #ffffff; text-decoration: none; border-radius: 12px; font-weight: 800; font-size: 14px; text-transform: ; letter-spacing: 0.05em; transition: all 0.2s ease;">
                        Complete Your Signup
                    </a>
                </div>
            </div>
            
            <div style="border-top: 1px solid #f3f4f6; padding-top: 24px; text-align: center;">
                <p style="font-size: 12px; color: #9ca3af; margin-bottom: 8px;">
                    If the button above doesn't work, copy and paste this link into your browser:
                </p>
                <p style="font-size: 12px; color: #6b7280; word-break: break-all; margin-bottom: 24px;">
                    ${invitationLink}
                </p>
                <p style="font-size: 11px; color: #9ca3af; text-transform: ; font-weight: 700;">
                    &copy; 2026 CenterKick. All rights reserved.
                </p>
            </div>
        </div>
      `,
    });
    return data;
  } catch (error) {
    console.error('Failed to send admin invitation email:', error);
    throw error;
  }
}
export async function sendPasswordResetEmail(email: string, resetLink: string) {
  try {
    const data = await resend.emails.send({
      from: 'CenterKick Security <security@centerkick.com>',
      to: [email],
      subject: 'Reset Your CenterKick Password',
      html: `
        <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; padding: 40px; color: #1f2937; background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 16px;">
            <div style="text-align: center; margin-bottom: 32px;">
                <div style="display: inline-block; padding: 12px; border-radius: 12px; background-color: #a20000; margin-bottom: 16px;">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                </div>
                <h1 style="font-size: 24px; font-weight: 800; color: #111827; margin: 0; text-transform: ; letter-spacing: -0.025em;">CenterKick</h1>
                <p style="font-size: 14px; font-weight: 600; color: #a20000; margin-top: 4px; text-transform: ; letter-spacing: 0.1em;">Security Center</p>
            </div>
            
            <div style="margin-bottom: 32px;">
                <p style="font-size: 16px; line-height: 24px; color: #4b5563; margin-bottom: 24px;">
                    Hello, <br/><br/>
                    We received a request to reset the password for your CenterKick account. If you didn't make this request, you can safely ignore this email.
                </p>
                
                <div style="text-align: center; margin-bottom: 32px;">
                    <a href="${resetLink}" style="display: inline-block; padding: 18px 36px; background-color: #a20000; color: #ffffff; text-decoration: none; border-radius: 12px; font-weight: 800; font-size: 14px; text-transform: ; letter-spacing: 0.05em; transition: all 0.2s ease; box-shadow: 0 10px 15px -3px rgba(162, 0, 0, 0.3);">
                        Reset My Password
                    </a>
                </div>

                <p style="font-size: 14px; line-height: 20px; color: #6b7280; text-align: center;">
                    This link will expire in 60 minutes and can only be used once.
                </p>
            </div>
            
            <div style="border-top: 1px solid #f3f4f6; padding-top: 24px; text-align: center;">
                <p style="font-size: 12px; color: #9ca3af; margin-bottom: 8px;">
                    If the button above doesn't work, copy and paste this link into your browser:
                </p>
                <p style="font-size: 12px; color: #6b7280; word-break: break-all; margin-bottom: 24px;">
                    ${resetLink}
                </p>
                <p style="font-size: 11px; color: #9ca3af; text-transform: ; font-weight: 700;">
                    &copy; 2026 CenterKick. All rights reserved.
                </p>
            </div>
        </div>
      `,
    });
    return data;
  } catch (error) {
    console.error('Failed to send password reset email:', error);
    throw error;
  }
}

export async function sendOtpEmail(email: string, otp: string) {
  try {
    const data = await resend.emails.send({
      from: 'CenterKick Security <security@centerkick.com>',
      to: [email],
      subject: 'Verify Your CenterKick Account',
      html: `
        <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; padding: 40px; color: #1f2937; background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 16px;">
            <div style="text-align: center; margin-bottom: 32px;">
                <div style="display: inline-block; padding: 12px; border-radius: 12px; background-color: #a20000; margin-bottom: 16px;">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                </div>
                <h1 style="font-size: 24px; font-weight: 800; color: #111827; margin: 0; text-transform: ; letter-spacing: -0.025em;">CenterKick</h1>
                <p style="font-size: 14px; font-weight: 600; color: #a20000; margin-top: 4px; text-transform: ; letter-spacing: 0.1em;">Security Center</p>
            </div>
            
            <div style="margin-bottom: 32px; text-align: center;">
                <p style="font-size: 16px; line-height: 24px; color: #4b5563; text-align: left; margin-bottom: 24px;">
                    Hello, <br/><br/>
                    Thank you for signing up for CenterKick. Please use the verification code below to complete your registration:
                </p>
                
                <div style="background-color: #f9fafb; border: 1px solid #f3f4f6; border-radius: 16px; padding: 24px; margin-bottom: 24px; display: inline-block; letter-spacing: 0.25em; font-size: 32px; font-weight: 900; color: #111827;">
                    ${otp}
                </div>

                <p style="font-size: 14px; line-height: 20px; color: #6b7280; text-align: center;">
                    This code will expire in 10 minutes.
                </p>
            </div>
            
            <div style="border-top: 1px solid #f3f4f6; padding-top: 24px; text-align: center;">
                <p style="font-size: 12px; color: #9ca3af; margin-bottom: 8px;">
                    If you did not request this code, you can safely ignore this email.
                </p>
                <p style="font-size: 11px; color: #9ca3af; text-transform: ; font-weight: 700;">
                    &copy; 2026 CenterKick. All rights reserved.
                </p>
            </div>
        </div>
      `,
    });
    return data;
  } catch (error) {
    console.error('Failed to send OTP email:', error);
    throw error;
  }
}

