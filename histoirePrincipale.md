# 🗡️ L'Éveil dans les Ténèbres
## Une aventure interactive avec lancés de dés

**Liens du projet :**
- Backend : https://github.com/LeBaptouBaptiste/NAHB-BackEnd
- Frontend : https://github.com/LeBaptouBaptiste/NAHB-FrontEnd

---

## 🎭 Page 1 : Choix de Classe *(Asset: cellule.png)*

Tu te réveilles dans une **cellule** sombre et humide. Tes poignets sont engourdis, ton crâne résonne comme une cloche fêlée. Pas de souvenirs. Pas de réponses. Juste le froid mordant des pierres et une arme qui gît à tes pieds...

**Qui es-tu ?**

### **Choix de Classe :**

**🗡️ [GUERRIER]** → Page 2
- **Arme :** Épée rouillée
- **Bonus Combat :** +3 au dé
- **Malus Fuite :** -2 au dé
- **Compétence Spéciale :** *Rage du Guerrier* (utilisable 1 fois : réussit automatiquement 1 combat)

**🔮 [MAGE]** → Page 2
- **Arme :** Bâton de bois brûlé
- **Bonus Combat :** +1 au dé
- **Bonus Fuite :** +1 au dé
- **Compétence Spéciale :** *Lévitation* (utilisable 1 fois : évite 1 danger automatiquement)

**🗡️🗡️ [ASSASSIN]** → Page 2
- **Arme :** Deux dagues ébréchées
- **Bonus Combat :** +1 au dé
- **Bonus Fuite :** +4 au dé
- **Compétence Spéciale :** *Ombre* (utilisable 1 fois : fuite automatique)

---

## � Page 2 : La Cellule *(Asset: cellule.png)*

La porte de ta cellule est entrouverte. Un **couloir** humide s'étend devant toi, éclairé par une torche vacillante. Des marches descendent dans les ténèbres. L'air sent le moisi et quelque chose de plus... inquiétant.

### **Choix Communs :**

**[Descendre les escaliers]** → Page 3 *(Asset: escalier.png)*

**[Fouiller la cellule]** → Page 4 *(Asset: items.png)*

