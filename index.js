const express = require("express");
const app = express();
const port = process.env.PORT || 8000;
app.use(express.json());

const mongodb = require("mongodb");
const mongoClient = mongodb.MongoClient;
// const dbUrl = "mongodb://127.0.0.1:27017";
const dbUrl = "mongodb+srv://debopam:debopam@cluster0.aqd3g.mongodb.net/myFirstDatabase?retryWrites=true&w=majority"

//Homepage

app.get("/", (req,res)=>{
    res.status(200).send("This is the home page. use /mentor to add mentor, /student to add student, /mentor-assign/:mentor to assign students to mentor, /change-mentor/:student to change mentor")
})

//Get the mentor details

app.get("/mentor", async (req,res)=>{

    var client = await mongoClient.connect(dbUrl,{useNewUrlParser: true, useUnifiedTopology: true});

    try {

        var db = client.db("mentorstudent");
        var data = await db.collection("mentor").find().toArray();
        // console.log(data);
        res.json({data})
    } catch (error) {
        console.log("count not connect due to ", error)
    }
    finally{
        await client.close();
    }
})

//Get the student details

app.get("/student", async (req,res)=>{

    var client = await mongoClient.connect(dbUrl,{useNewUrlParser: true, useUnifiedTopology: true});

    try {

        var db = client.db("mentorstudent");
        var data = await db.collection("student").find().toArray();
        // console.log(data);
        res.json({data})
    } catch (error) {
        console.log("count not connect due to ", error)
    }
    finally{
        await client.close();
    }
})

//Add a mentor

app.post("/mentor", async (req,res)=>{

    var client = await mongoClient.connect(dbUrl,{useNewUrlParser: true, useUnifiedTopology: true});

    try {

        var db = client.db("mentorstudent");
        let searchmentor = await db.collection("mentor").findOne({mentor:req.body.mentor});
        req.body.student = [];
        if(!searchmentor){
            var data = await db.collection("mentor").insertOne(req.body);
            res.status(200).send("Mentor added")
        }
        else{
            res.status(200).send("Mentor already exists")
        }
        // console.log(data);
    } catch (error) {
        console.log("count not connect due to ", error)
    }
    finally{
        await client.close();
    }
})

//Add a student

app.post("/student", async (req,res)=>{

    var client = await mongoClient.connect(dbUrl,{useNewUrlParser: true, useUnifiedTopology: true});

    try {

        var db = client.db("mentorstudent");
        let searchstudent = await db.collection("student").findOne({student:req.body.student});
        if(!searchstudent){
            var data = await db.collection("student").insertOne(req.body);
            // console.log(data);
            res.status(200).send("Student added")
        }
        else{
            res.status(200).send("Student already exists")
        }
    } catch (error) {
        console.log("count not connect due to ", error)
    }
    finally{
        await client.close();
    }
})

//Assign students to a mentor

app.post("/mentor-assign/:mentor", async (req,res)=>{

    var client = await mongoClient.connect(dbUrl,{useNewUrlParser: true, useUnifiedTopology: true});
    var mentorname = req.params.mentor;

    try {

        var db = client.db("mentorstudent");
        let searchmentor = await db.collection("mentor").findOne({mentor:mentorname})
        let searchstudent = await db.collection("student").findOne({student:req.body.student})
        if(searchmentor&&searchstudent){
            let searchstudent = await db.collection("student").findOne({student:req.body.student})
            if(!searchstudent.mentor){
                var data = await db.collection("mentor").findOneAndUpdate({mentor:mentorname}, {$addToSet:{student:req.body.student}})
                var studata = await db.collection("student").findOneAndUpdate({student:req.body.student}, {$set:{mentor:mentorname}})
                // console.log(data);
                res.status(200).send("Data updated")
            }
            else{
                res.status(200).send("Mentor already exists for the student")
            }
        }
        else{
            res.status(200).send("Mentor or Student does not exist in the system")
        }
    } catch (error) {
        console.log("count not connect due to ", error)
    }
    finally{
        await client.close();
    }
})

//View mentors and their students

