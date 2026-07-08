# Sécurité — DineEase

Le niveau (c) de la Règle des 3 niveaux. Deux réflexes, pour **chaque fonctionnalité terminée** :

## 1. Revue automatique
Lancer `/security-review` avant chaque merge. Corriger tout finding bloquant avant d'ouvrir/merger la PR.

## 2. Scripts de test de sécurité (surfaces exposées)
Pour toute fonctionnalité qui expose une **API, de l'auth ou des données**, écris une suite de tests
qui tape l'API **comme le ferait un attaquant** (jamais via l'UI). On vérifie au minimum :

| Test | Résultat sécurisé attendu |
|------|---------------------------|
| Lire les données d'un autre utilisateur | tableau vide / refusé |
| Modifier la donnée d'un autre | 0 ligne modifiée / refusé |
| Créer une donnée au nom d'un autre | refusé (401/403) |
| Escalade de privilège (se donner un rôle/plan) | refusé (401/403) |
| Accès anonyme (sans être connecté) | refusé / vide |
| Contrôle positif (action légitime sur ses propres données) | réussit |

> C'est exactement la démarche utilisée sur Vivia (collection Postman). Voir le gabarit
> `security-tests.example`.

## Règles
- **Jamais** la clé `service_role` / une clé d'admin ici : uniquement la clé publique. C'est la
  sécurité côté base (RLS / policies) qu'on teste, pas la clé.
- Les fichiers remplis avec de vrais secrets/identifiants sont **gitignorés** (voir `.gitignore` :
  `security/*.local.*`, `security/secrets/`).
