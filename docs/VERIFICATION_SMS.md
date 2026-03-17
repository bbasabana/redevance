# Vérification SMS — Assujetti reçoit un SMS sur son numéro (création de compte)

## Implémentation

L’assujetti reçoit un SMS sur **le numéro qu’il a renseigné à la création de son compte** (ou en mettant à jour son profil). Ce numéro est stocké en base dans `assujettis.telephone_principal`.

### 1. Où le numéro est enregistré

- **Inscription** : `src/lib/auth/register-action.ts` enregistre `telephonePrincipal: validatedData.telephone`.
- **Profil assujetti** : `ProfileEditForm` et actions associées mettent à jour `telephonePrincipal`.
- **Identification / taxation** : `completeIdentification` et flux de déclaration peuvent aussi renseigner ce champ.

### 2. Quand un SMS est envoyé

| Contexte | Fichier | Moment |
|----------|---------|--------|
| **Paiement web confirmé** | `src/lib/payments/actions.ts` → `validatePayment()` | Quand un agent/superviseur **confirme** un paiement (`statut = "confirme"`), on récupère l’assujetti (`nomRaisonSociale`, `telephonePrincipal`) et on appelle `sendPaymentConfirmationSms()`. |
| **Contrôle terrain (mobile)** | `src/app/api/mobile/controls/route.ts` → `POST` | Après enregistrement du contrôle, on récupère l’assujetti et on appelle `sendControlNotificationSms()` avec le même `telephonePrincipal`. |

Dans les deux cas, si `telephonePrincipal` est vide ou trop court (< 8 caractères), aucun SMS n’est envoyé (pas d’erreur bloquante, le flux continue).

### 3. Contenu des SMS

- **Paiement web** : *"RTNC RDV: [Nom], vous avez payé [montant] pour la période [année]. Réf: [réf]."*
- **Contrôle terrain** : *"RTNC RDV: [Nom], contrôle terrain enregistré. Montant: [montant], période [année]. Réf: [réf]."*

Sender ID (MessageBird) : **rtnc rdv**.

### 4. Configuration

- Clé API : `MESSAGEBIRD_API_KEY` dans `.env` ou `.env.local`.
- Module : `src/lib/sms/messagebird.ts` (client MessageBird via `initClient`).

## Test manuel d’envoi SMS

Script Node (sans framework de test) :

```bash
# Vérifier que la clé est configurée et que le client MessageBird se crée
npm run test:sms

# Envoyer un vrai SMS de test (remplacer par un numéro de test)
npm run test:sms -- 243812345678

# Simuler l’envoi sans appeler l’API
node scripts/test-sms.js --dry-run 243812345678
```

- **Sans numéro** : vérification config + initialisation du client.
- **Avec numéro** : envoi réel d’un SMS de test.
- **Avec `--dry-run`** : même logique mais sans appel à MessageBird (utile en CI ou sans clé).

## Correction effectuée

Le SDK MessageBird (npm `messagebird`) utilise `initClient(apiKey)` et non `(apiKey)` en appel direct. Le fichier `src/lib/sms/messagebird.ts` a été mis à jour pour utiliser `require("messagebird").initClient(MESSAGEBIRD_API_KEY)`.
