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

    
    // test purpose
    app.get('/',(req,res)=>{
      res.send('Hello from Hero Haven');
    })

    // insert new toy
    app.post('/add-toy',async(req,res)=>{
      const data = req.body;
      // console.log(data);
      const result = await toys.insertOne(data);
      res.send(result);
    })

    // get by email or category query
    app.get('/all-toys', async (req, res) => {
      const { email, categoryLabel } = req.query;
      let query = {};
    
      if (email) {
        query.userEmail = email;
      } else if (categoryLabel) {
        query['category.label'] = categoryLabel;
      }
    
      let result;

      console.log(query);
    
      if (Object.keys(query).length > 0) {
        result = await toys.find(query).limit(20).toArray();
      } else {
        result = await toys.find().limit(20).toArray();
      }
    
      res.send(result || []);
    });
    

    // search by name
    app.get('/search/:toyName', async (req, res) => {
      const searchString = req.params.toyName;
      const searchWords = searchString.split(/\s+|-/).filter(Boolean).map(word => new RegExp(word, 'i'));
      const query = { toyName: { $all: searchWords } };
      
      const result = await toys.find(query).sort({ _id: 1 }).limit(20).toArray();
      res.send(result || []);
    });
    
    
    
    
    

    // get single document
    app.get('/all-toys/:toyName', async (req, res) => {
      try {
        const toyName = req.params.toyName;
        const regexPattern = new RegExp(toyName.replace(/[-.\s]/g, ''), 'i');
        const query = { toyName: { $regex: regexPattern, $options: 'i' } };
        const result = await toys.find(query).toArray();
        res.send(result || []);
      } catch (error) {
        console.error('Error retrieving toys:', error);
        res.status(500).send('Internal Server Error');
      }
    });
    
    



    // Delete a document
    app.delete('/toys/:id', async (req, res) => {
      const id = req.params.id;
      // console.log(id);
      const result = await toys.deleteOne({ _id:new ObjectId(id) });
      // console.log(result);
      res.send(result)
    });

    // Update a document
    app.get('/toys/:id', async (req,res)=>{
      const id = req.params.id;
      const result = await toys.findOne({_id:new ObjectId(id)});
      // console.log(result)
      res.send(result);
    })
    app.put('/toys/:id', async (req, res) => {
      const id = req.params.id;
        const updates = req.body;
        // console.log(updates)
        const result = await toys.updateOne({ _id:new ObjectId(id) }, { $set: updates });
        // console.log(result);
        res.send(result);
    });

    
    

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

