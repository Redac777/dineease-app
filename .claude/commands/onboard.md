# /onboard — rejoindre un projet déjà initialisé

> Pour un **collaborateur** qui vient de `git clone` le projet. Elle **configure son environnement**,
> elle ne **contourne** rien : l'accès reste donné côté GitHub (collaborateur + CODEOWNERS + protection
> de branche). Le script ne fait que **constater**.
>
> À ne pas confondre avec l'`init` (genèse du projet, par l'owner, une seule fois) ni avec l'ajout d'un
> collaborateur (par l'owner, côté GitHub). `/onboard` = par **chaque nouveau venu**, à son arrivée.

Quand je lance `/onboard`, déroule ces étapes dans l'ordre, en français, tutoiement, sans em dashes.

## 1. Se placer sur la branche d'intégration
`git checkout dev_branch` (c'est là que vit le travail courant et l'outillage). Si la branche n'existe
pas en local, `git fetch origin && git checkout -b dev_branch origin/dev_branch`.

## 2. Préparer le `.env` (sans jamais écraser des secrets)
- Si `.env` **n'existe pas** : copie `.env.example` → `.env`, puis **demande** à la personne d'y coller
  son **PAT classic** (`ghp_…`, scope `repo`) dans `GITHUB_TOKEN`, plus les éventuelles clés de service
  (Supabase, etc.). Rappelle : un **fine-grained** ne marche pas sur le repo perso d'un autre compte.
- Si `.env` **existe déjà** : n'y touche pas (idempotent). Signale juste les variables encore vides.
- Ne saisis **jamais** une valeur secrète toi-même ; `.env` reste gitignoré.

## 3. Installer les dépendances
`npm install` (ou la commande d'install figée par le projet).

## 4. Vérifier l'identité et l'accès réels (le cœur)
Lance `node scripts/onboard-check.mjs`. Il renvoie un JSON : `me` (login **réel** déduit du token, pas
du nom tapé), `tokenType` (`classic` / `fine-grained`), `permission`, `inCodeowners`, `myModules` (les
modules qui lui sont affectés dans CODEOWNERS), `canWrite`, `ok`, `warnings`.

Interprète-le pour la personne :
- **`ok: true`** → « Tu es bien **@`me`**, accès `write` confirmé sur le repo, présent dans CODEOWNERS.
  **Tes modules : `myModules`** (c'est ton périmètre : tu codes ici, un module à la fois). » Si
  `myModules` est vide alors que `ok` est vrai, dis-le : « tu es collaborateur mais aucun module ne
  t'est encore affecté, demande à l'owner de te lancer `/add-collab` ». Enchaîne sur l'étape 5.
- **`ok: false`** → **n'invente pas de contournement**. Lis les `warnings` et explique quoi corriger :
  - token **fine-grained** → demander un **PAT classic** (`ghp_`, scope `repo`) et le remettre dans `.env` ;
  - **login absent de CODEOWNERS** ou **`canWrite: false`** → ce n'est pas à toi de le régler :
    **l'owner** doit t'ajouter comme collaborateur (droits Write) et dans CODEOWNERS. Dis-le clairement.
  - **CODEOWNERS introuvable** → tu n'es probablement pas sur `dev_branch` (reviens à l'étape 1).

L'identité fait **foi par le token**, jamais par le nom tapé : si le login réel ne correspond pas à la
personne attendue, arrête-toi et signale-le.

## 5. Ancrer ton périmètre pour les prochaines sessions (`CLAUDE.local.md`)
Pour que ton Claude se concentre **automatiquement** sur tes modules à **chaque** session (pas seulement
maintenant), écris un bloc de cadrage dans `CLAUDE.local.md` à la racine. Ce fichier est **gitignoré**
(perso, jamais poussé) et **chargé automatiquement** au début de chaque session.

- Ne le fais que si `ok: true` **et** `myModules` non vide (sinon rien à cadrer : dis-le et passe).
- **Idempotent** : si `CLAUDE.local.md` existe déjà, remplace **uniquement** le bloc entre les marqueurs
  `onboard:scope` (ne duplique pas, ne touche pas au reste du fichier).
- Déduis des noms de modules lisibles depuis `myModules` (ex. `/src/modules/tables/` → `tables`).

Bloc à écrire dans `CLAUDE.local.md` (remplace `<me>` et la liste par les vraies valeurs) :

<!-- onboard:scope:start -->
## Mon périmètre (généré par /onboard — perso, jamais poussé)
- **Je suis** : @<me>
- **Mes modules** : <liste, ex. tables, ordering>
- **Règle** : je travaille **uniquement** dans mes modules, **un seul à la fois**. Je ne touche pas au
  module d'un autre owner. Si une tâche l'exige vraiment, j'ouvre une PR dédiée : elle sera **bloquée**
  tant que l'owner de la zone ne l'a pas approuvée (modèle owner-gated). Je le signale à l'humain plutôt
  que d'agir hors de ma zone.
- **Démarrer une tâche** : `scripts/new-task.sh <type> <un-de-mes-modules> <ma-persona>`, puis je suis
  la boucle de travail du `CLAUDE.md`.
<!-- onboard:scope:end -->

Confirme à la personne : « Ton périmètre est ancré dans `CLAUDE.local.md` : ton assistant s'y tiendra à
chaque session. »

## 6. Vérifier que l'écoute des PR marche
Lance `node scripts/pr-inbox.mjs` : le champ `me` doit afficher le bon compte. Si oui, propose de rester
à l'écoute avec `/loop 5m /pr-watch`. Termine par un récap : branche, identité confirmée, accès, et la
boucle de travail (voir `CLAUDE.md`) pour démarrer une tâche (`scripts/new-task.sh`).

## Prérequis / notes
- Un **PAT classic** (`ghp_…`, scope `repo`) dans `.env` (`GITHUB_TOKEN`). Le fine-grained échoue en
  écriture sur le repo d'un autre compte.
- `/onboard` ne donne aucun droit : il **constate** ce que l'owner a déjà accordé côté GitHub.
