var admin = require("firebase-admin");
var keys = require("../miutsjr.json");

// Solo inicializa Firebase si no se ha inicializado previamente
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(keys),
        appName: "miAppFirebase"
    });
}

var db = admin.firestore();
var conexion = db.collection("miUTSJR");

module.exports = {
    conexion
};
