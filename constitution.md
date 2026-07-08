# Constitution — DineEase
# Standards non-négociables. Toute PR qui viole ces règles est refusée.

> La différence avec `CLAUDE.md` : le CLAUDE.md **guide** (comment travailler), la constitution
> **interdit** (ce qu'on ne fait jamais). Court, stable, rarement modifié (et seulement par ADR).

## Langage & framework
- TypeScript strict. Pas de `any`, pas de `@ts-ignore`.
- Framework imposé : Next.js (App Router). On ne mélange pas les paradigmes.
- Styling : Tailwind CSS (+ variables CSS pour le thème par restaurant) uniquement. Pas d'autre librairie de style.
- Base de données via Supabase (PostgreSQL). Pas de requête brute hors migrations.

## Standards de code
- Composants fonctionnels / hooks. Pas de logique dupliquée entre modules.
- **Exports nommés uniquement** (sauf pages/layouts imposés par Next.js).
- **Validation Zod à toutes les frontières** (entrées API, formulaires, params de route).
- Gestion d'erreur explicite. On n'avale jamais une erreur en silence.
- Pas de `console.log` dans le code livré (logger dédié).

## Règles d'architecture
- **Un module ne touche pas l'intérieur d'un autre.** Communication via l'API publique (`index.ts`).
- **Un agent = un module à la fois.** Les changements inter-modules passent par une PR + revue de l'owner.
- Les secrets ne sont jamais dans le code. Uniquement dans `.env` (gitignoré).
- **Isolation multi-tenant** : toute table métier porte un `restaurant_id` protégé par RLS. Un
  restaurant ne lit/écrit jamais les données d'un autre. La clé `service_role` ne sort jamais du serveur.

## Dépendances approuvées
Liste faisant foi : le gate CI `scripts/check-deps.mjs` fait **échouer la PR** si le `package.json`
s'en écarte. Une dépendance par ligne ; `# ...` = commentaire ; `@types/*` accepté.

<!-- deps-allowlist:start -->
# Runtime
next
react
react-dom
@supabase/supabase-js
@tanstack/react-query
zustand
zod
node-vibrant
qrcode
# Styling
tailwindcss
postcss
autoprefixer
# Langage / outils
typescript
eslint
eslint-config-next
# Tests
vitest
@vitejs/plugin-react
@playwright/test
# Types (motif lu par la machine)
@types/*
<!-- deps-allowlist:end -->

- Toute dépendance hors de cette liste exige l'accord de l'équipe (ASK FIRST + ADR), **puis on
  l'ajoute ici dans le même changement** (sinon le gate CI bloque). Le prestataire de paiement
  (module `billing`) sera ajouté ici quand il sera choisi (voir sa spec).

## Tests (voir la Règle des 3 niveaux dans CLAUDE.md)
- **Toute fonctionnalité terminée** est couverte par : un test unitaire + un test général/intégration
  + une vérification de sécurité. Pas d'exception silencieuse.
- Framework unitaire : Vitest. Général : Playwright.

## Sécurité
- Aucun secret dans le code. `.env` pour le local, secrets CI dans les réglages GitHub.
- Auth exigée sur toutes les routes/données sensibles. Ne jamais faire confiance aux données client :
  valider avec Zod côté serveur.
- `/security-review` avant chaque merge. Scripts de test sécurité pour toute surface exposée (isolation
  RLS multi-tenant en priorité).

## Simplicity gate
- Justifie tout nouveau module, couche ou abstraction. Pas d'optimisation prématurée.
- **Si la spec ne le demande pas, on ne le construit pas.**
