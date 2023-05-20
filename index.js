const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()

const port = process.env.PORT || 5000;

const app = express();
app.use(cors());
app.use(express.json());



const uri = `mongodb+srv://${process.env.SECRET_USER}:${process.env.SECRET_PASS}@cluster0.xhpmdyt.mongodb.net/?retryWrites=true&w=majority`;



// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});



async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    client.connect();
    // Send a ping to confirm a successful connection

    const database = client.db("heroHavenDB");
    const toys = database.collection("toys");

    

    app.get('/',(req,res)=>{
      res.send('Hello from Hero Haven');
    })

    app.post('/add-toy',async(req,res)=>{
      const data = req.body;
      // console.log(data);
      const result = await toys.insertOne(data);
      res.send(result);
    })

    app.get('/all-toys',async(req,res)=>{
      let query= {};
      if(req.query?.email){
        query={userEmail:req.query.email}
      }
      // console.log('query : ',query);
      let result;
      if(query?.userEmail){
        result = await toys.find(query).toArray();
      }
      else{
        result = await toys.find().toArray();
      }
      res.send(result || []);
    })

    app.get('/details/:id',async(req,res)=>{
      const id = req.params.id;
      const result = await toys.findOne({_id:new ObjectId(id)});
      res.send(result);
    })
    
    

    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  }
  finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.listen(port,()=>{
  console.log('listening from ',port);
})

