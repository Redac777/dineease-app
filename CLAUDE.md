# CLAUDE.md — DineEase

> Fichier chargé automatiquement au début de chaque session Claude Code. C'est le **manuel
> d'opération de l'agent** : tout ce qu'il faut pour travailler seul, sans redemander à chaque étape,
> et sans refaire d'erreurs. Garde-le à jour.

## Le projet en une phrase
Plateforme web multi-restaurants : chaque restaurant loue une licence, configure son espace
personnalisé (nom, logo, thème déduit du logo), et ses clients commandent en scannant un QR code de
table. Commande de table partagée en temps réel, vue cuisine, alerte au service, suivi client live.

- **Type** : web (SaaS multi-tenant) · **Utilisateurs** : gérants, chefs, serveurs, clients · **Langue de travail** : français

## Stack
- Langage : TypeScript strict (jamais `any`, jamais `@ts-ignore`)
- Framework : Next.js (App Router)
- Base de données : Supabase (PostgreSQL) · Auth : Supabase Auth (rôles gérant/chef/serveur ; client anonyme via QR)
- Styling : Tailwind CSS + variables CSS (thème par restaurant) · État : TanStack Query (données serveur) + Zustand (état local) · Validation : Zod
- Temps réel : Supabase Realtime · Stockage : Supabase Storage (logos, images de plats)
- Autres : `node-vibrant` (couleurs du logo), `qrcode` (QR tables), Web Speech API (alerte vocale)
- Déploiement : Vercel (app) + Supabase (hébergé)

## Isolation multi-tenant (cœur du produit)
Chaque donnée métier porte un `restaurant_id`. L'isolation est garantie par **RLS PostgreSQL** : un
restaurant ne voit jamais les données d'un autre. Le thème (couleurs du logo) est appliqué via des
**variables CSS** ; la **structure/layout reste identique** pour tous (template DineEase), seules les
couleurs changent par restaurant. Voir `docs/ARCHITECTURE.md`.

## Commandes (à utiliser, pas à réinventer)
- Installer : `npm install`
- Lancer en dev : `npm run dev`
- Typecheck : `npm run typecheck` (`tsc --noEmit`)
- Lint : `npm run lint`
- Tests unitaires : `npm test` (Vitest)
- Tests généraux / intégration : `npm run test:e2e` (Playwright)
- Build : `npm run build`

## Carte des modules (bounded contexts)
Un agent travaille **dans un seul module à la fois**. Les échanges entre modules passent **uniquement**
par l'API publique du module (`index.ts`). Toucher un autre module = ouvrir une PR revue par son owner.

| Module | Rôle | Owner | Dépendances |
|---|---|---|---|
| `auth` | Comptes et rôles (gérant, chef, serveur) + session client anonyme (QR) | @Redac777 | — |
| `restaurant` | Tenant : onboarding, nom, logo, thème, isolation multi-restaurant | @Redac777 | auth |
| `menu` | Sections et plats (image, note, recommandé, best-seller, temps de prépa) | @Redac777 | restaurant |
| `tables` | Tables et génération des QR codes numérotés | @Redac777 | restaurant |
| `ordering` | Parcours client : menu thémé, panier de table partagé, suivi temps réel | @Redac777 | menu, tables |
| `kitchen` | Vue cuisine : workflow des statuts + alerte vocale | @Redac777 | ordering |
| `service` | Vue serveur (Premium) : livraison, libération de table | @Redac777 | kitchen |
| `reviews` | Notation du chef/serveur par le client (Premium) | @Redac777 | ordering, service |
| `platform` | Super-admin : gestion des restaurants et licences | @Redac777 | restaurant |
| `billing` | Abonnements et paiement (dernier module ; prestataire Maroc à définir) | @Redac777 | platform |

**Ordre de construction** : (1) `auth` + `restaurant` → (2) `menu` + `tables` → (3) `ordering` +
`kitchen` → (4) `service` + `reviews` → (5) `platform` + **`billing`** (paiement en dernier).

