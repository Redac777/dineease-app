# Plan technique — Module ordering

> **COMMENT.** L'approche technique pour réaliser la spec. À écrire après `spec.md`, avant de coder.

## Approche
Comment on s'y prend, en quelques points. (Composants, écrans, couche données.)

## Structure de fichiers prévue
```
src/modules/ordering/
├── index.ts            # API publique
├── components/         # UI du module
├── data/               # couche données (repository) — seul endroit qui parle à Supabase (PostgreSQL)
├── types.ts
└── ordering.test.ts
```

## Couche données
Tables / requêtes utilisées, validation Zod aux frontières, gestion d'erreur.

## Interactions avec les autres modules
Via quelles API publiques ? (Rappel : jamais d'import de l'intérieur d'un autre module.)

## Risques / points d'attention
- ...
