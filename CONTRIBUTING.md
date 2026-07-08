# CONTRIBUTING — DineEase

Tout le workflow de collaboration en une page. À lire avant de contribuer. Valable pour les humains
comme pour les agents IA.

## Principe : 2 natures de fichiers
- **Loi partagée** (versionnée, modifiée uniquement par PR) : `CLAUDE.md`, `constitution.md`, specs,
  `docs/`, `.github/`, design-language. Comme du code : on ne la change qu'en PR.
- **Mémoire perso / session** (gitignorée, jamais poussée) : `journal/`, `.env`, `CLAUDE.local.md`,
  `.claude/settings.local.json`.

## Une tâche = une branche = un worktree = une session d'agent
On ne lance jamais deux agents sur le même dossier. Chacun son bureau isolé (git worktree).

```bash
./scripts/new-task.sh feat clients reda   # worktree isolé + branche feat/reda/clients, commits signés "reda"
```

Le 3e argument (la **persona**) est obligatoire : il nomme la branche ET fixe l'identité Git du
worktree, pour qu'on sache toujours qui travaille (voir §personas).

- **Nommage des branches** : `type/persona/scope` — ex. `feat/reda/clients`, `fix/amine/filtres`.
- Types : `feat | fix | refactor | chore | docs | test | ci`.
- Commits fréquents et petits ; le bruit sera absorbé par le **squash merge**.

## Le cycle complet
1. `new-task.sh` → worktree + branche.
2. Coder **un seul module**, en suivant sa spec (`docs/specs/<module>/`).
3. **Tester aux 3 niveaux** (unitaire + général + sécurité) — non-négociable.
4. `/security-review` + scripts sécurité si surface exposée.
5. Commit (Conventional Commits) + push.
6. Mettre à jour la mémoire durable (spec, CHANGELOG, ADR/mistakes-log si besoin).
7. Ouvrir la **PR** vers `dev_branch` (ou `main`) avec le template rempli.
8. CI verte + revue de l'owner (CODEOWNERS) → merge (squash) → branche supprimée.

## Protection de `main`
- Pas de push direct : **PR obligatoire**.
- **CI verte obligatoire** avant merge. Branche à jour avant merge (rebase).
- Revue **CODEOWNERS** obligatoire. Squash merge + suppression auto de la branche.
- Conversations résolues avant merge.

## Modèle de revue : « owner-gated » (un module = un owner) — voir ADR-0002
Le gate de revue vient du **code-owner**, pas d'un compteur d'approbations. Réglages sur `main` et
`dev_branch` :
- **`require_code_owner_reviews = true`** : toute PR qui touche une zone exige l'approbation de
  **l'owner de cette zone**.
- **`required_approving_review_count = 0`** : pas d'approbation aveugle imposée en plus.
- On **conserve** la CI verte + les autres protections (pas de push direct, branche à jour, squash).

Conséquences concrètes :
- L'owner d'un module **self-merge** ses propres PR sur sa zone (aucun autre owner à solliciter).
- Une PR d'un **non-owner** sur cette zone est **bloquée tant que l'owner n'a pas approuvé**.

Ne PAS monter `required_approving_review_count` à 1+ : GitHub interdit d'approuver sa propre PR, donc un
owner unique se bloquerait sur sa propre zone. Exiger une 2e paire d'yeux systématique supposerait ≥2
owners réels **par zone protégée** (choix non retenu ici, voir ADR-0002).

### Simulation à compte unique (personas)
Quand une seule personne joue plusieurs devs : on garde des **personas** par convention
(`feat/devA/...`, `feat/devB/...`), CODEOWNERS attribue chaque module à un persona, et le modèle
owner-gated ci-dessus s'applique tel quel (`approvals = 0`). Le scope-guard (`check-scope.mjs`)
verrouille le territoire du code même quand CODEOWNERS ne mord pas encore (handles fictifs ignorés par
GitHub).

## Gérer les collaborateurs (comptes GitHub) — définir, ajouter, modifier
Deux notions à **ne pas confondre** :
- **Persona** : une étiquette de simulation (nomme la branche + signe les commits via `new-task.sh`).
  Ce n'est **pas** un compte GitHub.
- **Compte GitHub réel** : le handle (`@quelquun`) qui doit (1) être **collaborateur du repo** avec
  accès en écriture, et (2) figurer dans `.github/CODEOWNERS`. C'est lui qui rend la revue de
  périmètre **réelle**.

