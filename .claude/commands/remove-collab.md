# /remove-collab — retirer un collaborateur du projet (côté OWNER)

> Pour **l'owner** uniquement. Retire l'accès d'une personne **et** garantit qu'aucun module ne reste
> orphelin (sans owner réel), ce qui laisserait un périmètre non gardé. L'ordre est imposé :
> **réaffecter d'abord, retirer ensuite.**

Quand je lance `/remove-collab`, déroule ces étapes en français, tutoiement, sans em dashes.

## 1. Analyser (avant de toucher à quoi que ce soit)
Demande le **handle** à retirer, puis lance :
```
node scripts/remove-collab.mjs <handle> check
```
Il renvoie `modulesOwned` (ses modules) et `orphanedModules` (ceux dont il est le **seul** owner). Annonce
clairement à l'owner ce qui va devenir orphelin.

## 2. Réaffecter les modules orphelins (par PR, jamais en direct)
S'il y a des `orphanedModules`, **il faut les réaffecter avant de retirer la personne** :
1. `./scripts/new-task.sh chore remove-collab-<handle>` (ou une branche `chore/<owner>/remove-collab-<handle>`).
2. Édite `.github/CODEOWNERS` : réaffecte chaque module orphelin à l'owner (ou à un autre collaborateur).
   Propose une répartition, laisse l'owner choisir. **Valide** (`codeowners/errors`) : zéro `unknown owner`.
3. Commit, pousse, **ouvre la PR**, et merge-la **après confirmation** de l'owner (avant l'étape 3 ci-dessous).

S'il n'y a aucun module orphelin, passe directement à l'étape suivante.

## 3. Retirer l'accès + ajuster les approbations
Quand CODEOWNERS ne référence plus le handle sur un module en solo :
```
node scripts/remove-collab.mjs <handle> remove          # retire l'accès GitHub
# si tu retombes à un seul vrai compte, remets les approbations à 0 pour ne pas te bloquer :
node scripts/remove-collab.mjs <handle> remove 0
```
Le script **refuse** de retirer tant qu'un module reste orphelin (garde-fou) : il te renverra à l'étape 2.
Lis le JSON, annonce les `steps` et les `warnings`.

## 4. Clôturer
Rappelle à l'owner : si la personne avait un travail en cours (branches, PR ouvertes), décider quoi en
faire (reprendre, fermer). Consigne le retrait dans le `CHANGELOG` si pertinent.

## Prérequis
- Être l'**owner**, avec un **PAT classic** (`ghp_…`, scope `repo`) dans `.env`.
- Réaffecter **avant** de retirer : le script bloque sinon (aucun module ne doit rester sans owner réel).
