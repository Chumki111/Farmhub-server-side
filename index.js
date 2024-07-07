const express = require('express')
const app = express()
require('dotenv').config()
const cors = require('cors')
const cookieParser = require('cookie-parser')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const jwt = require('jsonwebtoken')
const port = process.env.PORT || 8000

// middleware
const corsOptions = {
  origin: ['http://localhost:5173', 'http://localhost:5174'],
  credentials: true,
  optionSuccessStatus: 200,
}
app.use(cors(corsOptions))
app.use(express.json())
app.use(cookieParser())

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(process.env.DB_URL, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {

    const servicesCollection = client.db('Farmhub').collection('services')
    const productCollection = client.db('Farmhub').collection('products')



    // get all products
    app.get('/products', async (req, res) => {
      const result = await productCollection.find().toArray();
      res.send(result)
    })
    // get all products by filter
    app.get('/allProducts', async (req, res) => {
      const filter = req.query;
      const query = {};
      const options = {};

      // Add category filter if available
      if (filter.category) {
        query.category = filter.category;
      }

      // Add color filter if available
      if (filter.color) {
        query.color = filter.color;
      }

      // Add unit filter if available
      if (filter.unit) {
        query.unit = filter.unit;
      }

      // Include sorting options if available
      if (filter.sort) {
        options.sort = {
          price: filter.sort === 'asc' ? 1 : -1
        };
      }
      const products = await productCollection.find(query).sort(options.sort).toArray();
      res.send(products)
    })
    // get single product
    app.get('/product/:id', async (req, res) => {
      id = req.params.id;
      const result = await productCollection.findOne({ _id: new ObjectId(id) })
      res.send(result)
    })
    // all services get
    app.get('/services', async (req, res) => {
      const result = await servicesCollection.find().toArray();
      res.send(result)
    })
    // get single services
    app.get('/service/:id', async (req, res) => {
      const id = req.params.id;
      const result = await servicesCollection.findOne({ _id: new ObjectId(id) });
      res.send(result)
    })
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    //   await client.close();
  }
}
run().catch(console.dir);

app.get('/', (req, res) => {
  res.send('Hello from Farmhub Server..')
})

app.listen(port, () => {
  console.log(`Farmhub is running on port ${port}`)
})