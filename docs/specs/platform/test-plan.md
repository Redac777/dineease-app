# Plan de tests — Module platform

> La **Règle des 3 niveaux** appliquée au module. Toute fonctionnalité terminée coche les 3 avant
> d'être « done » et avant d'ouvrir la PR. Voir `CLAUDE.md` §Règle des 3 niveaux.

## Niveau (a) — Tests unitaires  ·  `npm test`
La logique isolée de chaque fonctionnalité.
- [ ] <fonctionnalité> : cas nominal
- [ ] <fonctionnalité> : cas limite / erreur

## Niveau (b) — Tests généraux / intégration  ·  npm run test:e2e
Le flux complet vécu par l'utilisateur (UI → données → UI).
- [ ] <parcours> de bout en bout

## Niveau (c) — Sécurité
- [ ] `/security-review` passé sans finding bloquant
- [ ] Si surface exposée (API / auth / données) : scripts de test dans `security/` couvrant
      isolation (chaque utilisateur ne voit que ses données), escalade de privilège, accès anonyme
- [ ] Aucune donnée sensible en clair, validation Zod côté serveur

## Definition of Done du module
Les 3 niveaux verts pour **chaque** fonctionnalité listée dans `spec.md`, docs à jour, PR ouverte.
