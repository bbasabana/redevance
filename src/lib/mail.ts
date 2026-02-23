import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_SERVER_HOST,
    port: parseInt(process.env.EMAIL_SERVER_PORT || "587"),
    auth: {
        user: process.env.EMAIL_SERVER_USER,
        pass: process.env.EMAIL_SERVER_PASSWORD,
    },
});

export async function sendWelcomeEmail(to: string, name: string) {
    // In development, we might not have a real SMTP server, so we just log it
    if (process.env.NODE_ENV === "development" && !process.env.EMAIL_SERVER_HOST) {
        console.log(`[DEV] Welcome email would be sent to: ${to} (Name: ${name})`);
        return;
    }

    const mailOptions = {
        from: process.env.EMAIL_FROM || '"Redevance RTNC" <no-reply@redevance.cd>',
        to,
        subject: "Bienvenue sur le portail de la Redevance Audiovisuelle",
        html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: auto;">
        <h2 style="color: #0F1C3F;">Bienvenue, ${name} !</h2>
        <p>Votre compte a été créé avec succès sur le portail de gestion de la Redevance Audiovisuelle.</p>
        <p>Vous pouvez désormais accéder à votre tableau de bord pour effectuer vos déclarations et consulter vos paiements.</p>
        <div style="margin: 30px 0;">
          <a href="${process.env.NEXTAUTH_URL}" style="background-color: #0F1C3F; color: white; padding: 12px 24px; text-decoration: none; rounded: 8px;">Accéder à mon espace</a>
        </div>
        <p>Pour votre sécurité, nous vous recommandons d'activer la double authentification (2FA) dès votre première connexion.</p>
        <hr style="border: 0; border-top: 1px solid #eee; margin: 30px 0;" />
        <p style="font-size: 12px; color: #666;">Ceci est un message automatique, merci de ne pas y répondre.</p>
      </div>
    `,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`Welcome email sent to ${to}`);
    } catch (error) {
        console.error("Failed to send welcome email:", error);
    }
}