## Avant de coder
1. Lis la spec du module concerné : `docs/specs/<module>/spec.md` (+ `plan.md`, `design.md`, `test-plan.md`).
2. Lis le `CLAUDE.md` du module (`src/modules/<module>/CLAUDE.md`).
3. Lis `constitution.md` (règles non-négociables).
4. Regarde `docs/adr/` pour toute décision qui concerne ta zone.
5. Note-toi dans `journal/<branche>.md` (mémoire de session, gitignorée).

---

## Boucle de travail d'une tâche — le cycle A→Z (fais-le dans cet ordre, sans demander)
1. **Créer le bureau isolé** : `./scripts/new-task.sh <type> <scope> <persona>` → crée un worktree +
   une branche `<type>/<persona>/<scope>` (ex. `feat/reda/auth`) et signe les commits au nom de la
   persona. Jamais deux tâches dans le même worktree.
2. **Lire la spec** du module (`docs/specs/<module>/`) et se limiter à **un seul module**.
3. **Coder** la fonctionnalité (respecte l'API publique `index.ts`, la couche données remplaçable,
   le design language).
4. **Tester aux 3 niveaux** (voir Règle des 3 niveaux ci-dessous) : unitaire + intégration + sécurité.
5. **Vérifier en local** : `npm run typecheck` + `npm run lint` + `npm test` doivent être verts.
6. **Sécurité** : lancer `/security-review` ; si la fonctionnalité expose une surface (API, auth,
   données), écrire/mettre à jour les scripts de test sécurité dans `security/` (isolation RLS multi-tenant
   surtout : un restaurant ne doit jamais lire/écrire les données d'un autre).
7. **Commit atomique** (Conventional Commits). Push.
8. **Mettre à jour la doc** (partie du Done, voir la table ci-dessous), **dans le même diff**.
9. **Ouvrir la PR** toi-même (template rempli) via le `GITHUB_TOKEN` de `.env` : c'est une étape de la
   boucle, **pas** une permission à demander.
10. **CI verte** (`check-deps` + `check-scope` + typecheck + tests + gitleaks), revue CODEOWNERS.
11. **Merge = ASK FIRST** : ne merge JAMAIS de ta propre initiative. Propose une fois la CI verte,
    attends la **confirmation explicite** de l'humain, puis nettoie (maj branche de base, suppression
    branche + worktree).

## Après avoir fini un module ou une fonctionnalité — checklist des fichiers à mettre à jour
La doc fait partie du code livré. **Une PR qui change un module sans mettre à jour sa doc est
incomplète.** Dès que tu fais l'action de gauche, mets à jour le(s) fichier(s) de droite, dans le MÊME diff.

| Ce que tu fais | Ce que tu mets à jour |
|---|---|
| Ajouter / modifier une fonctionnalité | `docs/specs/<module>/spec.md` (fonctionnalités, règles) · `docs/specs/<module>/tasks.md` (coche) · `CHANGELOG.md` |
| Écrire / modifier des tests | `docs/specs/<module>/test-plan.md` (les 3 niveaux) |
| Changer l'API publique (`index.ts`) | section API de `spec.md` · `src/modules/<module>/README.md` |
| Ajouter / modifier un écran (UI) | `docs/specs/<module>/design.md` + déposer la maquette dans `design/<module>/` |
| Changer l'approche technique | `docs/specs/<module>/plan.md` |
| Changer la structure ou une dépendance inter-module | `docs/ARCHITECTURE.md` (arbo / carte / flux) |
| Prendre une décision structurante | un ADR `docs/adr/NNNN-titre.md` |
| Rencontrer une erreur non-évidente | `docs/mistakes-log.md` |
| Changer une règle ou une dépendance approuvée | `constitution.md` (via ADR) |
| Changer le workflow / comportement de l'agent | ce `CLAUDE.md` (+ `src/modules/<module>/CLAUDE.md` si propre au module) |

Règle simple : **le code et sa doc avancent ensemble**. Aucun placeholder `...` dans un `spec.md`
(écrire « à définir » si inconnu).

## Règle des 3 niveaux de test (NON-NÉGOCIABLE)
**Toute fonctionnalité validée et terminée est testée aux 3 niveaux avant d'être déclarée « done ».**
- **(a) Test unitaire** : au moins 1 test sur la logique isolée (`npm test`, Vitest).
- **(b) Test général / intégration** : le flux complet (`npm run test:e2e`, Playwright).
- **(c) Test de sécurité** : `/security-review` passé, + suite de scripts sécurité si surface exposée
  (isolation RLS multi-tenant, escalade de privilège, accès anonyme).
