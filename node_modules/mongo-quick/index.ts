import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config();

export async function connectMongoDb_Lazy_InLog() {
  console.log("--------------");
  console.log("INFO: Connecting to database.");
  // console.log("Temp log: ",process.env.MONGO_DB_URI) // mylog.
  await mongoose
    .connect(process.env.MONGO_DB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
      useCreateIndex: true,
    })
    .then(() => {
      console.log("SUCCESS: ☻ Connection successful ☺.");
    })
    .catch((error) => {
      console.log("error connection to MongoDB:", error.message);
    });
  return "THANKS: For awaiting connectMongoDb().\n--------------";
}
export async function saveToCollection_Lazy(collection, data) {
  if (typeof collection == "string") {
    collection = useCollection(collection, null);
  }
  try {
    const savedData = await new collection(data).save();
    console.log("INFO: ", savedData);
  } catch (error) {
    console.log(`==NAKED ERROR== ${error.message} ==produced by== ${error.name}.`);
  }
}

export const useCollection = (collectionName, schemaObject) => {
  return mongoose.model(collectionName, new mongoose.Schema(schemaObject, schemaObject || {strict: false}));
};

export const deleteCollection_Lazy_InLog = (collection) => {
  if (typeof collection == "string") collection = useCollection(collection, null);
  return collection.deleteMany({});
};
export const closeConnection = () => mongoose.connection.close();

export const saveToCollection_Lazy_Piped = async (collection, ...val) => {
  const pipe = (collection, ...val) => {
    console.log(val);
    let objectx = JSON.parse(JSON.stringify(collection.schema.obj));
    let schema = Object.keys(collection.schema.obj);
    let i = 0;
    for (let key of schema) {
      objectx[key] = val[i++];
    }
    return objectx;
  };
  return await saveToCollection_Lazy(collection, pipe(collection, ...val));
};

export default {
  connectMongoDb_Lazy_InLog,
  saveToCollection_Lazy,
  useCollection,
  deleteCollection_Lazy_InLog,
  closeConnection,
  saveToCollection_Lazy_Piped,
};
