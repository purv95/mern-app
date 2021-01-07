//Dependancy Imports
const express = require("express");
const { ApolloServer, PubSub } = require("apollo-server-express");
const http = require("http");
// const path = require("path");
const cloudinary = require("cloudinary");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");

//Relative Imports
const typeDefs = require("./graphql/typeDefs");
const resolvers = require("./graphql/resolvers");
const {
  MONGODB,
  CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET,
} = require("./config.js");
const checkAuth = require("./util/check-auth");

const pubsub = new PubSub();

const app = express();

const PORT = process.env.port || 5000;

app.use(cors());
app.use(bodyParser.json({ limit: "5 mb" }));

const apolloServer = new ApolloServer({
  typeDefs,
  resolvers,
  context: ({ req }) => ({ req, pubsub }),
});

const httpserver = http.createServer(app);

app.get("/rest", function (req, res) {
  res.json({
    data: "you hit rest endpoint great!",
  });
});

mongoose
  .connect(MONGODB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false,
  })
  .then(() => {
    console.log("MongoDB Connected");
    // return server.listen({ port: 5000 });
    return apolloServer.applyMiddleware({ app });
  })
  .catch((err) => {
    console.log(err);
  });

// cloudinary config
cloudinary.config({
  cloud_name: CLOUDINARY_CLOUD_NAME,
  api_key: CLOUDINARY_API_KEY,
  api_secret: CLOUDINARY_API_SECRET,
});

// upload
app.post("/uploadimages", (req, res) => {
  cloudinary.uploader.upload(
    req.body.image,
    (result) => {
      console.log(result);
      res.send({
        // url: result.url,
        url: result.secure_url,
        public_id: result.public_id,
      });
    },
    {
      public_id: `${Date.now()}`, // public name
      resource_type: "auto", // JPEG, PNG
    }
  );
});

// port
httpserver.listen({ port: PORT }, function () {
  console.log(`server is ready at http://localhost:${PORT}`);
  console.log(
    `graphql server is ready at http://localhost:${PORT}${apolloServer.graphqlPath}`
  );
});
