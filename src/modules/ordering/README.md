# Module ordering

Parcours client : menu theme, panier de table partage, envoi de commande, suivi temps reel.

## User story
En tant que gerants, chefs, serveurs, clients, je veux ... afin de ...

## API publique (`index.ts`)
Ce que ce module expose au reste du projet :
- `...`

## Structure
```
ordering/
├── index.ts            # API publique (seul point d'entrée pour les autres modules)
├── components/
├── data/               # couche données remplaçable
├── types.ts
└── ordering.test.ts
```

## Owner
@Redac777 — toute PR touchant ce module réclame sa revue (CODEOWNERS).
