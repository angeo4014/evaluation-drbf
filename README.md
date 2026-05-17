# 📊 DRBF Gbêkê - Formulaire d'Évaluation

Formulaire d'évaluation de la qualité de service de la Direction Régionale du Budget et des Finances - Région de Gbêkê.

## 🛠 Stack Technique (compatible Vercel + GitHub)

| Avant (PHP) | Maintenant (Node.js) |
|---|---|
| PHP + MySQL | Next.js + Supabase (PostgreSQL) |
| PHPMailer | Resend (API email) |
| traitement.php | /api/submit.js (serverless) |
| admin.php | /admin (React) |
| merci.php | Page intégrée dans React |

---

## 🚀 GUIDE DE DÉPLOIEMENT ÉTAPE PAR ÉTAPE

### ÉTAPE 1 : Créer la base de données (Supabase)

1. Allez sur [https://supabase.com](https://supabase.com) → **Start your project** (gratuit)
2. Créez un nouveau projet (notez le mot de passe)
3. Attendez que le projet se lance (~2 min)
4. Allez dans **SQL Editor** → **New query**
5. Copiez-collez le contenu de `supabase-schema.sql`
6. Cliquez **Run**
7. Récupérez vos clés dans **Settings → API** :
   - `NEXT_PUBLIC_SUPABASE_URL` (Project URL)
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` (anon/public key)
   - `SUPABASE_SERVICE_ROLE_KEY` (service_role key - secret !)

### ÉTAPE 2 : Configurer l'envoi d'email (Resend)

1. Allez sur [https://resend.com](https://resend.com) → **Sign up** (gratuit : 100 emails/jour)
2. Dans **API Keys** → **Create API Key**
3. Copiez la clé `re_...` → c'est votre `RESEND_API_KEY`
4. **Option A (test rapide)** : Utilisez `onboarding@resend.dev` comme expéditeur (fonctionne sans domaine)
5. **Option B (production)** : Ajoutez votre domaine dans **Domains** et vérifiez-le

### ÉTAPE 3 : Publier sur GitHub

```bash
# Dans le dossier du projet
git init
git add .
git commit -m "Initial commit - DRBF Evaluation"
git branch -M main
git remote add origin https://github.com/VOTRE_USERNAME/drbf-evaluation.git
git push -u origin main
```

> ⚠️ Le fichier `.env.local` est dans `.gitignore` → vos secrets ne seront PAS publiés

### ÉTAPE 4 : Déployer sur Vercel

1. Allez sur [https://vercel.com](https://vercel.com) → **Sign up with GitHub**
2. **New Project** → importez votre repo `drbf-evaluation`
3. Dans **Environment Variables**, ajoutez toutes les variables de `.env.example` :
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `RESEND_API_KEY`
   - `EMAIL_SOUS_DIR_BUDGET`
   - `EMAIL_SOUS_DIR_SOLDE`
   - `EMAIL_CHEF_SERVICE_TECH`
   - `EMAIL_EXPEDITEUR` → mettez `onboarding@resend.dev` pour tester
4. Cliquez **Deploy** → votre site sera en ligne en ~2 minutes !

---

## 💻 Développement local

```bash
# Installer les dépendances
npm install

# Copier les variables d'environnement
cp .env.example .env.local
# Éditez .env.local avec vos vraies valeurs

# Lancer le serveur de développement
npm run dev
# → http://localhost:3000
```

---

## 📁 Structure du projet

```
drbf-evaluation/
├── pages/
│   ├── index.js          # Formulaire (remplace index.html + script.js + merci.php)
│   ├── admin.js          # Tableau de bord (remplace admin.php)
│   ├── _app.js
│   └── api/
│       ├── submit.js     # Traitement formulaire (remplace traitement.php)
│       └── stats.js      # Statistiques (remplace les vues SQL)
├── lib/
│   ├── supabase.js       # Client base de données (remplace config.php + PDO)
│   └── email.js          # Envoi email (remplace PHPMailer)
├── styles/
│   ├── globals.css       # Variables CSS globales
│   ├── Home.module.css   # Styles formulaire (reprend style.css)
│   └── Admin.module.css  # Styles tableau de bord
├── supabase-schema.sql   # Script SQL (remplace database.sql)
├── .env.example          # Modèle de configuration (remplace config.php)
├── .env.local            # Vos secrets locaux (jamais sur GitHub !)
└── .gitignore
```

---

## 🔗 URLs de l'application

- **Formulaire** : `https://votre-projet.vercel.app/`
- **Admin** : `https://votre-projet.vercel.app/admin`

---

## 📧 Emails configurés

Modifiez les variables d'environnement sur Vercel pour changer les destinataires :
- `EMAIL_SOUS_DIR_BUDGET` : reçoit les évaluations Budget
- `EMAIL_SOUS_DIR_SOLDE` : reçoit les évaluations Solde
- `EMAIL_CHEF_SERVICE_TECH` : reçoit toutes les évaluations

---

## 🆓 Coûts

| Service | Plan gratuit |
|---|---|
| **Vercel** | Illimité (projets personnels) |
| **Supabase** | 500 MB DB, 50 000 requêtes/mois |
| **Resend** | 100 emails/jour, 3 000/mois |
| **GitHub** | Illimité (repos publics/privés) |

**Total : 0 FCFA / mois** pour un usage normal 🎉
