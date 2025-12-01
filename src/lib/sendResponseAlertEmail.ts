import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendResponseAlertEmail(
    email: string,
    name: string,
    formName: string
) {
    try {
        const { error } = await resend.emails.send({
            from: 'New Lead <leads@wizards.co.in>',
            to: [email],
            subject: `New response received for "${formName}"`,
            html: `
                <div style="font-family: Arial, sans-serif; padding: 16px; line-height: 1.6; font-size: 15px;">
                    <p>Hello <b>${name}</b>,</p>

                    <p>You have received a new submission on your form:</p>

                    <p style="margin: 8px 0;">
                       <b>Form Name:</b> ${formName}
                    </p>

                    <p>You can log in to your dashboard to view the full response details.</p>

                    <p style="margin-top: 24px;">
                       Regards,<br/>
                       <b>Your Team</b>
                    </p>
                </div>
            `,
        });

        if (error) {
            console.error("❌ Failed to send alert email:", error);
            return { success: false, error };
        }

        return { success: true, message: "Alert email sent successfully" };

    } catch (err: any) {
        console.error("❌ Unexpected email error:", err);
        return { success: false, error: err.message };
    }
}
