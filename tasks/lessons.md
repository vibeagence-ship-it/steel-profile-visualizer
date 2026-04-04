# Lessons — Steel Profile Visualizer

## Linear : logger TOUTE feature/bug implementé

**Règle :** Chaque feature ou bug corrigé doit avoir un ticket Linear (team AGE), même si c'est une micro-feature ajoutée en cours de session sans ticket préexistant. Créer le ticket en `Done` directement si déjà implémenté.

**Pourquoi :** L'historique Linear est la source de vérité pour le suivi produit. Sans log, les features disparaissent dans le bruit des commits.

**Comment appliquer :**
- Ticket demandé explicitement → créer AVANT d'implémenter (statut Todo)
- Feature ajoutée à la volée (ex: toggle logo export) → créer APRÈS implémentation (statut Done)
- API Linear disponible via CLAUDE.md → utiliser curl GraphQL `issueCreate`
- Toujours inclure : titre `[Steel Visualizer] ...`, description, label (Bug/Feature/Improvement), priorité

**Config Linear (CLAUDE.md) :**
- API key : [voir .env.local — ne pas commiter]
- Team ID : `a379a05f-e877-4bc3-9f1b-7d7f9d9cbaac`
- States : Todo `426b7853`, In Progress `1b608cf7`, Done `9d07d652`, Backlog `81a9dcef`
- Labels : Bug `c7e1c175`, Improvement `810fbfdf`, Feature `3ccadcea`
