# Module auth

Comptes et rôles du staff (gérant, chef, serveur) + session client anonyme liée au QR de table.

## User story
En tant que gérant, je veux créer un compte et me connecter, afin d'accéder à la configuration de mon restaurant.

## API publique (`index.ts`)
Ce que ce module expose au reste du projet :
- `createAuth(gateway)` → `AuthService` (`signUp`, `signIn`, `signOut`, `getCurrentUser`).
- `parseCredentials(input)` / `credentialsSchema` (validation Zod des identifiants).
- `GENERIC_SIGNIN_ERROR` (message unique de connexion, anti-énumération).
- Types : `Role`, `Credentials`, `AuthUser`, `AuthGateway`, `AuthService`, `CredentialsInput`.

## Structure
```
auth/
├── index.ts            # API publique (seul point d'entrée)
├── types.ts            # Role, Credentials, AuthUser, AuthGateway
├── validation.ts       # schémas Zod + parseCredentials
├── auth.service.ts     # createAuth(gateway) : logique métier pure
└── auth.test.ts        # tests unitaires (Vitest)
```

## État
Couche **logique** faite (validation + service injecté, testés). À venir : adaptateur Supabase réel,
écrans login/signup, comptes staff, session client anonyme. Voir `docs/specs/auth/` et ADR-0001.

## Owner
@Redac777 — toute PR touchant ce module réclame sa revue (CODEOWNERS).
