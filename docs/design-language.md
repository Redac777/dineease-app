# Design Language — DineEase

> La source de vérité visuelle du projet. Tous les modules s'y réfèrent. Changer une couleur ici doit
> se répercuter partout (thème externalisé). Les maquettes concrètes par interface vivent dans
> `design/<module>/`.

## Principe : une structure, des habillages
- **La structure/layout est FIXE pour tous** (le « template DineEase ») : même topbar, même navigation,
  mêmes composants (cartes de plats, boutons, champs). Un restaurant ne change pas la mise en page.
- **Seules les couleurs changent par restaurant** : extraites de son logo (`node-vibrant`) et appliquées
  via des **variables CSS** (`--color-primary`, etc.). L'accent, les états actifs et les surbrillances
  prennent la couleur du resto ; le reste (fond, texte, surfaces) suit le thème clair/sombre.

## Ambiance
Clair et moderne, fond blanc, premium et épuré façon Linear/Notion. Pas de dark par défaut. Un accent
**chaud** (ambre/corail, appétissant pour la food) porte la marque DineEase sur les écrans plateforme/admin,
avant qu'un thème restaurant ne s'applique côté client.

## Modes & thèmes
- **Clair (par défaut) / Sombre** : une bascule permet de passer en sombre. En sombre, les surfaces
  passent en foncé mais **l'accent du restaurant reste le sien**.
- **Palettes préréglées (façon VS Code)** : après l'upload du logo, la palette est extraite
  automatiquement et proposée ; l'admin peut aussi choisir parmi **4 à 6 palettes préréglées** ou garder l'auto.

## Couleurs (marque DineEase, valeurs par défaut ; surchargées par le thème resto côté client)
- Primaire / Accent : `#F26A4B` (corail chaud)
- Fond : `#FFFFFF` · Surfaces : `#F7F8FA`
- Texte : `#1A1D21` · Texte secondaire : `#6B7280`
- Succès : `#16A34A` · Erreur : `#DC2626`
- Ces valeurs sont exposées en **variables CSS** dans `src/shared/` ; le module `restaurant` réécrit
  `--color-primary`/`--color-accent` avec les couleurs du logo par restaurant.

## Typographie
- Police : `Inter` (fallback `system-ui, sans-serif`).
- Échelle : titres (24/20/18) · corps (16/14) · légendes (12). Poids : 600 pour les titres, 400-500 pour le corps.

## Espacements & rayons
- Grille d'espacement : 4 / 8 / 12 / 16 / 24 / 32.
- Rayons de coin : 8 (cartes) · 12 (modales) · 999 (pills / badges recommandé/best-seller).

## Composants partagés
Les composants réutilisables (Button, Card, Field, Badge, StatusPill…) vivent dans `src/shared/` et
consomment ces tokens (variables CSS). On ne redéfinit pas de style local qui contourne le design language.

## Maquettes
- Outil : **Claude Design**.
- Chaque interface a sa maquette adoptée, **datée et versionnée**, dans `design/<module>/`. On ne
  réécrit jamais une maquette par-dessus : on crée une nouvelle version datée (voir `design/<module>/README.md`).
