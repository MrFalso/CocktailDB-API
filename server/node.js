const express = require('express');
const { MongoClient } = require('mongodb');
const bodyParser = require('body-parser')
const cors = require('cors');
const app = express();
let port = 3000;

app.use(cors());
app.use(bodyParser.json());

const client = new MongoClient('mongodb+srv://teddy:te3br30lo10@fisrtcluster.bkj0sed.mongodb.net/');

async function getUser(res, nome) {
    try {
        await client.connect();
        let user = await client.db('CocktailDB').collection('users').findOne({nome: nome});
        if (user === null)
            res.status(404).send({error: {status: 404, message: "Utente non trovato"}});
        else
            res.status(201).send(user);
    } finally {
        await client.close();
    }
}

async function loginUser(res, body) {
    console.log(body);
    try {
        await client.connect();
        let user = await client.db('CocktailDB').collection('users').findOne({
            nome: body.nome, 
            password: body.password
        });
        console.log(user);
        if (user === null) {
            res.status(404).send({error:{status: 404, message: "Utente non trovato o password sbagliata"}})
        } else {
            res.status(201).send();
        }
    } finally {
        await client.close();
    }
}

async function addDrink(res, body) {
    console.log(body);
    try {
        await client.connect();
        let user = await client.db('CocktailDB').collection('users').findOne({
            nome: body.nome_utente, 
            drink_preferiti: body.id_drink
        });
        console.log(user);
        if (user === null) {
            await client.db('CocktailDB').collection('users').updateOne(
                { nome: body.nome_utente },
                { $push: {drink_preferiti: body.drink_preferiti} });
        } else {
            res.status(400).send();
        }
    } finally {
        await client.close();
    }
}

async function getComments(res, drink_id) {
    console.log(drink_id);
    try {
        await client.connect();
        let comment = await client.db('CocktailDB').collection('commenti').findOne({id_drink: drink_id});

        if (comment === null) {
            res.status(404).send({error: {status: 404, message: "Non sono presenti commenti"}});
        } else {
            res.status(200).send(comment);
        }
    } finally {
        await client.close();
    }
}

async function addComment(res, body) {
    try {
        await client.connect();

        let drink = await client.db('CocktailDB').collection('commenti').findOne({id_drink: body.id_drink});

        console.log(drink);

        if (drink === null) {
            const doc = {
                id_drink: body.id_drink,
                commenti: [
                    body.commento
                ]
            };
            let result = await client.db('CocktailDB').collection('commenti').insertOne(doc);

            console.log(result.insertedId);

            res.status(201).send({success: {status: 201, message: "Commento aggiunto"}});
        } else {
            let result = await client.db('CocktailDB').collection('commenti').updateOne(
                { id_drink: body.id_drink },
                { $push: {commenti: body.commento }});
            
            res.status(201).send({success: {status: 201, message: "Commento aggiunto"}});
        }
    } finally {
        await client.close();
    }
}

app.post('/addComment', (req, res) => {
    addComment(res, req.body)
        .catch((err) => console.log(err));
});

app.get('/getComments', (req, res) => {
    getComments(res, req.query.id)
        .catch((err) => console.error(err));
})

app.post('/addDrink', (req, res) => {
    addDrink(res, req.body)
    .catch((err) => console.error(err));
});

app.post('/login', (req, res) => {
    loginUser(res, req.body)
        .catch((err) => console.error(err));
});

app.get('/getUser/:id', (req, res) => {
    getUser(res, req.params.id)
        .catch((err) => console.error(err));
});

app.listen(port, () => {
    console.log(`Hello from port: ${port}`);
});