Tant que les 3 ne sont pas verts, la fonctionnalité n'est **pas** terminée : n'ouvre pas la PR.

## Definition of Done (par fonctionnalité)
typecheck + lint verts · **3 niveaux de test verts** · `/security-review` passé · un seul module
touché · **doc du module à jour** + CHANGELOG (+ ADR / mistakes-log si besoin) · PR ouverte avec le
template rempli. Tant que ce n'est pas coché, **continue** au lieu de rendre la main.

---

## Accès et secrets (règle non-négociable)
- Toute donnée d'accès (URL/clés Supabase, `GITHUB_TOKEN`, clés du prestataire de paiement) se lit
  **uniquement** depuis `.env`, **jamais en dur** dans le code.
- L'agent cherche d'abord la variable dans `.env` (référence : `.env.example`), l'utilise si elle est
  renseignée, et **demande à l'utilisateur** de la fournir (en nommant la variable exacte) si elle est
  absente ou vide.
- La clé `service_role` de Supabase est **serveur uniquement**, jamais exposée au client. Ce qui est
  préfixé `NEXT_PUBLIC_` est visible du navigateur : n'y mets jamais un secret.

## Commits (Conventional Commits)
Format : `type(scope): résumé court` — types : `feat|fix|refactor|chore|docs|test|style|ci`.
Un commit = **un seul** changement logique. Jamais de secret ni de `.env`. Jamais de `console.log`.

## Quand agir seul vs demander

### ALWAYS DO (agis directement, ne demande pas)
- Corriger un bug, choisir la mise en œuvre **dans le périmètre de la spec**, écrire les tests, commiter.
- Suivre la boucle de travail jusqu'au bout, **ouvrir la PR toi-même**.

### ASK FIRST (demande avant)
- **Merger une PR** (jamais de ta propre initiative — propose, attends le OK).
- Ajouter une dépendance hors de la liste approuvée (`constitution.md`).
- Changer le schéma de la base de données ou une policy RLS.
- Modifier une décision d'architecture ou la signature d'une API publique.
- Toute action irréversible (suppression, force-push, envoi externe).

### NEVER DO
- Commiter un secret / `.env`, ou mettre un identifiant en dur au lieu de le lire depuis `.env`.
- Pousser directement sur `main`. · Utiliser `any` en TypeScript.
- Modifier le module d'un autre owner sans PR + revue. · Laisser une fonctionnalité sans ses 3 tests.
- Exposer la clé `service_role` côté client.

---

## Modèle de mémoire (où va quoi)
- **Décision importante** → un ADR : `docs/adr/NNNN-titre.md`.
- **Erreur non-évidente** → une entrée dans `docs/mistakes-log.md` (la faute + la règle qui l'évite).
- **État d'un module** → sa spec `docs/specs/<module>/`, tenue à jour.
- **Historique** → `CHANGELOG.md` (dérivé des titres de PR).
- **Notes de session** → `journal/<branche>.md` (gitignoré, éphémère, jamais poussé).
Règle d'or : rien d'important ne reste seulement dans `journal/`. Promeus-le avant d'ouvrir la PR.

## Collaboration
- Ajouter un collaborateur (owner) : `/add-collab` (handle + modules → CODEOWNERS par PR, **owner unique** par module + accès Write + modèle owner-gated `approvals=0` + `require_code_owner_reviews=true`, voir ADR-0002).
- Retirer un collaborateur (owner) : `/remove-collab` (réaffecte les modules orphelins avant de retirer).
- Rejoindre le projet (nouveau venu) : `/onboard` après le clone.
- Rester à l'écoute des PR : `/pr-watch` (l'humain tranche toujours).

## Pointeurs
- Règles non-négociables : `constitution.md`
- Workflow détaillé (branches, worktrees, PR, collaborateurs) : `CONTRIBUTING.md`
- Architecture : `docs/ARCHITECTURE.md` · Design : `docs/design-language.md`
- Erreurs à ne pas refaire : `docs/mistakes-log.md`
