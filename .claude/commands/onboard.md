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

## 5. Vérifier que l'écoute des PR marche
Lance `node scripts/pr-inbox.mjs` : le champ `me` doit afficher le bon compte. Si oui, propose de rester
à l'écoute avec `/loop 5m /pr-watch`. Termine par un récap : branche, identité confirmée, accès, et la
boucle de travail (voir `CLAUDE.md`) pour démarrer une tâche (`scripts/new-task.sh`).

## Prérequis / notes
- Un **PAT classic** (`ghp_…`, scope `repo`) dans `.env` (`GITHUB_TOKEN`). Le fine-grained échoue en
  écriture sur le repo d'un autre compte.
- `/onboard` ne donne aucun droit : il **constate** ce que l'owner a déjà accordé côté GitHub.
