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

export async function sendGiftVoucherEmail(params: {
  recipientEmail: string;
  buyerName: string;
  code: string;
  targetTier: string;
  durationMonths: number;
  giftMessage?: string;
}) {
  try {
    const claimLink = `${process.env.NEXT_PUBLIC_APP_URL || 'https://centerkick.com'}/register?code=${params.code}`;
    const data = await resend.emails.send({
      from: 'CenterKick Gifts <gifts@centerkick.com>',
      to: [params.recipientEmail],
      subject: `🎁 You've Received a CenterKick ${params.targetTier} Gift Subscription!`,
      html: `
        <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; padding: 40px; color: #1f2937; background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 16px;">
            <div style="text-align: center; margin-bottom: 32px;">
                <h1 style="font-size: 24px; font-weight: 800; color: #a20000; margin: 0;">CenterKick Gift Subscription</h1>
                <p style="font-size: 14px; font-weight: 600; color: #6b7280; margin-top: 4px;">Sponsored by ${params.buyerName}</p>
            </div>
            
            <div style="margin-bottom: 32px;">
                <p style="font-size: 16px; line-height: 24px; color: #4b5563; margin-bottom: 24px;">
                    Great news! <strong>${params.buyerName}</strong> has gifted you a <strong>${params.durationMonths}-Month ${params.targetTier}</strong> membership on CenterKick.
                </p>
                
                ${params.giftMessage ? `
                <div style="background-color: #fef2f2; border: 1px solid #fecaca; border-radius: 12px; padding: 20px; margin-bottom: 24px; font-style: italic; color: #991b1b;">
                    "${params.giftMessage}"
                </div>` : ''}
                
                <div style="background-color: #111827; border-radius: 16px; padding: 24px; margin-bottom: 24px; text-align: center;">
                    <p style="font-size: 12px; font-weight: 700; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 8px;">Your Gift Voucher Code</p>
                    <div style="font-family: monospace; font-size: 28px; font-weight: 900; color: #ffffff; letter-spacing: 0.15em;">
                        ${params.code}
                    </div>
                </div>

                <!-- Guidance for New vs Existing Account Holders -->
                <div style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 12px; padding: 20px; margin-bottom: 24px; font-size: 13px; color: #4b5563; line-height: 20px;">
                    <p style="margin: 0 0 10px 0; font-weight: 700; color: #111827;">How to Claim Your Gift:</p>
                    <ul style="margin: 0; padding-left: 20px;">
                        <li style="margin-bottom: 8px;">
                            <strong>Already have an account?</strong> Copy your code <strong>${params.code}</strong>, log in to CenterKick, and redeem it under <em>Dashboard &gt; Subscription &gt; Redeem Voucher</em>.
                        </li>
                        <li>
                            <strong>New to CenterKick?</strong> Click the button below to register a new account with your gift code automatically applied.
                        </li>
                    </ul>
                </div>
                
                <div style="text-align: center;">
                    <a href="${claimLink}" style="display: inline-block; padding: 16px 32px; background-color: #a20000; color: #ffffff; text-decoration: none; border-radius: 12px; font-weight: 800; font-size: 14px; transition: all 0.2s ease;">
                        Register &amp; Claim Membership Now
                    </a>
                </div>
            </div>
        </div>
      `,
    });
    return data;
  } catch (error) {
    console.error('Failed to send gift voucher email:', error);
    throw error;
  }
}

export async function sendGiftReceiptToBuyerEmail(params: {
  buyerEmail: string;
  buyerName: string;
  code: string;
  targetTier: string;
  durationMonths: number;
  recipientEmail?: string;
  paymentReference: string;
}) {
  try {
    const data = await resend.emails.send({
      from: 'CenterKick Gifts <receipts@centerkick.com>',
      to: [params.buyerEmail],
      subject: `🧾 CenterKick Gift Voucher Purchase Confirmation (${params.code})`,
      html: `
        <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; padding: 40px; color: #1f2937; background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 16px;">
            <div style="text-align: center; margin-bottom: 32px;">
                <h1 style="font-size: 24px; font-weight: 800; color: #111827; margin: 0;">Gift Purchase Confirmation</h1>
                <p style="font-size: 14px; font-weight: 600; color: #a20000; margin-top: 4px;">Ref: ${params.paymentReference}</p>
            </div>
            
            <div style="margin-bottom: 32px;">
                <p style="font-size: 16px; line-height: 24px; color: #4b5563; margin-bottom: 24px;">
                    Hello <strong>${params.buyerName}</strong>,<br/><br/>
                    Thank you for sponsoring sports talent through CenterKick! Your gift voucher has been generated and activated.
                </p>

                <div style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
                    <p style="font-size: 12px; font-weight: 700; color: #6b7280; text-transform: uppercase; letter-spacing: 0.05em; margin: 0 0 12px 0;">Order Summary</p>
                    <p style="font-size: 14px; margin: 4px 0; color: #111827;"><strong>Gift Package:</strong> ${params.durationMonths}-Month ${params.targetTier} Membership</p>
                    <p style="font-size: 14px; margin: 4px 0; color: #111827;"><strong>Gift Code:</strong> <span style="font-family: monospace; font-weight: 800; color: #a20000;">${params.code}</span></p>
                    ${params.recipientEmail ? `<p style="font-size: 14px; margin: 4px 0; color: #111827;"><strong>Dispatched To:</strong> ${params.recipientEmail}</p>` : '<p style="font-size: 14px; margin: 4px 0; color: #111827;"><strong>Delivery Mode:</strong> Manual Copy</p>'}
                </div>

                <div style="background-color: #111827; border-radius: 16px; padding: 24px; text-align: center;">
                    <p style="font-size: 12px; font-weight: 700; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 8px;">Voucher Claim Code</p>
                    <div style="font-family: monospace; font-size: 26px; font-weight: 900; color: #ffffff; letter-spacing: 0.15em;">
                        ${params.code}
                    </div>
                </div>
            </div>
        </div>
      `,
    });
    return data;
  } catch (error) {
    console.error('Failed to send buyer gift receipt email:', error);
    throw error;
  }
}

