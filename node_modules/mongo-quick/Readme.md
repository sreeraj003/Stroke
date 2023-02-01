# mongo-quick

Quick start with mongodb, right now.

Table of Contents

- [mongo-quick](#mongo-quick)
  - [New release with no breaking changes plus typescript support now 😉](#new-release-with-no-breaking-changes-plus-typescript-support-now-)
  - [Alert](#alert)
  - [Usage](#usage)
    - [For non-typescript users](#for-non-typescript-users)
    - [For typescript users](#for-typescript-users)
  - [Example 0](#example-0)
  - [Example 1](#example-1)
  - [Example 2](#example-2)
  - [Example 3](#example-3)
  - [Example 4](#example-4)
  - [Example 5](#example-5)
  - [Happy hackings!](#happy-hackings)

The motive of this library is to just jump start with mongoose without much crucial logging for saving data, deleting collections, making models, etc.

To request feature for this library or any questions please create respective issue here <https://github.com/sahilrajput03/mongo-quick/issues/new> .

**Quick tip 1:** Install this library via, `npm i mongo-quick`

**Quick tip 2:** Run below command to add db's address to .env file

`echo MONGO_DB_URI=mongodb://localhost/testdb >> .env` You can specify any your own atlas or mongo database server (mongoDB) running on somewhere else.

## New release with no breaking changes plus typescript support now 😉

~~Quick tip 3: Add `"type": "module"` in root object to your package.json file~~

~~Quick tip 4: Add start script `node.exe --no-warnings index.js` in package.json file.~~

~~Quick tip 5: Add dev script `nodemon -q -x node.exe --no-warnings index.js` in package.json file.~~

Now you don't need to make it difficult to start using this 👉awesome library. You just install and start using `mongo-quick` in any existing project.

## Alert

- Define a .env file and put `MONGO_DB_URI=mongodb://localhost/testdb` there(otherwise it won't connect to mongodb). I have set it up with local db, but you can use any
  online/offline mongodb

- You **don't need to install `mongoose` or `dotenv`**, they are already inscribed this `mongo-quick` library.

## Usage

There are examples below using respective features from `mongo-quick` library .

**Quick tip 3:** Remember `methods` having `Lazy`😂 in their names tells that you need to call them by prefixing them with `await` keyword. :D

**Quick tip 4:** Remember `methods` having `InLog`😂 in their names tells that you'll receive nice logs about the execution/results of those statements in console. :D

### For non-typescript users

Start quick with a new npm project from scratch, like this

```bash
mkdir quick-learnings && cd quick-learnings && npm init -y
npm i mongo-quick
npm i -g nodemon
echo MONGO_DB_URI=mongodb://localhost/testdb >> .env
echo console.log('Paste any example from `mongo-quick` docs in this file.') >> server.js
nodemon --quiet server.js
echo Thanks for trying mongo-quick.
```

Paste any of the below **Examples** in `server.js` file, and see mongo-quick in action.

### For typescript users

Start quick with a new typescript project from scratch, like this

```bash
mkdir quick-learnings && cd quick-learnings && npm init -y
npm i -D typescript
npm i -g ts-node-dev
npm i mongo-quick
echo MONGO_DB_URI=mongodb://localhost/testdb >> .env
tsc --init
echo console.log('Paste any example from `mongo-quick` docs in this file.') >> server.ts
ts-node-dev --respawn --clear server.ts
echo Thanks for trying mongo-quick.
```

**Note**: As I quote from ts-node-dev docs: 
  
  "The good thing is that ts-node-dev watches used tsconfig.json file, and will reinitialize compilation on its change, but you have to restart
the process manually when you update used version of typescript or make any other changes that may effect compilation results."

So, after editing your tsconfig.json file, you must manually restart the ts-node-dev server.

Configure `tsconfig.json` file like that -

```json
  "compilerOptions": {
    "target": "ES6",
    "module": "commonjs",
    "outDir": "./lib"
    ...other default config from typescript.
  }
```

Put any of the below **Examples** in `server.ts` file, and use ``to see mongo-quick in action. Or you may simply use,`tsnd server.js` to run though.

Tip (`tsnd` is just shorthand for `ts-node-dev`).

## Example 0

```js
import { connectMongoDb_Lazy_InLog, saveToCollection_Lazy, useCollection, deleteCollection_Lazy_InLog, closeConnection, saveToCollection_Lazy_Piped } from "mongo-quick";
// You can use destructuring styled named imports too, but I recommend serving all of them just from a single default export just like I have done in below examples via `mq`.
```

## Example 1

```js
const mq = require("mongo-quick");
// import mq from "mongo-quick"; //For typescript users.

(async function () {
  const itemCollection2020 = mq.useCollection("itemCollection2020", {
    itemModel: String,
    itemAuthor: String,
    // So, ^^^^^^ here goes your mongoose schema for a model.
  });
  // itemCollection2020 is nothing but the model returned by mongoose.model() method.

  console.log(await mq.connectMongoDb_Lazy_InLog());
  // Tip: This automatically picks the database uri of MONGO_DB_URI from .env file.

  await mq.saveToCollection_Lazy(itemCollection2020, {
    itemModel: "Cadbury - Dairy Milk",
    itemAuthor: "Nestle",
    // So, ^^^^^^ here goes the data you want to save to the collection in mongodb.
  });

  console.log(await mq.deleteCollection_Lazy_InLog(itemCollection2020));
  // Deletes all documents in the collection and logs the deletion process info after that.

  mq.closeConnection();
  // This will simply close the mongodb connection.
})();
```

## Example 2

```js
const mq = require("mongo-quick");
// import mq from "mongo-quick"; //For typescript users.

(async function () {
  const itemCollection2020 = mq.useCollection("itemCollection2020", {
    Dimensions: Array,
    Author: String,
    Specialization: String,
    Angle: Object,
    Sides: Object,
    Edges: Number,
    Roundness: String,
    // Note order is IMPORTANT, coz piped method will save the data with same order of the keys of the schema. :)
    // Try keeping Arrays at top, coz mongodb does that too,  you can obviously ignore this tip though.
  });

  console.log(await mq.connectMongoDb_Lazy_InLog());

  await mq.saveToCollection_Lazy_Piped(itemCollection2020, [22, 33, 444], "Ramanujan", "Mathematician", { x: 20, y: 30, z: 50 }, { x: 10, y: 8 }, 4, "Completely Round");

  mq.closeConnection();
})();
```

## Example 3

```js
const mq = require("mongo-quick");
// import mq from "mongo-quick"; //For typescript users.

(async function () {
  const itemCollection2020 = mq.useCollection("itemCollection2020");

  console.log(await mq.connectMongoDb_Lazy_InLog());

  await mq.saveToCollection_Lazy(itemCollection2020, {
    quality: "top notch",
    age: "ancient-era",
    style: [1, 2, 3, 4],
    behaviour: { ca: 20, ma: 40 },
    sharpness: 44,
    coolness: true,
  });
  // console.log(await mq.deleteCollection_Lazy_InLog(itemCollection2020))

  mq.closeConnection();
})();
```

## Example 4

```js
const mq = require("mongo-quick");
// import mq from "mongo-quick"; //For typescript users.

(async function () {
  console.log(await mq.connectMongoDb_Lazy_InLog());

  await mq.saveToCollection_Lazy("itemCollection2020", {
    // Adding data to collection by ^^^ providing collection name as parameter.
    quality: "top notch",
    age: "ancient-era",
    style: [1, 2, 3, 4],
    behaviour: { ca: 20, ma: 40 },
    sharpness: 44,
    coolness: true,
  });

  mq.closeConnection();
})();
```

## Example 5

```js
const mq = require("mongo-quick");
// import mq from "mongo-quick"; //For typescript users.

(async function () {
  console.log(await mq.connectMongoDb_Lazy_InLog());

  console.log(await mq.deleteCollection_Lazy_InLog("itemCollection2020"));
  // Deleting collection by passing collection name as ^^^ parameter.

  mq.closeConnection();
})();
```

## Happy hackings!
