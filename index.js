const express = require('express')
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

require('dotenv').config();
const app = express()
const port = process.env.PORT || 5000

const multer = require('multer')

const imgconfig = multer.diskStorage({
    destination:(req,file,callback)=>{
        callback(null,"./uploads")
    },
    filename:(req,file,callback)=>{
        callback(null,`image-${Date.now()}-${file.originalname}`)
    }
})


// img filter
const isImage = (req,file,callback)=>{
    if(file.mimetype.startsWith("image")){
        callback(null,true)
    }else{
        callback(new Error("only images is allowd"))
    } 
}

const upload = multer({
    storage:imgconfig,
    fileFilter:isImage
});

//middlewere
app.use(cors())
app.use(express.json())
app.use(express.static('./uploads'));

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.PASS}@cluster0.id9tm.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
async function run() {
    try {
        await client.connect();
        const mediaCollection = client.db("doctors_portal").collection("media");
        
        app.get('/media', async (req, res) => {
            const query = {};
            const cursor = mediaCollection.find(query);
            const media = await cursor.toArray();
            res.send(media);
        });

        app.get('/blog/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const Blog = await mediaCollection.findOne(query);
            res.send(Blog);

        });

        app.post('/addPost', upload.single("image"), async (req, res) => {
            const { description} = req.body; 
            const {filename}= req.file;
            const media = {description,image:filename}        
            const result = await mediaCollection.insertOne(media)
            return res.send({ success: true, result })
        })


    }
    finally {

    }
}
run().catch(console.dir);
app.get('/', (req, res) => {
    res.send('Hello form Blog')
})

app.listen(port, () => {
    console.log(`Blog listening on port ${port}`)
})