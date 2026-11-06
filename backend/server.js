const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes API (toujours définies AVANT le fichier statique catch-all)
app.use("/api/ecoles", require("./routes/ecoles"));
app.use("/api/orientation", require("./routes/orientation"));

// Trouver le dossier frontend automatiquement, peu importe où se trouve server.js :
// on cherche un dossier (celui-ci ou le parent) qui contient index.html
function trouverFrontendDir() {
  var candidats = [
    __dirname, // server.js est à la racine du projet
    path.join(__dirname, ".."), // server.js est dans backend/
  ];
  for (var i = 0; i < candidats.length; i++) {
    if (fs.existsSync(path.join(candidats[i], "index.html"))) {
      return candidats[i];
    }
  }
  // Par défaut, on suppose la structure backend/ classique
  return path.join(__dirname, "..");
}

const FRONTEND_DIR = trouverFrontendDir();
console.log("Dossier frontend détecté :", FRONTEND_DIR);

app.use(express.static(FRONTEND_DIR));

// Si aucune route ne correspond, renvoyer index.html (utile pour les liens directs)
app.use(function (req, res) {
  var indexPath = path.join(FRONTEND_DIR, "index.html");
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res
      .status(404)
      .send("index.html introuvable. Vérifie la structure de tes dossiers.");
  }
});

// Démarrage
app.listen(PORT, function () {
  console.log("Serveur OrienteCI démarré sur http://localhost:" + PORT);
});