**[Crier pour attirer l'attention]** → Page 5 *(Asset: ombre.png)*

### **Choix Spécifiques de Classe :**

**ASSASSIN :** *[Chercher un passage secret en tâtant les murs]* 
- 🎲 **Lancer 1d20**
  - ≥12 : Tu trouves une fissure → Page 4bis (passage secret)
  - <12 : Rien d'intéressant → Reste Page 2

**MAGE :** *[Lancer une boule de feu pour éclairer]*
- 💀 **GAME OVER** *(Asset: gameovergeneriuqe.png)* — La cellule explose dans une gerbe de flammes. Tu meurs instantanément, brûlé vif par ta propre magie.

**GUERRIER :** *[Défoncer le mur à mains nues]*
- 💀 **Fracture sévère** — Tu te brises les deux poignets. **Malus permanent : -5 aux combats.** → Reste Page 2

---

## 🪜 Page 3 : L'Escalier *(Asset: escalier.png)*

Tu descends prudemment. Les marches de pierre grincent sous ton poids. Un grondement sourd résonne depuis les profondeurs. Une chaleur étouffante monte vers toi. Ça sent... le soufre. Et la viande grillée.

### **Choix Communs :**

**[Continuer la descente]** → Page 6 *(Asset: dragon.png)*

**[Remonter]** → Page 2

**[Avancer discrètement]** → Page 7 *(Approche furtive)*

### **Choix Spécifiques de Classe :**

**GUERRIER :** *[Hurler un cri de guerre pour provoquer ce qui t'attend]*
- 💀 **GAME OVER** *(Asset: gameoverdragon.png)* — Une créature des ténèbres surgit et te dévore avant même que tu aperçoives sa forme.

**ASSASSIN :** *[Tenter de marcher sur les murs façon ninja]*
- 💀 **GAME OVER** *(Asset: gameovergeneriuqe.png)* — Physique : 0 / Gravité : 1. Tu t'écrases au sol avec un bruit mou.

**MAGE :** *[Utiliser Lévitation pour descendre en flottant]* (COMPÉTENCE SPÉCIALE)
- ✅ **Succès automatique** — Tu utilises ta magie pour flotter silencieusement → Page 7 (avec bonus d'observation)

---

## � Page 4 : Fouille de la Cellule *(Asset: items.png)*

Tu retournes la cellule de fond en comble. Sous la paille pourrie, tu trouves :

- 🧪 **Une potion de vigueur** (restaure 20 PV en combat)
- 🧿 **Un médaillon en bronze** représentant un œil étrange
- 🪨 **Un caillou complètement inutile** (mais brillant, donc précieux)

### **Choix d'Inventaire :**

**[Prendre la potion]** → +Potion → Page 2

**[Prendre le médaillon]** → +Médaillon → Page 2

**[Prendre tout]** → +Potion +Médaillon +Caillou → Page 2

**[Boire la potion par curiosité/faim]**
- 💀 **GAME OVER** *(Asset: gameovergeneriuqe.png)* — Empoisonné. Tu convulses et meurs en quelques secondes.

### **Choix Spécifiques de Classe :**

**MAGE :** *[Analyser le médaillon avec un sort d'identification]*
- ✅ → Page 8 (Révélation magique)

**ASSASSIN :** *[Cacher la potion dans ta botte]*
- ✅ → +Potion (cachée, indétectable) → Page 2

**GUERRIER :** *[Casser le médaillon pour récupérer le bronze]*
- 💀 **GAME OVER** *(Asset: gameovergeneriuqe.png)* — Le médaillon libère une malédiction. Ton âme est aspirée dans l'œil.

---

## � Page 5 : Le Cri *(Asset: ombre.png)*

Tu hurles de toutes tes forces. L'écho résonne dans les couloirs...

Puis un rugissement bestial te répond. Une **ombre** massive se déplace vers toi à une vitesse terrifiante.

### **Choix :**

**[Courir vers l'escalier]** → Page 3

**[Rester et combattre]** → **COMBAT : L'Ombre**

#### ⚔️ **COMBAT : L'Ombre**
- **Difficulté :** 15
- 🎲 **Lance 1d20 + Bonus de Combat de ta classe**
  - **≥15 :** Victoire ! Tu tues l'ombre → Page 3 (+50 PX)
  - **10-14 :** Fuite réussie mais blessé (-10 PV) → Page 3
  - **<10 :** 💀 **GAME OVER** *(Asset: gameovergeneriuqe.png)* — L'ombre te transperce

**[Fuir par le couloir]** → **TEST DE FUITE**

#### 🏃 **TEST DE FUITE**
- **Difficulté :** 12
- 🎲 **Lance 1d20 + Bonus de Fuite de ta classe**
  - **ASSASSIN :** +4 → Très facile (≥8)
  - **MAGE :** +1 → Possible (≥11)
  - **GUERRIER :** -2 → Très difficile (≥14)
  
  - **Réussite :** → Page 2 (sain et sauf)
  - **Échec :** 💀 **GAME OVER** — Rattrapé et déchiqueté

---

## 🐉 Page 6 : La Salle du Dragon *(Asset: dragon.png)*

Tu arrives dans une immense salle au plafond voûté. Des monceaux d'or scintillent dans la pénombre.

Un **dragon rouge colossal** ouvre lentement ses yeux reptiliens. Il te fixe. Il cligne des paupières. Il bâille, révélant des crocs plus longs que ton bras.

**"Encore un. J'ai déjà mangé un mage, un guerrier ET un assassin aujourd'hui."**

Sa voix résonne comme le tonnerre.

### **Choix Communs :**

**[Attaquer directement]**
- 💀 **GAME OVER** *(Asset: gameoverdragon.png)* — Instant barbecue. Tu es réduit en cendres.

**[Parler avec le dragon]** → Page 9

**[Chercher une issue]** → Page 10

**[Utiliser le médaillon]** (si possédé) → Page 11

### **Choix Spécifiques de Classe :**

**GUERRIER :** *[Crier un cri de guerre intimidant]*
- 💀 **GAME OVER** *(Asset: gameoverdragon.png)* — Le dragon se marre tellement qu'il éternue du feu sur toi.

**MAGE :** *[Lancer un sort offensif]* → Page 12 (Duel magique)

**ASSASSIN :** *[Tenter un backstab furtif]*
- 💀 **GAME OVER** *(Asset: gameoverdragon.png)* — Invisible pour toi, pas pour lui. Il te croque en deux.

---

## 🕵️ Page 7 : Approche Discrète *(Asset: escalier.png → dragon.png)*

Tu descends avec une prudence extrême, te cachant dans les ombres. Tu aperçois le **dragon** avant qu'il ne te repère. Il dort à moitié, sa respiration soulevant des nuages de cendres.

### **Choix :**

**[Continuer d'observer]** → Page 13

**[Frapper maintenant]** 
- 💀 **GAME OVER** *(Asset: gameoverdragon.png)* — Il t'attendait. Piège.

**[Chercher un point faible]** → Page 14

### **Choix Spécifiques de Classe :**

**ASSASSIN :** *[Analyser ses mouvements, chercher une ouverture]* (BONUS +2 en Perception)
- 🎲 **Lance 1d20+2**
  - **≥14 :** → Page 14 (avec bonus d'attaque surprise)
  - **<14 :** → Page 13

**MAGE :** *[Vision magique pour détecter sa faiblesse]*
- ✅ → Page 15 (Révélation : point faible révélé)

**GUERRIER :** *[Retenir ton souffle pour... euh... pourquoi déjà ?]*
- 💀 **GAME OVER** *(Asset: gameovergeneriuqe.png)* — Asphyxie volontaire. Brillant.

---

## 🧿 Page 8 : Analyse du Médaillon (Mage) *(Asset: items.png)*

Le médaillon pulse entre tes mains. Des runes scintillent à sa surface. Une voix spectrale murmure :

**"Utilise-moi contre le feu... Je suis bouclier... Je suis salut..."**

### **Choix :**

**[Le porter autour du cou]** → +Médaillon équipé → Page 2

**[Le jeter par peur]**
- 💀 **GAME OVER** *(Asset: gameovergeneriuqe.png)* — Il explose en touchant le sol. Éclats maudits.

---

## � Page 9 : Négociation avec le Dragon *(Asset: dragon.png)*

Tu lèves les mains en signe de paix.

**Dragon :** *"Pourquoi n'es-tu pas déjà en train de fuir comme les autres ?"*

**Toi :** *"..."*

### **Choix de Dialogue :**

**["Je cherche simplement la sortie."]** → Page 10

**["Je veux te combattre honorablement."]**
- 💀 **GAME OVER** *(Asset: gameoverdragon.png)* — "Honorablement ? Hilarant." *CRUNCH.*

**["J'ai des questions sur ce lieu."]** → Page 16

### **Choix Spécifiques de Classe :**

**MAGE :** *["Je veux négocier un pacte."]* → Page 17

**GUERRIER :** *["On règle ça au bras de fer ?"]* 
- 💀 **GAME OVER** *(Asset: gameoverdragon.png)* — Ton bras fond instantanément.

**ASSASSIN :** *["Ton trésor... il est où exactement ?"]* → Page 18

---

## 🚪 Page 10 : Recherche d'une Issue *(Asset: couloir.png)*

Le dragon ricane mais t'indique du museau deux passages :

- **Porte de gauche** : Une chaleur insoutenable s'en échappe
- **Porte de droite** : Un courant d'air frais... et des grattements

### **Choix :**

**[Prendre à gauche]** → Page 19 (Chambre de lave)

**[Prendre à droite]** → Page 20 (Salle du Mimic)

**[Retourner négocier]** → Page 9

---

## 🧿 Page 11 : Le Médaillon contre le Dragon *(Asset: dragon.png + items.png)*

Tu brandis le médaillon. Il émet une lumière aveuglante !

Le dragon recule, sifflant de douleur.

**Dragon :** *"L'Amulette de Tharion ! Maudit sois-tu !"*

### **Résultat :**

**✅ Le dragon te laisse passer librement** → Page 10 (+100 PX)

---

## 🔮 Page 12 : Duel Magique (Mage) *(Asset: dragon.png)*

Tu incantes un sort de glace. Le dragon rugit et crache des flammes !

#### ⚔️ **COMBAT MAGIQUE**
- **Difficulté :** 18
- 🎲 **Lance 1d20 + Bonus Mage (+1)**
  - **≥18 :** Victoire héroïque ! Le dragon s'écroule → Page 21 (Trésor)
  - **14-17 :** Match nul, le dragon te laisse partir → Page 10
  - **<14 :** 💀 **GAME OVER** *(Asset: gameoverdragon.png)* — Carbonisé

---

## 👁️ Page 13 : Observation Prolongée *(Asset: dragon.png)*

Tu observes le dragon pendant plusieurs minutes. Tu remarques :
- Sa respiration est régulière
- Une cicatrice sous son aile gauche
- Un trésor scintillant derrière lui

### **Choix :**

**[Tenter de voler du trésor]** 
- 🎲 **Lance 1d20 + Bonus Fuite**
  - **ASSASSIN :** +4 → Très facile
  - **Autres :** Très difficile
  
  - **≥16 :** → Page 21 (Trésor volé)
  - **<16 :** 💀 **GAME OVER** *(Asset: gameoverdragon.png)*

**[Frapper la cicatrice]** → Page 14

**[Se retirer silencieusement]** → Page 3

---

## 🎯 Page 14 : Point Faible Identifié *(Asset: dragon.png)*

Tu repères la cicatrice ancienne sous son aile gauche. C'est ton unique chance !

#### ⚔️ **ATTAQUE PRÉCISE**
- **Difficulté :** 16
- 🎲 **Lance 1d20 + Bonus Combat**
  - **ASSASSIN :** +3 si venu de Page 7
  - **GUERRIER :** +3
  - **MAGE :** +1
  
  - **≥16 :** Coup critique ! Le dragon s'effondre → Page 21
  - **12-15 :** Blessé mais furieux ! **COMBAT FINAL** (Difficulté 20)
  - **<12 :** 💀 **GAME OVER** *(Asset: gameoverdragon.png)*

---

## 🔮 Page 15 : Vision Magique Révélée (Mage) *(Asset: dragon.png)*

Ta vision magique révèle un secret : le dragon est lié à cette salle par une chaîne spectrale ancrée au plafond !

### **Choix :**

**[Briser la chaîne avec un sort]**
- ✅ **Succès** — Le dragon disparaît dans un cri, libéré de sa prison → Page 21 (+150 PX, Gratitude du dragon)

**[Attaquer le dragon affaibli]** → Page 14

---

## 📜 Page 16 : Questions au Dragon *(Asset: dragon.png)*

Le dragon semble amusé par ta curiosité.

**Dragon :** *"Très bien, pose tes questions, mortel. Mais fais vite."*

### **Choix de Questions :**

**["Comment sortir d'ici ?"]** → Il t'indique → Page 10

**["Pourquoi gardes-tu ce trésor ?"]** → Histoire triste → Page 17bis

**["Qui es-tu vraiment ?"]** → Révélation → Page 17bis

---

## 🤝 Page 17 : Pacte avec le Dragon (Mage) *(Asset: dragon.png)*

**Toi :** *"Et si je te proposais un échange ? De la magie contre ma liberté ?"*

Le dragon plisse les yeux, intrigué.

#### 🎲 **TEST DE PERSUASION**
- **Difficulté :** 14
- 🎲 **Lance 1d20 + Bonus Mage (+2 en Persuasion)**
  - **≥14 :** Le dragon accepte ! → Page 22 (Alliance)
  - **<14 :** Il refuse → Page 9

---

## 💰 Page 18 : Convoitise (Assassin) *(Asset: dragon.png)*

Le dragon ricane.

**Dragon :** *"Mon trésor ? Derrière moi. Mais tu devras me passer sur le corps."*

### **Choix :**

**[Tenter de le voler discrètement]** → Page 13

**[Négocier un partage]**
- 🎲 **Lance 1d20**
  - **≥15 :** Il accepte 10% → Page 21 (Petit trésor)
  - **<15 :** Il refuse → Page 9

---

## 📦 Page 20 : La Salle du Coffre *(Asset: coffre.png)*

Tu arrives dans une petite salle. Au centre trône un **coffre** en bois magnifiquement sculpté. Des gemmes ornent sa serrure.

Trop beau pour être vrai...

### **Choix :**

**[Ouvrir le coffre directement]** → Page 20bis (MIMIC !)

**[Examiner le coffre]**
- 🎲 **Lance 1d20**
  - **ASSASSIN :** +3 (expert en pièges)
  - **≥13 :** Tu détectes une anomalie → Page 20bis (avec avantage)
  - **<13 :** Tu ne vois rien de suspect → Choisis à nouveau

**[Frapper le coffre avec ton arme]** → Page 20bis (Éveil du Mimic)

**[Ignorer et passer]** → Page 10

---

## 🧟 Page 20bis : Le Mimic ! *(Asset: mimic.png)*

Le coffre s'ouvre... mais ce n'est pas un coffre. C'est une **GUEULE** pleine de crocs !

Un Mimic ! Il bondit vers toi !

### **Choix :**

**[COMBATTRE]** → **COMBAT : Mimic**

#### ⚔️ **COMBAT : Mimic**
- **Difficulté :** 14
- 🎲 **Lance 1d20 + Bonus Combat**
  - **GUERRIER :** +3 → Facile
  - **ASSASSIN :** +1
  - **MAGE :** +1
  
  - **≥14 :** Victoire ! → Page 21 (Vrai trésor à l'intérieur)
  - **10-13 :** Fuite blessée → Page 10 (-15 PV)
  - **<10 :** 💀 **GAME OVER** *(Asset: gameovergeneriuqe.png)* — Dévoré vivant

**[FUIR]** → **TEST DE FUITE**

#### 🏃 **TEST DE FUITE**
- **Difficulté :** 10
- 🎲 **Lance 1d20 + Bonus Fuite**
  - **ASSASSIN :** +4 → Très facile (≥6)
  - **MAGE :** +1 → Possible (≥9)
  - **GUERRIER :** -2 → Difficile (≥12)
  
  - **Réussite :** → Page 10 (sain et sauf)
  - **Échec :** Le Mimic te mord ! → Page 10 (-20 PV)

---

## 🏆 Page 21 : Le Trésor *(Asset: coffre.png)*

Tu trouves :
- 💰 500 pièces d'or
- 🗡️ Une épée légendaire (+5 attaque permanente)
- 🧪 2 potions de soin complètes

**🎉 FIN VICTORIEUSE : "Le Pillard Triomphant"**

---

## 🤝 Page 22 : Alliance Draconique (Fin Mage) *(Asset: dragon.png)*

Le dragon accepte le pacte. Il te donne :
- 🔮 Un fragment de son pouvoir (+Sorts de Feu permanents)
- 💰 Une part de son trésor
- 🚪 La sortie

**🎉 FIN VICTORIEUSE : "Le Mage Allié des Dragons"**

---

## 📋 Récapitulatif des Mécaniques

### **Bonus de Combat :**
- **Guerrier :** +3
- **Mage :** +1
- **Assassin :** +1

### **Bonus de Fuite :**
- **Guerrier :** -2
- **Mage :** +1
- **Assassin :** +4

### **Compétences Spéciales (1 utilisation) :**
- **Guerrier :** *Rage* → Victoire automatique en combat
- **Mage :** *Lévitation* → Évite 1 danger automatiquement
- **Assassin :** *Ombre* → Fuite automatique

### **Assets utilisés :**
- cellule.png, couloir.png, escalier.png, dragon.png
- coffre.png, mimic.png, ombre.png, items.png
- gameoverdragon.png, gameovergeneriuqe.png