app.get("/mentor-assign", async (req,res)=>{

    var client = await mongoClient.connect(dbUrl,{useNewUrlParser: true, useUnifiedTopology: true});

    try {
        var db = client.db("mentorstudent");
            var data = await db.collection("mentor").find().toArray()
            res.status(200).json({data})
    } catch (error) {
        console.log("count not connect due to ", error)
    }
    finally{
        await client.close();
    }
})

app.get("/mentor-assign/:mentor", async (req,res)=>{

    var client = await mongoClient.connect(dbUrl,{useNewUrlParser: true, useUnifiedTopology: true});
    var mentorname = req.params.mentor;

    try {

        var db = client.db("mentorstudent");
        let searchmentor = await db.collection("mentor").findOne({mentor:mentorname})
        if(searchmentor){
            var data = await db.collection("mentor").findOne({mentor:mentorname})
            res.status(200).json({data})
        }
        else{
            res.status(200).send("Mentor does not exist")
        }
    } catch (error) {
        console.log("count not connect due to ", error)
    }
    finally{
        await client.close();
    }
})

//Change mentor for a particular student

app.put("/change-mentor/:student", async (req, res)=>{

    var client = await mongoClient.connect(dbUrl,{useNewUrlParser: true, useUnifiedTopology: true});
    var studentname = req.params.student;

    try {

        var db = client.db("mentorstudent");
        let searchstudent = await db.collection("student").findOne({student:studentname})
        let searchmentor = await db.collection("mentor").findOne({mentor:req.body.mentor})
        
        // console.log(searchstudent);
        // console.log(currentmentor);
        // console.log(searchmentor);
        
        if(searchstudent&&searchmentor){
            
                let currentmentor = searchstudent.mentor;
                var newmentordata = await db.collection("mentor").findOneAndUpdate({mentor:req.body.mentor}, {$addToSet:{student:studentname}})

                var oldmentordata = await db.collection("mentor").findOneAndUpdate({mentor:currentmentor}, {$pull:{student:studentname}})

                var studata = await db.collection("student").findOneAndUpdate({student:studentname}, {$set:{mentor:req.body.mentor}})
                // console.log(data);
                res.status(200).send("Data updated")          
        }
        else{
            res.status(200).send("Mentor or Student does not exist. Please check and enter again")
        }
    } catch (error) {
        console.log("count not connect due to ", error)
    }
    finally{
        await client.close();
    }
})

//deleting mentors and students

app.delete("/delete-mentor/:mentor", async (req,res)=>{

    var client = await mongoClient.connect(dbUrl,{useNewUrlParser: true, useUnifiedTopology: true});
    var mentorname = req.params.mentor;;

    try {
        var db = client.db("mentorstudent");
        let searchmentor = await db.collection("mentor").findOne({mentor:mentorname})

        if(searchmentor){
            
                // var studata = await db.collection("student").findOneAndUpdate({mentor:mentorname}, {$set:{mentor:""}})
                var studata = await db.collection("student").updateMany({mentor:mentorname},{$set:{mentor:""}});

                var data = await db.collection("mentor").findOneAndDelete({mentor:mentorname});
                // console.log(data);
        
            res.status(200).send("Mentor deleted")
        }
        else{
            res.status(200).send("Mentor does not exist")
        }
    } catch (error) {
        console.log("count not connect due to ", error)
    }
    finally{
        await client.close();
    }
})

app.delete("/delete-student/:student", async (req,res)=>{

    var client = await mongoClient.connect(dbUrl,{useNewUrlParser: true, useUnifiedTopology: true});
    var studentname = req.params.student;

    try {

        var db = client.db("mentorstudent");
        var searchstudent = await db.collection("student").findOne({student:studentname})
        if(searchstudent){

            currentmentor = searchstudent.mentor;
            var data = await db.collection("student").findOneAndDelete({student:studentname});
            var oldmentordata = await db.collection("mentor").findOneAndUpdate({mentor:currentmentor}, {$pull:{student:studentname}})
            // console.log(data);
            res.status(200).send("student deleted")
        }
        else{
            res.status(200).send("Student does not exist in the system")
        }
    } catch (error) {
        console.log("count not connect due to ", error)
    }
    finally{
        await client.close();
    }
})

//listen to the port

app.listen((port), ()=>{
    console.log("listening to port", port);
})