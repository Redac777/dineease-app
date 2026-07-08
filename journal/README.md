# journal/ — Mémoire de session (gitignorée)

Ce dossier contient les **notes de travail par tâche / par dev**. C'est de la mémoire **éphémère et
personnelle** : elle n'est **jamais poussée** (voir `.gitignore`). Elle sert à l'agent pendant une
tâche (contexte, pistes, todo du moment).

## Convention
- Un fichier par branche : `journal/<branche>.md` (ex. `journal/feat-reda-clients.md`).

## Règle d'or (importante)
**Rien d'important ne reste seulement ici.** Ce qui doit survivre à la tâche est **promu** avant
d'ouvrir la PR :
- une décision → un ADR (`docs/adr/`)
- une erreur non-évidente → `docs/mistakes-log.md`
- l'état d'un module → sa spec (`docs/specs/<module>/`)
- un changement livré → `CHANGELOG.md`

Ainsi on garde une mémoire durable partagée, sans le journal monolithique qui crée des conflits en équipe.
