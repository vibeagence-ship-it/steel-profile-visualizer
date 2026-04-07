# Backlog — Steel Profile Visualizer

## Retours collègues — 07/04/2026

### 🔲 Embed iframe 3D
Permettre d'intégrer le visualiseur 3D d'un produit dans n'importe quel site externe via une iframe.
- URL paramétrable (profil, coloris pré-sélectionné)
- Mode "embed" sans navigation (header/footer masqués)
- Options de taille responsive
- Exemple : `<iframe src="/embed/visualizer?profile=13-18B&color=RAL9006" />`

### 🔲 Parcours e-commerce avec vue toit + calepinage
Intégration d'un flow de commande avec simulation visuelle.
- Vue 3D d'un toit avec les profils posés (calepinage)
- Saisie des dimensions (longueur, pente, surface)
- Calcul automatique du nombre de profils nécessaires
- Prise de commande / demande de devis intégrée

### 🔲 Sauvegarde de vue personnalisée
Permettre à l'utilisateur de sauvegarder et partager sa configuration.
- Sauvegarde locale (localStorage) ou lien URL partageable
- Config : profil + coloris + angle de vue 3D
- Possibilité de nommer et rappeler plusieurs configurations
- Export possible (PDF ou image de la vue)

### 🔲 Section transversale 2D avec cotes + dessin du profil
Vue technique 2D de la coupe du profil.
- Image/SVG de la cross-section avec cotation (hauteur, épaisseur, largeur)
- Dessin précis du profil à l'échelle
- Données issues des fiches techniques Galva Service
- Exportable en PDF ou image haute résolution
- Utilisable par les bureaux d'étude / prescripteurs
