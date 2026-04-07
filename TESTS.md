# Campagnes de Tests — Steel Profile Visualizer

> À faire avant toute démo interne ArcelorMittal

---

## 🟦 Campagne 1 — Smoke Test (5 min)
*Vérifier que tout fonctionne de base avant de montrer à quelqu'un*

| # | Test | Attendu | Résultat |
|---|---|---|---|
| 1 | Ouvrir `/` | Landing page s'affiche, pas d'erreur console | ✅ |
| 2 | Cliquer CTA "Ouvrir le visualiseur" | Navigue vers `/visualizer` | ✅ |
| 3 | Sélectionner un profil dans la sidebar | Le viewer 3D change | ✅ |
| 4 | Changer une couleur RAL | Le rendu 3D change de couleur | ✅ |
| 5 | Bouger le slider longueur | La valeur change + le rendu s'adapte | ✅ |
| 6 | Aller sur `/settings` | Page s'affiche sans erreur | ✅ |
| 7 | Revenir au visualiseur | Navigation fonctionne | ✅ |

---

## 🟨 Campagne 2 — Fonctionnalités (15 min)
*Tester chaque feature en détail*

### Landing page
| # | Test | Attendu | Résultat |
|---|---|---|---|
| 1 | Scroll bas | Animations sections s'activent au scroll | ✅ |
| 2 | Dark mode toggle | Interface passe en mode sombre | ⚠️ Ne change que la landing — à retirer ou étendre |
| 3 | Recharger la page en dark mode | Mode sombre persisté partout | ❌ Persisté mais ne s'applique qu'à la landing |
| 4 | Cards features au hover | Effet 3D tilt visible sur toutes les cards | ⚠️ Uniquement les cards du bas |
| 5 | CTA header | Navigue vers /visualizer | ✅ |

### Visualiseur
| # | Test | Attendu | Résultat |
|---|---|---|---|
| 1 | Parcourir tous les profils | Chaque profil charge sans erreur | ✅ |
| 2 | Hover sur une couleur RAL | Tooltip avec preview visible | ✅ |
| 3 | Toutes les couleurs RAL | Chaque couleur s'applique correctement | ✅ |
| 4 | Slider min (1m) | Rendu à 1m de long | ✅ |
| 5 | Slider max (12m) | Rendu à 12m de long | ✅ |
| 6 | Bouton Export PNG | Téléchargement ou feedback approprié | ✅ |
| 7 | Rotation 3D souris | Le modèle tourne fluidement | ✅ |
| 8 | Zoom molette | Zoom in/out fonctionne | ✅ |
| 9 | Bouton Nano Banana | Modal IA s'ouvre | ✅ |

### Settings
| # | Test | Attendu | Résultat |
|---|---|---|---|
| 1 | Toggle unités mm → m | Valeurs converties dans le visualiseur | ❌ Les valeurs restent celles de base |
| 2 | Activer/désactiver grille | Grille visible dans le viewer | ❌ Grille n'apparaît pas |
| 3 | Upload logo | Logo visible dans le visualiseur / export | ❌ Upload fonctionne mais logo non affiché |
| 4 | Saisir nom société | Persisté après rechargement | ✅ |
| 5 | Changer accent color | Interface change de couleur d'accent | ✅ |
| 6 | Toutes les modifs → recharger | Tout est persisté via localStorage | ✅ |
| 7 | Toast de sauvegarde | Notification apparaît et disparaît | ✅ |

---

## 🟥 Campagne 3 — Robustesse (10 min)
*Ce qui peut casser en démo*

| # | Test | Attendu | Résultat |
|---|---|---|---|
| 1 | Cliquer très vite entre profils | Pas de crash, dernier profil affiché | |
| 2 | Redimensionner la fenêtre | Layout s'adapte (responsive) | |
| 3 | Ouvrir sur mobile (iPhone) | Sidebar devient drawer, tout utilisable | |
| 4 | Connexion lente (DevTools → Slow 3G) | Loading states s'affichent | |
| 5 | Désactiver JavaScript | Page affiche un message gracieux | |
| 6 | Vider le localStorage (DevTools) | App repart avec valeurs par défaut | |
| 7 | Ouvrir 2 onglets | Pas de conflit entre les sessions | |

---

## 🟩 Campagne 4 — Démo Arcelor (scénario réel)
*Simuler exactement ce que tu feras en démo interne*

**Scénario : présentation à un responsable technique ArcelorMittal**

| Étape | Action | Message à dire | Résultat |
|---|---|---|---|
| 1 | Ouvrir `/` | "Voici le visualiseur de profils" | ✅ |
| 2 | Scroller la landing | "On a une landing professionnelle pour les clients" | ✅ |
| 3 | Cliquer 'Ouvrir le visualiseur' | "On entre dans l'outil" | ✅ |
| 4 | Sélectionner Sandwich T39 | "Prenons votre profil le plus vendu" | ✅ |
| 5 | Choisir RAL 9006 (aluminium) | "Le client choisit sa couleur" | ✅ |
| 6 | Ajuster à 6m | "Il paramètre la longueur en temps réel" | ✅ |
| 7 | Exporter PNG | "Il télécharge un rendu pour son devis" | ✅ |
| 8 | Montrer Nano Banana | "Et là, il peut générer une mise en scène IA" | ❌ Pas encore implémenté |
| 9 | Ouvrir Settings | "Vous pouvez personnaliser avec votre logo" | ⚠️ Upload OK mais logo non visible |
| 10 | Uploader logo Arcelor | "Et voilà, c'est brandé ArcelorMittal" | ❌ Logo uploadé mais absent partout |

**Temps estimé démo : 8-10 minutes**

---

## 🐛 Bugs identifiés

| # | Bug | Sévérité | Statut | Notes |
|---|---|---|---|---|
| 1 | `<div>` dans `<p>` → hydration error (AnimatedCounter / Stats) | Moyen | ✅ Corrigé | `<p>` → `<div>` dans `page.tsx` |
| 2 | Dark mode ne s'applique qu'à la landing page | Moyen | 🔴 Ouvert | Visualiseur et Settings non concernés |
| 3 | Toggle unités mm → m inopérant | Moyen | 🔴 Ouvert | Valeurs dans le viewer ne changent pas |
| 4 | Grille viewer invisible | Bas | 🔴 Ouvert | Setting sauvegardé mais aucun effet visible |
| 5 | Logo uploadé non affiché | Moyen | 🔴 Ouvert | Upload OK, mais absent du viewer et de l'export |
| 6 | Effet tilt cards uniquement sur cartes du bas | Bas | 🔴 Ouvert | Cards du haut non concernées |
| 7 | Nano Banana non implémenté | Haut | 🔴 Ouvert | Bloquant pour démo Arcelor étape 8 |

---

## 📱 Devices à tester

- [ ] MacBook / iMac (Chrome)
- [ ] MacBook / iMac (Safari)
- [ ] iPhone (Safari mobile)
- [ ] iPad (Safari)
- [ ] Windows Chrome (si dispo)

---

## ✅ Critères Go/No-Go démo

Avant de montrer à Arcelor, tout ça doit passer :
- [ ] Campagne 1 (Smoke) : 7/7 ✅
- [ ] Campagne 4 (Démo) : 10/10 ✅
- [ ] Zéro erreur console en prod
- [ ] Chargement initial < 3 secondes
