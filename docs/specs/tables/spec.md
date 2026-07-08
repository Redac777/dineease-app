# Spec — Module tables

> **QUOI et POURQUOI.** À écrire avant de coder. C'est le contrat du module.

- **Owner** : @Redac777
- **Dépendances** : restaurant
- **Statut** : Validé (specs initiales)

## Rôle
Gérer les tables du restaurant et **générer les QR codes** numérotés (un par table), imprimables.

## User stories
- En tant que **gérant**, je veux indiquer combien j'ai de tables, afin que l'app génère un QR par table.
- En tant que **gérant**, je veux imprimer les QR codes numérotés, afin de les coller sur les tables.

## Fonctionnalités
- [ ] Saisir le **nombre de tables** → crée N tables numérotées (1..N), chacune avec un `id` et un token.
- [ ] Générer un **QR code** par table (`qrcode`), encodant l'URL de commande (`restaurant_id` + table).
- [ ] Vue imprimable des QR (numéro visible).
- [ ] Ajouter / retirer une table individuellement.

## Règles métier
- Chaque table a un **numéro unique** dans le restaurant et un **token** non devinable (sécurité du lien client).
- Le QR pointe vers une route publique (ex. `/t/<restaurant>/<tableToken>`), sans exposer de secret.
- L'**état** d'une table (libre / occupée) est piloté par le cycle de commande (voir `ordering` / `service`).

## API publique du module (`index.ts`)
- `generateTables(restaurantId, count)` / `addTable` / `removeTable`.
- `listTables(restaurantId)` / `getTableByToken(token)` (résolution client).
- `getTableQrCode(tableId)` (image QR) / `setTableStatus(tableId, status)`.

## Données
- `tables` (id, restaurant_id, numéro, token, statut). Isolation RLS par `restaurant_id` ; `getTableByToken` en lecture publique restreinte au strict nécessaire.

## Hors périmètre
- Le contenu du menu (module `menu`), la prise de commande (module `ordering`).
