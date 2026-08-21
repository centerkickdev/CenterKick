/**
 * CenterKick Branded HTML Email Templates for Automated Reminders
 */

export function getIncompleteProfileEmailTemplate({
  name,
  role = 'player',
  dashboardUrl = 'https://centerkick.com/dashboard/profile',
  unsubscribeUrl = 'https://centerkick.com/dashboard/settings?tab=Notifications',
}: {
  name: string;
  role?: string;
  dashboardUrl?: string;
  unsubscribeUrl?: string;
}) {
  const roleDisplay = role.charAt(0).toUpperCase() + role.slice(1);

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Complete Your CenterKick Profile</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f5f7; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #111827;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f4f5f7; padding: 40px 10px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.05); border: 1px solid #e5e7eb;" cellspacing="0" cellpadding="0">
          
          <!-- Header Banner -->
          <tr>
            <td style="background-color: #0f172a; padding: 32px 40px; text-align: center;">
              <span style="color: #ffffff; font-size: 24px; font-weight: 900; letter-spacing: -0.5px;">Center<span style="color: #b50a0a;">Kick</span></span>
            </td>
          </tr>

          <!-- Body Content -->
          <tr>
            <td style="padding: 40px 40px 32px 40px;">
              <h1 style="font-size: 22px; font-weight: 800; color: #0f172a; margin-top: 0; margin-bottom: 16px;">Hi ${name || 'there'}, complete your ${roleDisplay} profile!</h1>
              <p style="font-size: 15px; line-height: 1.6; color: #4b5563; margin-bottom: 24px;">
                Your CenterKick ${roleDisplay} profile is currently incomplete. Completing your profile significantly increases your visibility to certified scouts, agents, and clubs searching our platform.
              </p>
              
              <div style="background-color: #f9fafb; border-left: 4px solid #b50a0a; border-radius: 8px; padding: 16px 20px; margin-bottom: 28px;">
                <p style="font-size: 14px; font-weight: 700; color: #1f2937; margin: 0 0 8px 0;">Recommended Profile Highlights to Add:</p>
                <ul style="font-size: 14px; color: #4b5563; margin: 0; padding-left: 20px; line-height: 1.6;">
                  <li>High-resolution profile picture & cover banner</li>
                  <li>Position, preferred foot & physical attributes</li>
                  <li>Career transfer history & seasonal match statistics</li>
                  <li>Video highlights & gallery photos</li>
                </ul>
              </div>

              <!-- CTA Button -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="center">
                    <a href="${dashboardUrl}" target="_blank" style="display: inline-block; background-color: #b50a0a; color: #ffffff; font-size: 14px; font-weight: 700; text-decoration: none; padding: 14px 32px; border-radius: 12px; box-shadow: 0 4px 12px rgba(181, 10, 10, 0.25);">
                      Complete Your Profile Now &rarr;
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 24px 40px; border-top: 1px solid #f3f4f6; text-align: center;">
              <p style="font-size: 12px; color: #9ca3af; margin-0; line-height: 1.5;">
                You are receiving this weekly reminder because you registered an account on CenterKick.<br>
                Don't want to receive these emails? <a href="${unsubscribeUrl}" style="color: #b50a0a; text-decoration: underline;">Unsubscribe or change settings</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

export function getSubscriptionReminderEmailTemplate({
  name,
  role = 'player',
  subscriptionUrl = 'https://centerkick.com/dashboard/subscription',
  unsubscribeUrl = 'https://centerkick.com/dashboard/settings?tab=Notifications',
}: {
  name: string;
  role?: string;
  subscriptionUrl?: string;
  unsubscribeUrl?: string;
}) {
  const roleDisplay = role.charAt(0).toUpperCase() + role.slice(1);

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Activate Your CenterKick Membership</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f5f7; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #111827;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f4f5f7; padding: 40px 10px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.05); border: 1px solid #e5e7eb;" cellspacing="0" cellpadding="0">
          
          <!-- Header Banner -->
          <tr>
            <td style="background-color: #0f172a; padding: 32px 40px; text-align: center;">
              <span style="color: #ffffff; font-size: 24px; font-weight: 900; letter-spacing: -0.5px;">Center<span style="color: #b50a0a;">Kick</span></span>
            </td>
          </tr>

          <!-- Body Content -->
          <tr>
            <td style="padding: 40px 40px 32px 40px;">
              <h1 style="font-size: 22px; font-weight: 800; color: #0f172a; margin-top: 0; margin-bottom: 16px;">Take Your Football Career Further, ${name || 'Friend'}!</h1>
              <p style="font-size: 15px; line-height: 1.6; color: #4b5563; margin-bottom: 24px;">
                Unlock full access on CenterKick and stand out to top football organizations, scouts, and licensed agents worldwide.
              </p>
              
              <div style="background-color: #f9fafb; border-left: 4px solid #0f172a; border-radius: 8px; padding: 16px 20px; margin-bottom: 28px;">
                <p style="font-size: 14px; font-weight: 700; color: #1f2937; margin: 0 0 8px 0;">Membership Benefits Include:</p>
                <ul style="font-size: 14px; color: #4b5563; margin: 0; padding-left: 20px; line-height: 1.6;">
                  <li>Verified badge on your public football profile</li>
                  <li>Direct messaging with verified scouts & agencies</li>
                  <li>Featured placement on the global discovery feed</li>
                  <li>Access to trial opportunities & transfer market listings</li>
                </ul>
              </div>

              <!-- CTA Button -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="center">
                    <a href="${subscriptionUrl}" target="_blank" style="display: inline-block; background-color: #0f172a; color: #ffffff; font-size: 14px; font-weight: 700; text-decoration: none; padding: 14px 32px; border-radius: 12px; box-shadow: 0 4px 12px rgba(15, 23, 42, 0.25);">
                      Activate Your Plan Now &rarr;
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 24px 40px; border-top: 1px solid #f3f4f6; text-align: center;">
              <p style="font-size: 12px; color: #9ca3af; margin: 0; line-height: 1.5;">
                You are receiving this weekly reminder because you registered an account on CenterKick.<br>
                Don't want to receive these emails? <a href="${unsubscribeUrl}" style="color: #b50a0a; text-decoration: underline;">Unsubscribe or change settings</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}
