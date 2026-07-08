# Architecture — DineEase

> Le plan du bâtiment. Un nouveau (humain ou agent) le lit pour comprendre la structure d'ensemble
> et savoir où va chaque chose. À mettre à jour quand la structure évolue (via ADR pour les décisions).

## Vue d'ensemble
Plateforme web multi-restaurants : chaque restaurant loue une licence, configure son espace
personnalisé, et ses clients commandent en scannant un QR de table.

Type de projet : **web (SaaS multi-tenant)**. Stack : Next.js (App Router) · Supabase (PostgreSQL) · Supabase Auth.

## Principe directeur : micro-modules (bounded contexts)
Chaque module métier est un **livrable autonome** : il a ses écrans, sa logique, ses données, ses
tests, son `README.md` et son `CLAUDE.md`. Règles :
1. Un module expose une **API publique** via `index.ts` ; les autres n'importent QUE ça.
2. Aucun module n'importe l'intérieur d'un autre.
3. **Un agent = un module à la fois.** Les changements inter-modules passent par une PR + revue de l'owner.
4. Le thème / design est externalisé (voir `design-language.md`).

## Multi-tenant : le cœur
- Une seule base, une seule app. Chaque restaurant est un **tenant** identifié par `restaurant_id`.
- **Isolation par RLS PostgreSQL** : chaque requête est filtrée par le `restaurant_id` de l'utilisateur
  (gérant/chef/serveur) ou de la table scannée (client). Un restaurant ne voit jamais un autre.
- **Résolution du tenant** :
  - Staff (gérant/chef/serveur) : via leur profil (`restaurant_id` lié au compte).
  - Client : via le **QR de table**, qui encode `restaurant_id` + numéro de table (route publique, ex.
    `/t/<restaurant>/<table>` ou un token de table). Aucun compte requis pour le client.
- **Thème par restaurant** : les couleurs sont extraites du logo (`node-vibrant`) et appliquées via des
  **variables CSS**. La structure/layout est **identique pour tous** ; seules les couleurs varient.

## Arborescence
```
src/
├── modules/          # modules métier autonomes (voir carte ci-dessous)
├── shared/           # client Supabase, moteur de thème (variables CSS), UI kit, types, helpers temps réel
└── app/              # routes Next.js (App Router) — coquilles fines, sans logique métier
docs/                 # architecture, specs, ADR, design, erreurs
design/               # maquettes adoptées par module
security/             # scripts de test de sécurité (isolation RLS…)
scripts/              # outillage (new-task, check-deps, check-scope, pr-*, add/remove-collab, onboard)
.github/              # CI, CODEOWNERS, template de PR
```

## Carte des modules
| Module | Rôle | Owner | Dépendances | Écrans/Interfaces |
|---|---|---|---|---|
| `auth` | Comptes et rôles + session client anonyme | @Redac777 | — | Inscription, Connexion |
| `restaurant` | Tenant : onboarding, branding, thème | @Redac777 | auth | Config restaurant |
| `menu` | Sections et plats | @Redac777 | restaurant | Config menu |
| `tables` | Tables + QR codes | @Redac777 | restaurant | Config tables |
| `ordering` | Parcours client + panier partagé + suivi | @Redac777 | menu, tables | Menu client, Détail plat, Panier, Suivi |
| `kitchen` | Vue cuisine + alerte vocale | @Redac777 | ordering | Vue cuisine |
| `service` | Vue serveur (Premium) | @Redac777 | kitchen | Vue serveur |
| `reviews` | Notation staff (Premium) | @Redac777 | ordering, service | intégré au Suivi |
| `platform` | Super-admin restos/licences | @Redac777 | restaurant | Dashboard plateforme |
| `billing` | Abonnements/paiement (dernier) | @Redac777 | platform | Abonnement, Facturation |

## Flux de données
UI (React/Next) → validation **Zod** → couche données du module (`data/*.repository.ts`) → **Supabase**
(PostgreSQL + RLS) → retour UI. Le **temps réel** (commande, cuisine, panier partagé) passe par
**Supabase Realtime** (souscriptions aux changements de tables). L'auth (Supabase Auth) fournit le rôle
et le `restaurant_id` de l'utilisateur ; le client anonyme est scopé par le token de table du QR.
Les modules communiquent uniquement via leurs `index.ts`.

## Couche données
Chaque module a une **couche données remplaçable** (`data/*.repository.ts`) : c'est le seul endroit qui
parle à Supabase. On peut changer le backend sans réécrire l'UI.

## Décisions
Les choix structurants sont tracés dans `docs/adr/`. Voir `docs/adr/000-adr-process.md`. À tracer
notamment : le choix du prestataire de paiement (module `billing`, compatible Maroc).

## Évolutions prévues (l'archi doit les permettre)
- **Images de plats en 3D** (rotation 360°) générées par IA : le plat stocke une **URL d'image**, donc
  la source (upload / IA / modèle 3D) est interchangeable sans casser le schéma.
- **Paliers de licence** (Starter / Pro / Premium) : les fonctionnalités Premium (`service`, `reviews`)
  sont déjà des modules isolés, activables par palier.
- **Notifications** (push/email) : non incluses au départ, à ajouter si un besoin réel apparaît.
