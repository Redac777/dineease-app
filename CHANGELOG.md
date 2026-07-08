# Changelog — DineEase

> Historique des changements, dérivé des titres de Pull Requests (squash merge). Le plus récent en
> haut. On n'écrit pas ce fichier à la main ligne par ligne : chaque PR mergée y ajoute son titre.
> Format inspiré de [Keep a Changelog](https://keepachangelog.com/), versions en [SemVer](https://semver.org/).

## [Non publié]
### Ajouté
- feat(auth): couche logique du module auth (validation Zod + service à gateway injectée, message
  générique anti-énumération) + 6 tests unitaires ; ADR-0001 (logique d'abord). Config Vitest + install
  des dépendances de la stack.

### Modifié
- chore(gouvernance): adopte le modèle de revue **owner-gated** (un seul owner par module,
  `require_code_owner_reviews=true` + `required_approving_review_count=0`) ; ADR-0002. Aligne
  `add-collab.mjs`, `/add-collab`, `CONTRIBUTING.md` et `CLAUDE.md`. `@mbaghireda-001` devient owner
  unique de `tables` et `ordering`.

### Corrigé
- chore(collab): retire la co-propriété par défaut introduite en ajoutant `@mbaghireda-001` (violait
  « un module = un owner ») et corrige la protection de branche (`approvals=1`/code-owner non exigé →
  modèle owner-gated). Voir `docs/mistakes-log.md`.

---

<!--
Convention : à chaque release, on déplace les entrées de "Non publié" sous une version datée, ex.

## [0.1.0] - 2026-07-08
### Ajouté
- feat(clients): CRUD clients (#12)
-->
