# Spec — Module auth

> **QUOI et POURQUOI.** À écrire avant de coder. C'est le contrat du module.

- **Owner** : @Redac777
- **Dépendances** : aucune
- **Statut** : Validé (specs initiales) — les détails d'implémentation se préciseront à la construction

## Rôle
Gérer les comptes et les rôles du staff (gérant, chef, serveur) et fournir la **session client anonyme**
liée au QR de table (le client ne crée pas de compte).

## User stories
- En tant que **gérant**, je veux créer un compte et me connecter, afin d'accéder à la configuration de mon restaurant.
- En tant que **chef / serveur**, je veux me connecter avec le compte créé pour moi, afin d'accéder à ma vue.
- En tant que **client**, je veux commander sans créer de compte, afin d'aller vite (je scanne un QR et je saisis juste mon prénom).

## Fonctionnalités
- [ ] Inscription du gérant (email + mot de passe) → crée le compte + son profil (rôle `gérant`).
- [ ] Connexion / déconnexion (staff).
- [ ] Création de comptes staff (chef, serveur) par le gérant (rôle attribué, rattaché au `restaurant_id`).
- [ ] Session client anonyme : à partir d'un token de table (QR), sans compte, avec un prénom saisi.
- [ ] Garde d'accès par rôle (un chef n'accède pas à la config, etc.).

## Règles métier
- Message d'erreur **générique** à la connexion (ne pas révéler si l'email existe).
- Chaque compte staff est rattaché à **un seul** `restaurant_id`.
- Le rôle détermine l'accès : `gérant` (config), `chef` (cuisine), `serveur` (service Premium).
- Le client anonyme n'a **aucun** accès aux données de config ; seulement au menu de sa table.

## API publique du module (`index.ts`)
- `signUp`, `signIn`, `signOut`, `getCurrentUser` (staff).
- `createStaffAccount(role)` (réservé gérant).
- `getTableSession(tableToken)` / `setClientName(name)` (client anonyme).
- `useRole()` / garde `requireRole(role)` pour les autres modules.

## Données
- `profiles` (id, restaurant_id, rôle, nom) — créé à l'inscription. Auth via Supabase Auth.
- Isolation : chaque profil ne voit que son `restaurant_id` (RLS). Le rôle ne peut pas être auto-élevé (verrou colonne).

## Hors périmètre
- La configuration du restaurant (module `restaurant`), le menu, les commandes. Auth ne fait qu'authentifier et autoriser.
