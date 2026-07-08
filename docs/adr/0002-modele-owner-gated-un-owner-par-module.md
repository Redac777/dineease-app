# ADR 0002 — Modèle de revue « owner-gated » : un seul owner par module

- **Statut** : Accepté
- **Date** : 2026-07-08
- **Auteur** : reda
- **Module(s) concerné(s)** : global (gouvernance / collaboration)

## Contexte
En passant d'une simulation à compte unique à une vraie équipe (ajout du collaborateur
`@mbaghireda-001` sur `tables` et `ordering`), il fallait figer le modèle de revue. La constitution
impose déjà « **un module = un owner** » et « revue de l'owner » pour toute intrusion. Deux réglages
GitHub restaient à trancher : le nombre d'approbations requises et l'exigence de revue code-owner.

Une première tentative a réglé `required_approving_review_count = 1` avec
`require_code_owner_reviews = false`, et a laissé l'owner en co-propriétaire des modules confiés. Ce
couple est incohérent avec « un owner par module » : il ne gate pas réellement sur l'owner, et il
bloque un owner unique sur sa propre PR (interdiction GitHub de s'auto-approuver, aucun 2e owner pour
approuver). Voir `docs/mistakes-log.md`.

## Décision
On adopte le modèle **owner-gated** :
- **CODEOWNERS : exactement un owner par module** (pas de co-propriété par défaut).
- **`require_code_owner_reviews = true`** sur `main` et `dev_branch` : toute PR qui touche une zone
  exige l'approbation de l'owner de cette zone.
- **`required_approving_review_count = 0`** : le gate vient du code-owner, pas d'un compteur
  d'approbations aveugle.

Effet : l'owner d'un module **self-merge** ses propres PR sur sa zone (aucun autre owner à solliciter) ;
une PR d'un **non-owner** sur cette zone est **bloquée tant que l'owner n'a pas approuvé**.

## Alternatives envisagées
- **`approvals = 1` + co-owners** — écartée : impose une 2e paire d'yeux sur *chaque* PR, y compris
  celles de l'owner sur sa propre zone, ce qui exige ≥2 owners par zone protégée pour ne pas se
  bloquer. Contraire à « un module = un owner » et au self-merge voulu.
- **`approvals = 1` + un seul owner** — écartée : deadlock, l'owner unique ne peut pas approuver sa
  propre PR et personne d'autre n'est owner de la zone.
- **`require_code_owner_reviews = false`** — écartée : CODEOWNERS ne fait alors que *suggérer* le
  reviewer, sans bloquer ; l'intrusion dans la zone d'un autre n'est pas réellement gardée.

## Conséquences
- Facilite : chaque owner est maître de sa zone, self-merge fluide, gate réel sur les intrusions.
- Coût / compromis : pas de double relecture systématique sur la zone d'un owner (assumé ; la CI +
  `/security-review` + les 3 niveaux de test restent obligatoires). Monter les approbations ≥1 un jour
  exigera d'abord ≥2 owners réels par zone protégée.
- Bord GitHub à valider : le self-merge d'un owner **unique** sur sa zone (auteur = seul code-owner)
  repose sur le comportement de GitHub avec `approvals = 0`. À confirmer par un test réel dès que le
  collaborateur est actif (PR triviale sur sa zone → merge autorisé sans approbation externe). L'owner
  du repo garde de toute façon le bypass admin (`enforce_admins = false`).
- Impact CI : aucun. Les status checks (`check-deps`, `check-scope`, typecheck, tests, gitleaks)
  restent requis et inchangés.
- Scripts alignés : `scripts/add-collab.mjs` (défaut `approvals = 0` + force
  `require_code_owner_reviews = true`) et la doc de collaboration (`CONTRIBUTING.md`, `CLAUDE.md`,
  `/add-collab`).
