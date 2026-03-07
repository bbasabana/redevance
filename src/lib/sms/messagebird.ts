/**
 * Envoi SMS via MessageBird.
 * Sender ID (originator) : "rtnc rdv" (Référence RTNC Redevance).
 * Configure MESSAGEBIRD_API_KEY dans .env
 */

const MESSAGEBIRD_API_KEY = process.env.MESSAGEBIRD_API_KEY;
const DEFAULT_ORIGINATOR = "rtnc rdv";

function getClient(): { messages: { create: (params: unknown, cb: (err: unknown, res: unknown) => void) => void } } | null {
  if (!MESSAGEBIRD_API_KEY) return null;
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const messagebird = require("messagebird")(MESSAGEBIRD_API_KEY);
    return messagebird;
  } catch {
    return null;
  }
}

/**
 * Envoie un SMS à un ou plusieurs numéros.
 * @param recipients - Numéros au format international (ex: 243812345678)
 * @param body - Texte du message
 * @param originator - Sender ID (défaut: "rtnc rdv")
 * @returns true si envoyé, false si service indisponible ou erreur
 */
export async function sendSms(
  recipients: string[],
  body: string,
  originator: string = DEFAULT_ORIGINATOR
): Promise<{ ok: boolean; error?: string }> {
  const client = getClient();
  if (!client) {
    return { ok: false, error: "MESSAGEBIRD_API_KEY non configuré" };
  }

  const normalized = recipients
    .map((r) => String(r).replace(/\s/g, "").replace(/^\+/, "").replace(/^0/, "243"))
    .filter((r) => r.length >= 9);

  if (normalized.length === 0) {
    return { ok: false, error: "Aucun numéro valide" };
  }

  return new Promise((resolve) => {
    client.messages.create(
      {
        originator,
        recipients: normalized,
        body: body.slice(0, 1600), // limite raisonnable
      },
      (err: unknown, _res: unknown) => {
        if (err) {
          console.error("[SMS MessageBird]", err);
          resolve({ ok: false, error: err instanceof Error ? err.message : String(err) });
        } else {
          resolve({ ok: true });
        }
      }
    );
  });
}

/**
 * Envoie un SMS de confirmation de paiement (plateforme web).
 * Message : nom, montant, période, référence.
 */
export async function sendPaymentConfirmationSms(params: {
  phone: string | null;
  nom: string;
  montant: string;
  periode: string;
  reference?: string;
}): Promise<{ ok: boolean; error?: string }> {
  if (!params.phone || params.phone.trim().length < 8) {
    return { ok: false, error: "Numéro manquant" };
  }
  const ref = params.reference ? ` Réf: ${params.reference}.` : "";
  const body = `RTNC RDV: ${params.nom}, vous avez payé ${params.montant} pour la période ${params.periode}.${ref}`;
  return sendSms([params.phone], body);
}

/**
 * Envoie un SMS de notification après contrôle terrain (mobile agent).
 * Message : nom, montant, période (exercice).
 */
export async function sendControlNotificationSms(params: {
  phone: string | null;
  nom: string;
  montant: string;
  periode: string;
  reference?: string;
}): Promise<{ ok: boolean; error?: string }> {
  if (!params.phone || params.phone.trim().length < 8) {
    return { ok: false, error: "Numéro manquant" };
  }
  const ref = params.reference ? ` Réf: ${params.reference}.` : "";
  const body = `RTNC RDV: ${params.nom}, contrôle terrain enregistré. Montant: ${params.montant}, période ${params.periode}.${ref}`;
  return sendSms([params.phone], body);
}
