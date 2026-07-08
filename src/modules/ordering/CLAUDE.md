# CLAUDE.md — Module ordering

> Contrat du module (niveau 2). Chargé quand une session travaille dans ce dossier. Complète le
> `CLAUDE.md` racine, ne le contredit pas.

## Rôle
Parcours client : menu theme, panier de table partage, envoi de commande, suivi temps reel.

- **Owner** : @Redac777
- **Dépendances autorisées** : menu, tables (via leur API publique `index.ts` uniquement)

## Frontière (à respecter absolument)
- Je ne modifie **que** ce module. Pour toucher un autre module → PR + revue de son owner.
- J'expose au reste du projet **uniquement** ce qui est dans `index.ts`.
- Je n'importe jamais l'intérieur d'un autre module.

## Où est quoi
- Spec : `docs/specs/ordering/spec.md` (+ `plan.md`, `design.md`, `test-plan.md`)
- Design / maquettes : `design/ordering/`
- Tests : à côté du code (`*.test.ts`)

## Rappel : Definition of Done
Toute fonctionnalité de ce module = 3 niveaux de test verts (unitaire + général + sécurité) avant PR.
Voir le `CLAUDE.md` racine.
