/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */


// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started

// exports.helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

const functions = require("firebase-functions");
const nodemailer = require("nodemailer");

const admin = require("firebase-admin");
const serviceAccount = require("./permissions.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const express = require("express");
const app = express();
const db = admin.firestore();
const transporter = nodemailer.createTransport({
    host: "arystandev@gmail.com",
    port: 465,
    secure: true,
    auth: {
        user: "arystandev@gmail.com",
        pass: "ItsTimeNow23!",
    },
})

exports.sendEmail = functions.firestore
    .document("emails/{orderId}")
    .onCreate((snap, context) => {
        console.log("email id" + snap.data().email);
        let message = "From: " + snap.data().email +
            "<br>Name: " + snap.data().name;
        message = message + "<br>Subject: " + snap.data().subject;
        message = message + "<br>Message: " + snap.data().message;
        const mailOptions = {
            from: "arystandev@gmail.com",
            to: "roadtogoooogle@gmail.com",
            subject: snap.data().subject,
            html: message,
        }
        return transporter.sendMail(mailOptions, (error, data) => {
            if (error) {
                console.log("Inside error block " + error);
                return
            }
            console.log("Email sent!")
        } )
    })


const cors = require("cors");
const {error} = require("firebase-functions/logger");
app.use(cors({origin: true}));

// Routes  
app.get("/hello-world", (req, res) => {
  return res.status(200).send("Hello World!");
});

// Create -> Post
app.post("/api/send", (req, res) => {
    console.log("Sending email")
    sendMail(
        "roadtogoooogle@gmail.com",
        "New Article Created",
        "A new article has been created.",
    );

    return res.status(200).send();
});

app.post("/api/create", (req, res) => {
  (async () => {
    try {
      await db.collection("articles").doc("/" + req.body.id + "/")
      .create({
        name: req.body.name,
        description: req.body.description,
        price: req.body.price,
      });

      return res.status(200).send();
    }
    catch(error) {
      console.log(error);
      return res.status(500).send(error);
    }
})()
});

// Read -> Get
app.get("/api/read/:id", (req, res) => {
    (async () => {
        try {
            const document = db.collection("articles").doc(req.params.id);
            let products = await document.get();
            let response = products.data();

            return res.status(200).send(response);
        }
        catch(error) {
            console.log(error);
            return res.status(500).send(error);
        }
    })()
});

app.get("/api/read", (req, res) => {
    (async () => {
        try {
            let query = db.collection("articles");
            let response = [];

            await query.get().then(querySnapshot => {
                let docs = querySnapshot.docs // the result of the query
                for (let doc of docs) {
                    const selectedItem = {
                        id: doc.id,
                        date: doc.data().date,
                        image: doc.data().image,
                        subtitle: doc.data().subtitle,
                        text: doc.data().text,
                        title: doc.data().title,
                    };
                    response.push(selectedItem);
                }
                return response; // each then should return a value
            })

            return res.status(200).send(response);
        }
        catch(error) {
            console.log(error);
            return res.status(500).send(error);
        }
    })();
});


// Update -> Put
app.put("/api/update/:id", (req, res) => {
    (async () => {
        try {
            const document = db.collection("articles").doc(req.params.id);
            await document.update({
                name: req.body.name,
                description: req.body.description,
                price: req.body.price
            });

            return res.status(200).send();
        }
        catch(error) {
            console.log(error);
            return res.status(500).send(error);
        }
    })()
})

// Delete -> Delete
app.delete("/api/delete/:id", (req, res) => {
    (async () => {
        try 
        {
            const document = db.collection("products").doc(req.params.id);
            await document.delete();
            return res.status(200).send();
        }
        catch(error) 
        {
            console.log(error);
            return res.status(500).send(error);
        };
    })()
});

exports.app = functions.https.onRequest(app);