CODEOWNERS n'accepte que des comptes/équipes **réels ayant accès au repo**. Un handle inexistant est
**ignoré** par GitHub (erreur « Unknown owner », vérifiable via l'API `codeowners/errors`) : le verrou
ne s'applique alors pas. C'est pour ça qu'en simulation à compte unique, CODEOWNERS ne bloque rien.

### Ajouter un collaborateur (ou passer de personas fictifs à de vrais comptes)

**Le plus simple : la commande `/add-collab`** (côté owner). Elle t'interroge (handle réel + modules à
affecter), met à jour **CODEOWNERS par PR**, ajoute la personne en **collaborateur Write** et applique
le modèle **owner-gated** (`approvals = 0` + `require_code_owner_reviews = true`, voir ADR-0002), puis
te dit quoi transmettre au collaborateur (`clone` → `dev_branch` → `/onboard`). Le collaborateur, via
`/onboard`, voit son identité vérifiée **par son token** et **l'affichage de ses modules**.

Sous le capot (ce que fait la commande, à faire à la main si besoin) :
1. **GitHub** : inviter son handle en accès **Write** (`scripts/add-collab.mjs`, ou *Settings →
   Collaborators*). Il accepte l'invitation.
2. **CODEOWNERS** (c'est de la loi → **via PR**) : attribue-lui ses modules en **owner unique**, ex.
   `/src/modules/moduleX/   @dev-github` (pas de co-propriété par défaut, voir ADR-0002). Merge cette PR
   **avant** l'étape 3.
3. Garantis le modèle owner-gated sur `dev_branch` et `main` : `require_code_owner_reviews = true` et
   `required_approving_review_count = 0`. La revue de zone devient effective (l'owner garde le
   self-merge sur sa propre zone).
4. Vérifie : `GET /repos/<owner>/<repo>/codeowners/errors` ne doit plus renvoyer d'erreur.

### Modifier / retirer un collaborateur
- **Ajuster la répartition** d'un collaborateur existant : relance **`/add-collab`** sur son handle
  (il réédite CODEOWNERS par PR). Mets aussi à jour la table « Carte des modules » du `CLAUDE.md`.
- **Retirer** : **`/remove-collab`**. Il analyse d'abord les modules **orphelins** (dont la personne est
  le seul owner), t'impose de les **réaffecter par PR**, puis retire l'accès GitHub et peut remettre les
  approbations à 0 si tu retombes à un seul compte. À la main : sortir des *Collaborators* GitHub **et**
  réattribuer ses modules dans `.github/CODEOWNERS` (même PR).

## Périmètre mécanique : un module à la fois (scope guard)
Le check CI `scripts/check-scope.mjs` **fait échouer** une PR qui modifie plusieurs `src/modules/<X>/`
ou un module différent du scope de sa branche (`type/owner/scope`). Les fichiers partagés (docs,
CHANGELOG, config) restent libres (gouvernés par CODEOWNERS). Ça verrouille le territoire du **code**
même sans revue croisée (utile en simulation à compte unique, où CODEOWNERS ne mord pas encore).

## Revue en continu entre agents (`/pr-watch`)
Chaque personne lance sa propre session `/pr-watch` : l'agent reste **à l'écoute des PR via GitHub**
(le bus commun, jamais d'agent-à-agent direct). Il annonce les PR où ton compte est **reviewer requis**
(avec un avis) et te demande d'**approuver / refuser** ; et il te prévient quand une de **tes** PR est
débloquée (approuvée + CI verte) pour te proposer le **squash-merge**. **L'humain tranche toujours** :
l'agent n'approuve ni ne merge sans ton OK explicite. Écoute continue : `/loop 5m /pr-watch`.
Prérequis : le `GITHUB_TOKEN` du compte de chaque environnement dans son `.env`.

## Décisions et erreurs
- Décision structurante → un **ADR** : `docs/adr/NNNN-titre.md` (voir `docs/adr/000-adr-process.md`).
- Erreur non-évidente → une entrée dans `docs/mistakes-log.md`.
- Ces deux mécanismes remplacent un gros journal monolithique (qui créerait des conflits en équipe).

## Check-list PR (rappel)
- [ ] CI verte
- [ ] 3 niveaux de test verts (unitaire + général + sécurité)
- [ ] `/security-review` passé
- [ ] un seul module touché (sinon justifier)
- [ ] specs / ADR à jour, CHANGELOG mis à jour
- [ ] aucun secret / `.env`
- [ ] owner du module tagué comme reviewer
