# 🇨🇩 Meyllos Redevance - RTNC

Système professionnel de gestion et de collecte des redevances audiovisuelles pour la **Radio Télévision Nationale Congolaise (RTNC)**.

![Premium Dashboard Aesthetic](https://img.shields.io/badge/Aesthetic-Industrial_Technical-0d2870?style=for-the-badge)
![Next.js](https://img.shields.io/badge/Next.js_14-black?style=for-the-badge&logo=next.js)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript)

## 🚀 Vue d'ensemble

**Meyllos Redevance** est une plateforme SaaS de pointe conçue pour moderniser la fiscalité audiovisuelle en RDC. Elle offre une interface robuste pour les assujettis (particuliers et entreprises) et un centre de contrôle administratif pour le suivi des recouvrements.

### ✨ Fonctionnalités Clés

- **Tableau de Bord Technique** : Interface haute-performance avec esthétique industrielle (grille de points, monitoring RTNC).
- **Parcours d'Identification** : Assistant multi-étapes intelligent pour la classification automatique des assujettis.
- **Sécurité Critique (2FA)** : Authentification à double facteur (TOTP) avec clés chiffrées (AES-256) et codes de secours.
- **Notes de Taxation PDF** : Génération dynamique de documents certifiés avec QR Codes de vérification.
- **PWA Ready** : Expérience mobile native avec support du mode hors-ligne.
- **Certification Digitale** : Suivi en temps réel des règlements et mise en règle fiscale.

## 🛠 Stack Technique

- **Frontend** : Next.js 14 (App Router), React, Tailwind CSS, Framer Motion.
- **UI Components** : Shadcn UI (Radix UI), Lucide Icons.
- **Backend/Logic** : Server Actions, Next-Auth v5 (Auth.js).
- **Base de Données** : PostgreSQL via Drizzle ORM.
- **Stockage** : EdgeStore pour les documents PDF et justificatifs.
- **Sécurité** : Chiffrement AES-256-CBC, Hachage Argon2.

## ⚙️ Installation et Développement

### 1. Clonage et Dépendances
```bash
git clone https://github.com/bbasabana/redevance.git
cd redevance
npm install
```

### 2. Configuration de l'Environnement
Créez un fichier `.env` à la racine (voir `.env.example`) :
```env
DATABASE_URL="votre_url_postgre"
ENCRYPTION_KEY="votre_cle_32_chars"
NEXTAUTH_SECRET="votre_secret"
EDGE_STORE_ACCESS_KEY="..."
EDGE_STORE_SECRET_KEY="..."
```

### 3. Synchronisation de la Base de Données
```bash
npx drizzle-kit push
```

### 4. Lancement
```bash
npm run dev
```
Accédez à [http://localhost:3000](http://localhost:3000).

## 🏗 Build de Production
Pour générer une version optimisée :
```bash
npm run build
npm run start
```

---
*Développé pour l'Excellence Fiscale — Meyllos Group & RTNC.*
