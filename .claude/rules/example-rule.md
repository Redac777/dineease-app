# Règle glob-scoped (niveau 3) — exemple commenté

> Les règles de ce dossier se déclenchent **seulement** quand l'agent édite un fichier qui matche le
> glob déclaré. Ça évite de charger tout le contexte tout le temps : la bonne règle apparaît au bon
> moment. (Inspiré du système `.claude/rules/` d'Anjana.)

---
globs: "src/modules/**/data/**"
---

## Exemple : règle sur la couche données
Quand tu édites la couche données d'un module (`data/`) :
- Valide toutes les entrées avec le validateur du projet avant d'écrire en base.
- Ne mets jamais de secret en dur ; lis-les depuis l'environnement.
- Remonte les erreurs (ne les avale pas) pour ne pas masquer un échec d'écriture.

<!-- Duplique ce fichier pour d'autres zones sensibles (migrations, auth, prompts...) en changeant le
glob et le contenu. -->
