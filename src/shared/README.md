# src/shared — code transverse

Espace commun à tous les modules (modifiable par tous, **via PR**). On y met :

- **Client Supabase** (accès base / auth / realtime / storage) partagé.
- **Moteur de thème** : variables CSS + application des couleurs par restaurant (structure fixe).
- **UI kit** : composants réutilisables (Button, Card, Field, Badge, StatusPill…) qui consomment les tokens du `design-language`.
- **Types** partagés et **helpers** temps réel.

Règle : un module ne dépend d'un autre que via son `index.ts`. `src/shared/` est le **seul** espace
commun. Toute modification ici passe par une PR (revue owner), car elle impacte tout le monde.
