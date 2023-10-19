const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const express = require("express");
const cors = require("cors");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;

// MIDDLEWARE
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.iixzvov.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection

    const productCollection = client
      .db("compHarborDB")
      .collection("productCollection");

    const brandCollection = client
      .db("compHarborDB")
      .collection("brandCollection");

    const cartCollection = client
      .db("compHarborDB")
      .collection("cartCollection");

    // Setting up GET API for all brands
    app.get("/brands", async (req, res) => {
      const cursor = brandCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    //   Setting up POST API for product
    app.post("/products", async (req, res) => {
      const newProduct = req.body;
      console.log(newProduct);
      const result = await productCollection.insertOne(newProduct);
      res.send(result);
    });

    // Setting up GET API for all products
    app.get("/products", async (req, res) => {
      const cursor = productCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    // Setting up GET API for all products based on brands
    app.get("/products/:brand", async (req, res) => {
      const brand = req.params.brand;
      const query = { product_brand: brand };
      const result = await productCollection.find(query).toArray();
      res.send(result);
    });

    // Setting up GET API for single product based on ID
    app.get("/product/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await productCollection.findOne(query);
      res.send(result);
    });

    // Setting up PUT API for single product
    app.put("/product/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updatedProduct = req.body;
      const details = {
        $set: {
          product_name: updatedProduct.product_name,
          product_image: updatedProduct.product_image,
          product_brand: updatedProduct.product_brand,
          product_type: updatedProduct.product_type,
          product_price: updatedProduct.product_price,
          product_rating: updatedProduct.product_rating,
          product_description: updatedProduct.product_description,
        },
      };

      const result = await productCollection.updateOne(query, details, options);
      res.send(result);
    });

    // Setting up POST API for cart
    app.post("/carts", async (req, res) => {
      const newProductForCart = req.body;
      console.log(newProductForCart);
      const result = await cartCollection.insertOne(newProductForCart);
      res.send(result);
    });

    // Setting up GET API for products from cart based on user id
    app.get("/carts/:userID", async (req, res) => {
      const userID = req.params.userID;
      const query = { user_id: userID };
      const result = await cartCollection.find(query).toArray();
      res.send(result);
    });

    // Setting up DELETE API for products in cart
    app.delete("/carts/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await cartCollection.deleteOne(query);
      res.send(result);
    });

    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Server is running.");
});

app.listen(port, (req, res) => {
  console.log(`Server listening on port: ${port}`);
});
