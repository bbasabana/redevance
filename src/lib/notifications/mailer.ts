export async function sendEmail({ to, subject, html }: { to: string; subject: string; html: string }) {
    // In a real app, use Resend or Nodemailer
    // const resend = new Resend(process.env.RESEND_API_KEY);
    // await resend.emails.send({ from: 'noreply@redevance.rtnc.cd', to, subject, html });

    console.log(`[MAILER] Sending email to ${to}`);
    console.log(`[MAILER] Subject: ${subject}`);
    // console.log(`[MAILER] Content: ${html}`);

    return { success: true };
}


export function generateGenericReminderHtml(user: string, noteRef: string, amount: string, deadline: string, stage: string) {
    let title = "Rappel de Paiement - RTNC";
    let message = `Ceci est un rappel concernant votre note de taxation <strong>${noteRef}</strong> d'un montant de <strong>${amount}$</strong>.`;

    if (stage === "warning") {
        title = "⚠️ URGENCE : Échéance Proche - RTNC";
        message = `Votre note de taxation <strong>${noteRef}</strong> arrive à échéance très bientôt. Évitez les pénalités et les relances en réglant votre situation aujourd'hui.`;
    } else if (stage === "relance") {
        title = "⛔ LETTRE DE RELANCE - RTNC";
        message = `Votre délai de paiement pour la note <strong>${noteRef}</strong> est dépassé. Une lettre de relance officielle a été générée. Vous disposez de 8 jours pour régulariser.`;
    } else if (stage === "mise_en_demeure") {
        title = "⚖️ MISE EN DEMEURE - RTNC";
        message = `Dernier avertissement avant procédure contentieuse pour la note <strong>${noteRef}</strong>. Veuillez vous acquitter de votre dette immédiatement.`;
    }

    return `
        <div style="font-family: sans-serif; color: #0F1C3F; padding: 20px;">
            <h1 style="color: #0F1C3F;">${title}</h1>
            <p>Bonjour ${user},</p>
            <p>${message}</p>
            <p><strong>Montant dû :</strong> ${amount}$</p>
            <p><strong>Date d'échéance initiale :</strong> ${deadline}</p>
            <p style="margin-top: 20px;">
                Veuillez régulariser votre situation via le portail assujetti.
            </p>
            <p style="margin-top: 30px; border-top: 1px solid #E2E8F0; padding-top: 10px; font-size: 12px; color: #64748B;">
                Ceci est un message automatique de la Direction de la Redevance RTNC.
            </p>
        </div>
    `;
}
