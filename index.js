const express=require('express')
const cors=require('cors')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser')
const app=express()
const port=process.env.PORT || 5000

app.use(cors(
  {
    origin:"http://localhost:5173",
    credentials:true
  }
))
app.use(express.json())
app.use(cookieParser())




const uri = `mongodb+srv://${process.env.DB_Person}:${process.env.DB_Access}@cluster0.uqcmivv.mongodb.net/?retryWrites=true&w=majority&appName=Cluster`;

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
    await client.connect();
   
    const doctorCollection =client.db("carDoctorDB").collection("doctor");
    const orderCollection =client.db("carDoctorDB").collection("order");

    
    
        
    app.post('/token',(req,res)=>{
      const user=req.body
      const userToken=jwt.sign(user,process.env.DB_Exist,{ expiresIn: '1h' })
      
      // console.log(setCookie)
      res.cookie('token',userToken,{
        expires: new Date(Date.now() + 900000),
        httpOnly: true, 
        secure: process.env.NODE_ENV === 'production', 
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
    })
      .send('success');


    })


    app.get('/doctors',async(req,res)=>{
      const cursor = doctorCollection.find();
      const result=await cursor.toArray()
      res.send(result)
      
    })
    app.get('/doctors/:Id',async(req,res)=>{
       const id=req.params.Id
       const query = { _id: new ObjectId(id) };
       
       const result= await doctorCollection.findOne(query);
       res.send(result)
       
    })
    app.post('/order',async(req,res)=>{
      const value=req.body;
      const result = await orderCollection.insertOne(value);
      res.send(result)
      console.log(value)

    })
    app.get('/order',async(req,res) => {
      //  console.log(req.query.email)
       console.log('client set token',req.cookies.token)
       let query={}
       if(req.query?.email){
        query={email:req.query?.email}
       }
       const result=await orderCollection.find(query).toArray()
       res.send(result)
    })
    app.delete('/order/:id',async(req,res) => {
      const Id=req.params.id;
      const query = { _id: new ObjectId(Id) };
    const result = await orderCollection.deleteOne(query);
    res.send(result)
    })
    app.patch('/ordered/:id',async(req,res)=>{
      const Id=req.params.id;
      const filter = { _id: new ObjectId(Id) };
      const value=req.body;
      console.log(value)
      const updateDoc = {
        $set: {
          status:value.status
        },
      };
      const result = await orderCollection.updateOne(filter, updateDoc);
      res.send(result)
    })




    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get('/',(req,res)=>{
    res.send('This is car doctor server')
})
app.listen(port,() => {
    console.log(`This from server ${port}`)
})