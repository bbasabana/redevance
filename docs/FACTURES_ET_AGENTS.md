# Factures générées — Stockage et visibilité par agent

## 1. Où sont stockées les factures en base de données ?

Les « factures » générées à l’issue d’un contrôle terrain ne sont pas dans une table dédiée « factures ». Elles correspondent aux enregistrements suivants :

| Table | Rôle |
|-------|------|
| **`controles_terrain`** | Chaque contrôle terrain (un par assujetti × exercice × agent). Contient : `id`, **`agent_id`** (l’agent qui a fait le contrôle), `assujetti_id`, `exercice`, constats (TV/radio), adresse, géoloc, date, etc. |
| **`notes_rectificatives_terrain`** | Une ligne par contrôle avec montants : `controle_id`, `assujetti_id`, `montant_ecart`, `montant_penalite`, `montant_total`, `statut_paiement`, `reference_paiement`, `date_paiement`. |

Donc : **une facture = un enregistrement dans `controles_terrain`** (éventuellement lié à une ligne dans `notes_rectificatives_terrain` pour les montants). La clé pour « à qui appartient la facture » est **`controles_terrain.agent_id`**.

---

## 2. Visibilité par agent (mobile)

- **Chaque agent ne voit que les factures qu’il a lui‑même générées.**  
  L’API **GET /api/mobile/controls** retourne uniquement les contrôles dont `agent_id` = l’agent connecté (JWT). L’écran « Factures générées » de l’app mobile appelle cette API et affiche uniquement cette liste.

- **Un autre agent qui cherche un assujetti** voit bien que cet assujetti a déjà été contrôlé / payé pour l’année, sans voir le détail des factures des autres.  
  C’est géré par **GET /api/mobile/assujettis/[id]** qui renvoie `controlStatus: { alreadyControlled: true, exercice }` lorsqu’un contrôle existe pour cet assujetti et cet exercice. L’app mobile affiche alors un message du type « Cet assujetti a déjà payé sa redevance pour l’année X » et n’autorise pas un second contrôle pour la même période.

---

## 3. Récapitulatif

| Besoin | Solution |
|--------|----------|
| Où sont stockées les factures ? | Tables **`controles_terrain`** et **`notes_rectificatives_terrain`** (lien par `controle_id`). |
| Un agent ne voit que ses factures | **GET /api/mobile/controls** filtré côté serveur par `agent_id` (agent connecté). |
| Un autre agent voit qu’un assujetti est déjà payé | **GET /api/mobile/assujettis/[id]** avec `controlStatus.alreadyControlled` + blocage d’un second contrôle (POST 409). |
