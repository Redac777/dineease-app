# Plan de tests — Module auth

> La **Règle des 3 niveaux** appliquée au module. Toute fonctionnalité terminée coche les 3 avant
> d'être « done » et avant d'ouvrir la PR. Voir `CLAUDE.md` §Règle des 3 niveaux.

## Niveau (a) — Tests unitaires  ·  `npm test`
La logique isolée de chaque fonctionnalité.
- [x] Validation identifiants : email valide normalisé (cas nominal)
- [x] Validation : email invalide rejeté / mot de passe trop court rejeté (cas limite)
- [x] Service : signUp valide puis délègue à la gateway
- [x] Service : signIn renvoie un message générique en cas d'échec (anti-énumération)
- [x] Service : signIn rejette des identifiants invalides avant d'appeler la gateway

## Niveau (b) — Tests généraux / intégration  ·  npm run test:e2e
Le flux complet vécu par l'utilisateur (UI → données → UI).
- [ ] Inscription → connexion → session → déconnexion (arrivera avec le runtime Supabase + l'UI)

## Niveau (c) — Sécurité
- [ ] `/security-review` passé sans finding bloquant (à faire quand une surface est exposée)
- [ ] Surface exposée (auth/données) : scripts `security/` — isolation RLS, escalade de rôle, accès anonyme
- [x] Aucune donnée sensible en clair ; validation Zod aux frontières ; message de connexion générique

> Note : cet incrément est **logique pure** (pas de runtime ni d'UI), donc pas encore de surface
> exposée. Les niveaux (b) et (c) seront couverts quand l'adaptateur Supabase et les écrans arriveront.

## Definition of Done du module
Les 3 niveaux verts pour **chaque** fonctionnalité listée dans `spec.md`, docs à jour, PR ouverte.
