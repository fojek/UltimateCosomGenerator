// Object joueur
var Joueurs = {
  // Objet joueur
  joueurProto: {
    id: 0,
    nom: "",
    score: 0,
    getInfo : function(){
      Logger.log('Joueur ' + this.id + ' : ' + this.nom + '\t| ' + this.score)
    }
  },
      
  joueurs: [],
  
  // Création de la liste
  init : function(sheet){
    
    // Pourcentage de variation
    var range = sheet.getRange('F2:F2'); 
    var pourcentage = range.getValue();
    
    // Reference de la page active
    var range = sheet.getSheets()[0].getDataRange();
    sheet.setActiveRange(range);

    // Met les joueurs en ordre descendant
    sheet.sort(2, true)
    
    var joueurDB = range.getValues()
        
    for (var i = 0; i < joueurDB.length; i++) {
      this.joueurProto.id = i + 1
      this.joueurProto.nom = joueurDB[i][0]
      this.joueurProto.score = getRand(joueurDB[i][1], pourcentage)
      
      this.joueurs.push(deepCopy(this.joueurProto))
    }
  },
  
  // Retourne le meilleur joueur
  meilleur : function(){
    if(this.nb() > 0){
      return joueurs.valueOf(0)
    }
  },
  
  // Retourne le nombre de joueurs
  nb : function() { return this.joueurs.length },
  
  // Log liste des joueurs
  log : function() {
    Logger.log('Il y a ' + this.nb() + ' joueurs.')
    var max = this.nb()
    for(var i=0; i<max; i++){
      this.joueurs[i].getInfo()
    }
  }
}

// Objet Liste Equipes
var Equipes = {
  
  // objet equipe
  eqProto: {
    id: 0,
    joueurs: [],
    
    // Log
    getInfo: function () {
      Logger.log('Equipe ' + this.id + ', nombre de joueurs: ' + this.nb() + ', score: ' + this.score())
    },
    
    // Nombre de joueurs
    nb : function () { 
      var total = 0
      this.joueurs.forEach(function(){
        total ++
      })
      return total
    },
    
    // Score de l'équipe
    score : function (){
      var total = 0
      this.joueurs.forEach(function(joueur){
        total += joueur.score
      })
      return total
    },
    
    // Ajouter joueur
    draft : function(pool) {
      
      if (pool.length > 0) {
      
        var jBuffer = pool.pop()
        this.joueurs.push(jBuffer)
        Logger.log('... a drafté: ' + jBuffer.nom)
        
        return true
      }
      else {
        Logger.log('... n\'a plus de choix!')
        return false
      }
      
    }
  },
  
  // Liste des équipes
  equipes: [],
  
  // La pire équipe draft le meilleur joueur sur le marché
  draft : function(pool) { return this.pire().draft(pool.joueurs) },
  
  // Initialisation des équipes
  init : function(sheet) {
    
    // Lit le nombre d'équipes désirées
    var range = sheet.getRange('F1:F1'); 
    var nbEquipes = range.getValue();
    
    for (var i = 0; i < nbEquipes; i++) {
        this.eqProto.id = i + 1
        this.equipes.push(deepCopy(this.eqProto))
      }
  },
  
  // Log liste des équipes
  log : function() {
    Logger.log('Il y a ' + this.nb() + ' equipes.')
    var max = this.nb()
    for(var i=0; i<max; i++){
      this.equipes[i].getInfo()
    }
  },
  
  // Retourne le nombre d'équipes
  nb : function() { return this.equipes.length },
  
  updateScore : function(){
    for (var i in this.equipes){
      this.equipes[i].score()
      //Logger.log(i + ' : ' + this.equipes[i].score())
    }
  },
  
  // Retourne la pire équipe
  pire : function() {
    this.updateScore()
    this.equipes.sort(function(a, b) { return a.score() - b.score() })
    Logger.log('Équipe ' + this.equipes[0].id + '... ')

    return this.equipes[0]
  },
  
  // Classe les équipes par id
  id : function() {
    this.equipes.sort(function(a, b) { return a.id - b.id })
  },
  
  // Écrit les équipes composées
  ecrire : function(sheet) {
    
    // Feuille des équipes
    sheet.setActiveSheet(sheet.getSheets()[1])
    sheet.getActiveSheet().clear()
    this.id()
    
    var range = sheet.getActiveSheet().getRange(1,1)
    
    // Pour toutes les équipes 
    for (var i in this.equipes){
      range.setValue('Équipe ' + this.equipes[i].id + ' (' + Math.round(this.equipes[i].score()) + ')');
  
      // Pour tous les joueurs
      for (var j in this.equipes[i].joueurs){
        range = range.offset(1,0)
        range.setValue(this.equipes[i].joueurs[j].nom);
      }
      // Retourne en haut pour la prochaine équipe
      range = range.offset(-(this.equipes[i].joueurs.length),1)
    }
  } 
}

// Fonction pour créer un object, pas une référence, trouvé sur le web
function deepCopy(oldObj) {
    var newObj = oldObj;
    if (oldObj && typeof oldObj === 'object') {
        newObj = Object.prototype.toString.call(oldObj) === "[object Array]" ? [] : {};
        for (var i in oldObj) {
            newObj[i] = deepCopy(oldObj[i]);
        }
    }
    return newObj;
}

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random
function getRand(val, percent) {
  
  var min = val*(1-percent/100)
  var max = val*(1+percent/100)
  
  return Math.random() * (max - min) + min;
}

function lireFeuille() {
  
  // ID du tableur
  var sheet = SpreadsheetApp.openById('1Muex-c1snQIxoA8b-hwHx3-QVL0EMEsu-qg3SXB4JDY')
  Logger.log(sheet.getName());
  
  sheet.setActiveSheet(sheet.getSheets()[0])
  
  return sheet
}

function doGet() {
  
  var sheet = lireFeuille()

  Equipes.init(sheet)
  Joueurs.init(sheet)
  Joueurs.log()
  
  // recrute tant q'il y a des joueurs
  while (Equipes.draft(Joueurs)) {};
  
  Equipes.log()
  Equipes.ecrire(sheet)
  
  template = HtmlService.createTemplateFromFile('html');
  return template.evaluate().setSandboxMode(HtmlService.SandboxMode.IFRAME);
}
