# Spec — Module menu

> **QUOI et POURQUOI.** À écrire avant de coder. C'est le contrat du module.

- **Owner** : @Redac777
- **Dépendances** : restaurant
- **Statut** : Validé (specs initiales)

## Rôle
Gérer le menu du restaurant : **sections** (ex. Plats, Boissons) et **plats**, configurés par le gérant.

## User stories
- En tant que **gérant**, je veux créer des sections et y ajouter des plats, afin de composer mon menu.
- En tant que **gérant**, je veux éditer/supprimer un plat, afin de tenir mon menu à jour.
- En tant que **gérant**, je veux marquer un plat « recommandé » ou « best-seller », afin de le mettre en avant.

## Fonctionnalités
- [ ] CRUD **section** (nom, ordre d'affichage).
- [ ] CRUD **plat** : nom, description, image (upload gérant ; génération IA en secours, phase 2), note, `recommandé` (booléen), `best-seller` (booléen), **temps de préparation** (minutes).
- [ ] Réordonner sections et plats.
- [ ] Image du plat = **URL** (source interchangeable : upload / IA / 3D plus tard).

## Règles métier
- Un plat appartient à une section, qui appartient à un `restaurant_id`.
- Le **temps de préparation** alimente l'estimation de temps côté commande (module `ordering`).
- Validation Zod (nom requis, temps ≥ 0, note entre 0 et 5).

## API publique du module (`index.ts`)
- `listSections(restaurantId)` / `createSection` / `updateSection` / `deleteSection`.
- `listDishes(sectionId)` / `createDish` / `updateDish` / `deleteDish`.
- `getMenu(restaurantId)` (menu complet structuré, consommé par `ordering`).

## Données
- `menu_sections` (id, restaurant_id, nom, ordre).
- `dishes` (id, section_id, restaurant_id, nom, description, image_url, note, recommande, best_seller, prep_minutes).
- Isolation RLS par `restaurant_id`. Images dans Storage (bucket `dishes`).

## Hors périmètre
- La prise de commande et l'affichage client (module `ordering`), les tables/QR (module `tables`).
