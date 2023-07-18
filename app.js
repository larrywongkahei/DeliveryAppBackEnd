const express = require('express');
const app = express()

const { MongoClient } = require('mongodb');
const cors = require('cors');

const url = "mongodb+srv://makemak123:'password'@clusterdelivery.jz2kqb0.mongodb.net/?retryWrites=true&w=majority";
const client = new MongoClient(url);

const db = client.db('BMG')
const coll = db.collection('Users')
const { signup, checkIfUserExist, updateSignUpForm, getWorkdays, updateDelivery, deleteDelivery, checkUser, changePassword } = require('./apiFunctions')

client.connect();

app.use(cors());
app.use(express.json()); 
const port = process.env.PORT || 3000


app.listen(port)
app.get('/', (req, res) => {
res.send(`${port}`);
});

app.get('/data', (req, res) => {
    const name = req.query.name
    const email = req.query.email
    if(name){
        getWorkdays(name, coll)
        .then(data => res.json(data))
    }else{
        checkUser(email, coll)
        .then(response => {
            if(response){
                res.sendStatus(200)
            }else{
                res.sendStatus(400)
            }
        })
    }
})


app.get('/deliveries', (req, res) => {
    coll.find().toArray()
    .then(res.sendStatus(200))
    })


app.post('/createuser', (req, res) => {
    signup(req.body, coll)
    .then(response => {
        if (response){
            res.sendStatus(200)
        }else{
            res.sendStatus(400)
        }
    })
})

app.put('/changePassword', (req, res) => {
    changePassword(req.body, coll)
    .then(response => {
        if(response){
            res.sendStatus(200)
        }else{
            res.sendStatus(400)
        }
    })
})

app.post('/login', (req, res) => {
    checkIfUserExist(req.body, coll)
    .then(response => {
        if (response){
            res.sendStatus(200)
        }else{
            res.sendStatus(500)
        }
    })
    
})

app.put('/update', (req, res) => {
    updateSignUpForm(req.body, coll)
    .then(res.sendStatus(200))
})

app.put('/addDelivery', (req, res) => {
    updateDelivery(req.body, coll)
    .then(data => res.json(data))
})

app.put('/deleteDelivery', (req, res) => {
    deleteDelivery(req.body, coll)
    .then(response => {
        res.json(response)
        res.status(200)
    })
})



