var express = require("express");
var app = express();
var bodyparser = require("body-parser");
var mongodb = require("mongodb");
var TICKETS_COLLECTION = "tickets";
var ObjectID = mongodb.ObjectID;
app.use(bodyparser.json());
var db;
const MongoClient = mongodb.MongoClient;
const uri = "mongodb+srv://sijantiwari:sijandk@cluster0-ehd6r.mongodb.net/test?retryWrites=true";
const client = new MongoClient(uri, { useNewUrlParser: true });
client.connect(err => {
const collection = client.db("test").collection("tickets");
  // perform actions on the collection object
  if (err) {
    console.log(err);
    process.exit(1);
  }
  db = client.db();
  console.log("Database connection ready");
  var server = app.listen(process.env.PORT || 3000, function() {
    var port = server.address().port;
    console.log("App now running on port", port);
});
});
app.get("/rest/list/", function(req, res) {
    db.collection(TICKETS_COLLECTION)
      .find({})
      .toArray(function(err, docs) {
        if (err) {
          handleError(res, err.message, "sorry! Failed to get tickets.");
        } else {
          res.status(200).json(docs);
        }
      });
  });
app.get("/rest/ticket/:id", function(req, res) {
    
  db.collection(TICKETS_COLLECTION).findOne(
    { _id: new ObjectID(req.params.id) 
        
    },
   
   function(err, doc) {
      if (err) {
        handleError(res, err.message, "Failed to get a ticket");
      }
      
      else {
        if (!doc) res.status(404).send('Sorry, unable to find the given id');
        res.status(200).json(doc);
         }
    }
  );
 
});
//create new ticket
app.post("/rest/ticket/", function(req, res) {
  var newTicket = req.body;
  if (!req.body.assignee_id||!req.body.follower_ids)
  {
    handleError(res, "Invalid user input", "Must provide assignee id and follower's id.", 400);
  } else {
    db.collection(TICKETS_COLLECTION).insertOne(newTicket, function(err, doc) {
      if (err) {
        handleError(res, err.message, "Failed to create new ticket.");
      } else {
        res.status(201).json(doc.ops[0]);
      }
    });
  }
});
//update the ticket in database
app.put("/rest/ticket/:id", function(req, res) {
  var updateDoc = req.body;
  delete updateDoc._id;
db.collection(TICKETS_COLLECTION).updateOne(
    { _id: new ObjectID(req.params.id) },
    { $set: { name: req.body.name, concern: req.body.concern } },
    { upsert: false },
    function(err, doc) {
      if (err) {
        handleError(res, err.message, "Failed to update ticket");
      } else {
        
        updateDoc._id = req.params.id;
        updateDoc.createDate = new Date();
       // if (!doc) res.status(404).send('Sorry there is no such ticket in database to update');
        res.status(200).json(updateDoc);
      }
    }
  );
});
//delete the ticket in database
app.delete("/rest/ticket/:id", (req, res) => {
  db.collection(TICKETS_COLLECTION).findOneAndDelete(
    { "_id.$oid": req.params.id },
    (err, result) => {
      if (err) return res.send(500, err);
      res.send({ message: "Deleted ticket" });
    }
  );
});


