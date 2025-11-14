import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function SendPasswordResetEmail(email: string, token: string) {
  const resetUrl = `http://localhost:3000/reset-password?token=${token}`;

  const { data, error } = await resend.emails.send({
    from: 'Reset Your Password <onboarding@resend.dev>',
    to: ['priyeshrai.dev@gmail.com'],
    subject: 'Reset Your Password',
    html: `
      <div style="font-family: Arial; padding: 16px">
        <h2>Reset Your Password</h2>
        <p>Click the link below to reset your password:</p>
        <p>
          <a href="${resetUrl}" style="color:#2563eb">${resetUrl}</a>
        </p>
        <p>This link will expire in 15 minutes.</p>
      </div>
    `,
  });

  if (error) {
    console.error('❌ Email sending failed:', error);
    return error
  }

  return "Email sent successfully"

}