// ZhuUW7Yq5GfMJwfM
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const express = require('express')
const cors = require('cors')
const app = express()
const jwt = require('jsonwebtoken');
const port = process.env.PORT || 5000;
require("dotenv").config()
app.use(cors());
app.use(express.json());

console.log(process.env.ACCESS_TOKEN_SECRET);

const uri = `mongodb+srv://${process.env.USER_DB}:${process.env.DB_PASS}@cluster0.f4myxpg.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

const verifyJWT =(req,res,next)=>{
  // console.log("abc" ,req.headers.authorization);

  const authorization = req.headers.authorization;
  if(!authorization){
    return res.stutus(404).send({error:true, message:"unothorized verify"})
  }

  const token = authorization.split(" ")[1]
 

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (error, decoded)=> {
    if(error){
      return res.stutus(404).send({error:true, message:"unothorized verify"})
    }
    req.decoded=decoded;
    next()
   
  });
 } 



async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

   
  const serviceCollection = client.db("carsDoctor").collection("Survice");
  const bokingcolection = client.db("carsDoctor").collection("bookings")


   app.post("/jwt",(req,res)=>{
    const user = req.body;
    var token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET,  { expiresIn: '1hr' });
    res.send({token});
    console.log({token});
   })


  app.get("/Survices",async(req,res)=>{
    const cursor = serviceCollection.find()
    const result = await cursor.toArray()
    res.send(result);
  })

  app.get("/Survices/:id",async(req,res)=>{
     const id = req.params.id; 
     const quiry = {_id: new ObjectId(id)}

     const options = {
      // Include only the `title` and `imdb` fields in the returned document
      projection: { title: 1, price: 1, service_id: 1, img: 1 },
  };
     const result =await serviceCollection.findOne(quiry,options);
     res.send(result);
  })
  
 app.get("/bookings",verifyJWT,  async(req,res)=>{
  
  const decoded = req.decoded;
  console.log( decoded)

  if(decoded.email !== req.query.email){
      return res.status(403).send({error: 1, message: 'forbidden access'})
  }
  let quiry = {}
  if(req.query?.email){
    quiry = {email:req.query?.email}
  }
  const result =await bokingcolection.find(quiry).toArray();
  res.send(result);
 })


  app.post("/bookings",async(req,res)=>{
    const boooking = req.body;
    // console.log(boooking);
    const result =await bokingcolection.insertOne(boooking);
    console.log(result);
    res.send(result)
  })

 app.patch("/bookings/:id",async(req,res)=>{
  const id= req.params.id;
  const updateBooking = req.body;
  const filter = {_id: new ObjectId(id)}

  const UpdateDoc = {
    $set :{
      stutus:updateBooking.stutus
    },
  }

  const result =await bokingcolection.updateOne(filter,UpdateDoc);
  res.send(result);

 })


  app.delete("/bookings/:id",async(req,res)=>{
    const id = req.params.id;
    const quiry = {_id: new ObjectId(id)};
    const result =await bokingcolection.deleteOne(quiry);
    res.send(result);
  })





    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);






app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})