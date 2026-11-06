var express = require("express");
var router = express.Router();
var fs = require("fs");
var path = require("path");

var DB_PATH = path.join(__dirname, "../data/db.json");

function lireDB() {
  var contenu = fs.readFileSync(DB_PATH, "utf-8");
  return JSON.parse(contenu);
}

function ecrireDB(data) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), "utf-8");
}

// GET /api/ecoles
router.get("/", function (req, res) {
  var db = lireDB();
  var ecoles = db.ecoles;

  if (req.query.ville) {
    ecoles = ecoles.filter(function (e) {
      return e.ville.toLowerCase() === req.query.ville.toLowerCase();
    });
  }
  if (req.query.type) {
    ecoles = ecoles.filter(function (e) {
      return e.type.toLowerCase() === req.query.type.toLowerCase();
    });
  }
  if (req.query.domaine) {
    ecoles = ecoles.filter(function (e) {
      return e.formations.some(function (f) {
        return f.domaine.toLowerCase() === req.query.domaine.toLowerCase();
      });
    });
  }

  res.json({ success: true, total: ecoles.length, data: ecoles });
});

// GET /api/ecoles/:id
router.get("/:id", function (req, res) {
  var db = lireDB();
  var ecole = db.ecoles.find(function (e) {
    return e.id === parseInt(req.params.id);
  });
  if (!ecole) {
    return res
      .status(404)
      .json({ success: false, message: "École introuvable" });
  }
  res.json({ success: true, data: ecole });
});

// POST /api/ecoles
router.post("/", function (req, res) {
  var db = lireDB();
  var nouvelle = Object.assign({ id: Date.now(), formations: [] }, req.body);
  db.ecoles.push(nouvelle);
  ecrireDB(db);
  res
    .status(201)
    .json({ success: true, message: "École ajoutée", data: nouvelle });
});

// PUT /api/ecoles/:id
router.put("/:id", function (req, res) {
  var db = lireDB();
  var idx = -1;
  for (var i = 0; i < db.ecoles.length; i++) {
    if (db.ecoles[i].id === parseInt(req.params.id)) {
      idx = i;
      break;
    }
  }
  if (idx === -1) {
    return res
      .status(404)
      .json({ success: false, message: "École introuvable" });
  }
  db.ecoles[idx] = Object.assign({}, db.ecoles[idx], req.body, {
    id: db.ecoles[idx].id,
  });
  ecrireDB(db);
  res.json({
    success: true,
    message: "École mise à jour",
    data: db.ecoles[idx],
  });
});

// DELETE /api/ecoles/:id
router.delete("/:id", function (req, res) {
  var db = lireDB();
  var idx = -1;
  for (var i = 0; i < db.ecoles.length; i++) {
    if (db.ecoles[i].id === parseInt(req.params.id)) {
      idx = i;
      break;
    }
  }
  if (idx === -1) {
    return res
      .status(404)
      .json({ success: false, message: "École introuvable" });
  }
  db.ecoles.splice(idx, 1);
  ecrireDB(db);
  res.json({ success: true, message: "École supprimée" });
});

module.exports = router;
