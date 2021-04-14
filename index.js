const express = require('express')
const bodyParser=require('body-parser')
const cors = require('cors')
const fs=require('fs-extra')
const fileUpload=require('express-fileupload')
const MongoClient=require('mongodb').MongoClient
require('dotenv').config()

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.enpeg.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;

console.log(uri);


const app=express()
app.use(bodyParser.json())
app.use(cors())
app.use(express.static('doctors'))
app.use(fileUpload());
const port = 5000



///port =>
app.get('/',(req,res)=>{
    res.send('db is working')
})

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
  const appointmentCollection = client.db("doctorPortal").collection("appointments");

  const doctorCollection = client.db("doctorPortal").collection("doctors");
   
  app.post('/addAppointment',(req,res)=>{
      const appointment=req.body
      appointmentCollection.insertOne(appointment)
      .then(result=>{
          res.send(result.insertedCount > 0)
      })
  })





  app.post('/appointmentsByDate',(req,res)=>{
      const date=req.body
      const email=req.body.email
      doctorCollection.find({email:email})
     
      .toArray((err, doctors) =>{
        const filter={date: date.date}
      if(doctors.length === 0){
          filter.email = email
      }

      appointmentCollection.find(filter)
      .toArray((err, documents) =>{
        console.log(email, date.date, doctors, documents);
          res.send(documents);
          

      })
      })


 
  })

  app.get('/appointments',(req,res)=>{
      appointmentCollection.find({})
      .toArray((err, documents) =>{
          res.send(documents);
          console.log('documets', documents);
      })
  })

app.post('/addADoctor',(req,res)=>{
    const file=req.files.file;
    const name=req.body.name;
    const email=req.body.email;
    const number=req.body.number;
   
       const newImg=file.data
       const encImg=newImg.toString('base64')
       var image={
           contentType:file.mimetype,
           size:file.size,
           img:Buffer.from(encImg,'base64')
       }
        
        doctorCollection.insertOne({ name, email,number, image})
            .then(result => {
                
                    res.send(result.insertedCount > 0);
                
                
            })
    
})


app.post('/isDoctor',(req,res)=>{
    const email=req.body.email
    doctorCollection.find({email:email})
   
    .toArray((err, doctors) =>{
       res.send(doctors.length > 0)
    })



})







app.get('/doctors',(req,res)=>{
    doctorCollection.find({})
    .toArray((err, documents) =>{
        res.send(documents);
        console.log('documets', documents);
    })
})


});



app.listen(process.env.PORT || port)