export async function sendOrgSponsorshipInviteEmail(params: {
  athleteEmail: string;
  orgName: string;
  code: string;
  planTier: string;
}) {
  try {
    const claimLink = `${process.env.NEXT_PUBLIC_APP_URL || 'https://centerkick.com'}/register?code=${params.code}`;
    const data = await resend.emails.send({
      from: 'CenterKick Sponsorships <sponsorships@centerkick.com>',
      to: [params.athleteEmail],
      subject: `🏆 Organization Sponsorship Invitation from ${params.orgName}`,
      html: `
        <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; padding: 40px; color: #1f2937; background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 16px;">
            <div style="text-align: center; margin-bottom: 32px;">
                <h1 style="font-size: 24px; font-weight: 800; color: #111827; margin: 0;">Organization Sponsorship</h1>
                <p style="font-size: 14px; font-weight: 600; color: #a20000; margin-top: 4px;">100% Covered by ${params.orgName}</p>
            </div>
            
            <div style="margin-bottom: 32px;">
                <p style="font-size: 16px; line-height: 24px; color: #4b5563; margin-bottom: 24px;">
                    <strong>${params.orgName}</strong> has assigned you an annual <strong>${params.planTier}</strong> seat on CenterKick.
                </p>
                
                <div style="background-color: #111827; border-radius: 16px; padding: 24px; margin-bottom: 24px; text-align: center;">
                    <p style="font-size: 12px; font-weight: 700; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 8px;">Your Sponsorship Access Code</p>
                    <div style="font-family: monospace; font-size: 28px; font-weight: 900; color: #ffffff; letter-spacing: 0.15em;">
                        ${params.code}
                    </div>
                </div>
                
                <div style="text-align: center;">
                    <a href="${claimLink}" style="display: inline-block; padding: 16px 32px; background-color: #a20000; color: #ffffff; text-decoration: none; border-radius: 12px; font-weight: 800; font-size: 14px;">
                        Activate Sponsored Access
                    </a>
                </div>
            </div>
        </div>
      `,
    });
  } catch (error) {
    console.error('Failed to send org sponsorship invite email:', error);
    throw error;
  }
}

export async function sendOrgSponsorshipPurchaseConfirmationEmail(params: {
  orgEmail: string;
  orgName: string;
  planTier: string;
  totalSeats: number;
  paymentReference: string;
  codes: string[];
}) {
  try {
    const data = await resend.emails.send({
      from: 'CenterKick Sponsorships <sponsorships@centerkick.com>',
      to: [params.orgEmail],
      subject: `🧾 CenterKick Sponsorship Package Confirmation (${params.totalSeats} ${params.planTier} Seats)`,
      html: `
        <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; padding: 40px; color: #1f2937; background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 16px;">
            <div style="text-align: center; margin-bottom: 32px;">
                <h1 style="font-size: 24px; font-weight: 800; color: #111827; margin: 0;">Sponsorship Package Purchase Confirmation</h1>
                <p style="font-size: 14px; font-weight: 600; color: #a20000; margin-top: 4px;">Ref: ${params.paymentReference}</p>
            </div>
            
            <div style="margin-bottom: 32px;">
                <p style="font-size: 16px; line-height: 24px; color: #4b5563; margin-bottom: 24px;">
                    Hello <strong>${params.orgName}</strong>,<br/><br/>
                    Thank you for purchasing sponsorship seats on CenterKick! Your sponsorship codes have been generated and are now active.
                </p>

                <div style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
                    <p style="font-size: 12px; font-weight: 700; color: #6b7280; text-transform: uppercase; letter-spacing: 0.05em; margin: 0 0 12px 0;">Package Summary</p>
                    <p style="font-size: 14px; margin: 4px 0; color: #111827;"><strong>Target Tier:</strong> ${params.planTier}</p>
                    <p style="font-size: 14px; margin: 4px 0; color: #111827;"><strong>Total Seats:</strong> ${params.totalSeats}</p>
                    <p style="font-size: 14px; margin: 4px 0; color: #111827;"><strong>Payment Reference:</strong> ${params.paymentReference}</p>
                </div>

                <div style="background-color: #111827; border-radius: 16px; padding: 24px; margin-bottom: 24px;">
                    <p style="font-size: 12px; font-weight: 700; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 12px; text-align: center;">Generated Voucher Codes</p>
                    <div style="font-family: monospace; font-size: 16px; font-weight: 800; color: #ffffff; line-height: 28px; text-align: center;">
                        ${params.codes.join('<br/>')}
                    </div>
                </div>

                <p style="font-size: 13px; color: #6b7280; text-align: center;">
                    You can manage and send these codes anytime from your <strong>CenterKick Dashboard &gt; Sponsorships</strong> portal.
                </p>
            </div>
        </div>
      `,
    });
    return data;
  } catch (error) {
    console.error('Failed to send org sponsorship purchase confirmation email:', error);
    throw error;
  }
}


