# Spec — Module restaurant

> **QUOI et POURQUOI.** À écrire avant de coder. C'est le contrat du module.

- **Owner** : @Redac777
- **Dépendances** : auth
- **Statut** : Validé (specs initiales)

## Rôle
Le **tenant** : onboarding d'un restaurant (nom, logo), génération de son **thème** (couleurs déduites
du logo), et garant de l'**isolation multi-restaurant** (chaque resto = son espace).

## User stories
- En tant que **gérant**, je veux renseigner le nom et le logo de mon restaurant, afin d'obtenir un espace à mon image.
- En tant que **gérant**, je veux que l'app génère automatiquement des couleurs à partir de mon logo, afin de ne pas avoir à les choisir.
- En tant que **gérant**, je veux ajuster le thème (palette auto, palettes préréglées, clair/sombre), afin qu'il me convienne.

## Fonctionnalités
- [ ] Créer / éditer le profil restaurant (nom, logo uploadé dans Supabase Storage).
- [ ] Extraire la palette du logo (`node-vibrant`) et générer le thème (variables CSS `--color-primary`…).
- [ ] Choisir parmi 4-6 palettes préréglées ou garder l'auto ; bascule clair/sombre.
- [ ] Exposer le thème résolu aux autres modules (structure fixe, couleurs variables).

## Règles métier
- Un `restaurant_id` par restaurant ; toutes les données métier des autres modules le référencent.
- La **structure/layout ne change pas** entre restos ; seules les couleurs varient.
- Le logo est stocké dans Storage ; l'URL est publique, les couleurs dérivées sont persistées.

## API publique du module (`index.ts`)
- `createRestaurant(input)` / `updateRestaurant(input)`.
- `getRestaurant(restaurantId)` / `getCurrentRestaurant()`.
- `getTheme(restaurantId)` (couleurs résolues) / `usePresetPalettes()`.

## Données
- `restaurants` (id, nom, logo_url, palette/couleurs, palier de licence). Storage : bucket `logos`.
- Isolation RLS : le gérant ne lit/écrit que son restaurant.

## Hors périmètre
- Les comptes/rôles (module `auth`), le menu, les tables, la facturation (module `billing`).
