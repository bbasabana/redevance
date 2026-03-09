/**
 * Test d'envoi SMS (MessageBird).
 * Usage:
 *   node scripts/test-sms.js              → Vérifie clé API + client (pas d'envoi)
 *   node scripts/test-sms.js 243812345678  → Envoie un SMS de test au numéro
 *   node scripts/test-sms.js --dry-run 243812345678 → Simule l'envoi (pas d'appel API)
 * Ou: npm run test:sms
 *     npm run test:sms -- 243812345678
 */

const fs = require("fs");
const path = require("path");

// Charger .env puis .env.local (.env.local écrase .env)
function loadEnv() {
  const root = path.join(__dirname, "..");
  for (const name of [".env", ".env.local"]) {
    const p = path.join(root, name);
    if (fs.existsSync(p)) {
      const content = fs.readFileSync(p, "utf8");
      content.split("\n").forEach((line) => {
        const match = line.match(/^([^#=]+)=(.*)$/);
        if (match) {
          const key = match[1].trim();
          const val = match[2].trim().replace(/^["']|["']$/g, "");
          process.env[key] = val;
        }
      });
      console.log(`Loaded ${name}`);
    }
  }
}

loadEnv();

const MESSAGEBIRD_API_KEY = process.env.MESSAGEBIRD_API_KEY;
const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const testNumber = args.find((a) => a !== "--dry-run") || null;

async function run() {
  if (!MESSAGEBIRD_API_KEY) {
    console.error("❌ MESSAGEBIRD_API_KEY non configuré (ajoutez-le dans .env ou .env.local)");
    process.exit(1);
  }
  console.log("✓ Clé API MessageBird trouvée");

  let messagebird;
  try {
    messagebird = require("messagebird").initClient(MESSAGEBIRD_API_KEY);
  } catch (e) {
    console.error("❌ Erreur chargement MessageBird:", e.message);
    process.exit(1);
  }
  console.log("✓ Client MessageBird initialisé");

  if (!testNumber) {
    console.log("\nPour envoyer un SMS de test: node scripts/test-sms.js <numéro>");
    console.log("Ex: node scripts/test-sms.js 243812345678");
    process.exit(0);
  }

  const normalized = String(testNumber)
    .replace(/\s/g, "")
    .replace(/^\+/, "")
    .replace(/^0/, "243");
  if (normalized.length < 9) {
    console.error("❌ Numéro invalide (au moins 9 chiffres, ex: 0812345678 ou 243812345678)");
    process.exit(1);
  }

  const body = "RTNC RAA: Test SMS. Si vous recevez ceci, l'envoi fonctionne.";
  const params = {
    originator: "RTNC RAA",
    recipients: [normalized],
    body,
  };

  if (dryRun) {
    console.log("✓ [DRY-RUN] Envoi simulé — pas d'appel API");
    console.log("  Destinataire:", normalized);
    console.log("  Message:", body);
    return Promise.resolve();
  }

  return new Promise((resolve) => {
    messagebird.messages.create(params, (err, res) => {
      if (err) {
        console.error("❌ Envoi SMS échoué:", err);
        process.exit(1);
      }
      console.log("✓ SMS envoyé avec succès");
      console.log("Réponse:", JSON.stringify(res, null, 2));
      resolve();
    });
  });
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
