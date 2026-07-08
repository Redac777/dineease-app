# DineEase

Plateforme web multi-restaurants : chaque restaurant loue une licence, configure son espace
personnalisé (nom, logo, thème déduit du logo), et ses clients commandent en scannant un QR code de
table. Commande de table partagée en temps réel, vue cuisine, alerte au service, suivi client live.

- **Type** : web (SaaS multi-tenant)
- **Utilisateurs** : gérants de restaurants, chefs, serveurs, clients (sans compte)
- **Stack** : Next.js (App Router) · Supabase (PostgreSQL + Auth + Realtime + Storage) · Tailwind CSS

## Démarrage rapide
```bash
npm install
npm run dev
```
Configuration : copier `.env.example` en `.env` et renseigner les variables (voir ce fichier).

## Structure
```
src/modules/         # modules métier autonomes (1 owner chacun)
src/shared/          # client Supabase, moteur de thème, UI kit, types
docs/                # architecture, specs, décisions (ADR), design, erreurs
design/              # maquettes adoptées par module/interface
security/            # scripts de test de sécurité (isolation RLS…)
.github/             # CI, CODEOWNERS, template de PR
scripts/             # outillage (new-task, check-*, pr-*, add/remove-collab, onboard)
```

## Modules
| Module | Rôle | Owner |
|---|---|---|
| `auth` | Comptes et rôles + session client anonyme | @Redac777 |
| `restaurant` | Tenant : onboarding, branding, thème | @Redac777 |
| `menu` | Sections et plats | @Redac777 |
| `tables` | Tables + QR codes | @Redac777 |
| `ordering` | Parcours client + panier partagé + suivi | @Redac777 |
| `kitchen` | Vue cuisine + alerte vocale | @Redac777 |
| `service` | Vue serveur (Premium) | @Redac777 |
| `reviews` | Notation staff (Premium) | @Redac777 |
| `platform` | Super-admin restos/licences | @Redac777 |
| `billing` | Abonnements/paiement (dernier) | @Redac777 |

Ordre de construction : `auth`+`restaurant` → `menu`+`tables` → `ordering`+`kitchen` → `service`+`reviews` → `platform`+`billing`.

## Contribuer
Lis `CONTRIBUTING.md` (workflow complet) et `CLAUDE.md` (règles pour l'agent). En résumé : une tâche
= une branche = un worktree ; tests aux 3 niveaux ; PR vers `dev_branch` ; merge sur CI verte + revue.
Rejoindre le projet : `/onboard` après le clone.

## Documentation
- Architecture : `docs/ARCHITECTURE.md`
- Règles non-négociables : `constitution.md`
- Décisions : `docs/adr/`
- Design : `docs/design-language.md`
