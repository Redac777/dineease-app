# ADR 000 — Comment on écrit une décision (le processus)

## C'est quoi un ADR ?
Un **Architecture Decision Record** = une décision importante = **un petit fichier**. Numéroté et
daté. Exemple : `001-choix-supabase.md`.

## Pourquoi un fichier par décision ?
Parce qu'en équipe, un gros journal unique que tout le monde édite crée des **conflits de merge** en
permanence. Un fichier par décision = deux personnes n'écrivent jamais dans le même fichier = **zéro
conflit**. C'est la mémoire durable des *pourquoi* du projet.

## Quand écrire un ADR ?
Dès qu'une décision est **structurante ou difficile à revenir en arrière** : choix d'une techno, d'un
schéma de données, d'une convention d'architecture, d'un compromis important. Une correction de bug
banale n'a pas besoin d'ADR.

## Comment ?
1. Copie `0000-template.md`.
2. Renomme-le avec le prochain numéro libre + un titre court en kebab-case (ex. `002-strategie-branches.md`).
3. Remplis les sections. Garde ça court (une page suffit).
4. Commite-le (`docs(adr): ...`) et référence-le dans la PR concernée.

## Statuts possibles
`Proposé` → `Accepté` → (plus tard) `Remplacé par ADR-NNN` ou `Déprécié`.
On ne supprime pas un ADR obsolète : on le marque `Remplacé` et on pointe vers le nouveau.
