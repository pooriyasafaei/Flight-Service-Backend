var express = require('express');
var router = express.Router();
var fs = require("fs");
var {Client} = require("pg");
var syncrequest = require('sync-request');
const config =   require("./config");

//connect to Postgres
const database = new Client(config);

database.connect(function(err) {
  if (err) throw err;
});

router.get('/account_purchase', async (req, res) => {

    try{
        let token = req.headers['token'];
        let user;
        try{
            user = await (get_user(token));

            if(!user)
            res.status(400).send({message:"invalid user for request" ,code :400});

        } catch(err){
            res.status(400).send({message:"invalid user for request" ,code :400});
        }

        let purchases;
        purchases = await get_purchases(user.Id);

        if(!purchases){
            res.status(400).send({message:"invalid input for purchases" ,code :400});
        } else{
            res.status(200).send(purchases);
        }

    }catch(err){
        console.log(err.stack);
        res.end();
    }
  });

router.get('/account_detail', async (req, res) => {


        let token = req.headers['token'];
        let user;
        try{
            user = await (get_user(token));

            if(!user)
            res.status(400).send({message:"invalid user for request" ,code :400});

            else{
                res.status(200).send(user);
            }

        } catch(err){
            res.status(400).send({message:"invalid user for request" ,code :400});
        }
    });


router.get('/all_available_flights', async (req, res) => {
    try{
        let flights;
        flights = await get_all_flights();
        res.status(200).send(flights);
    }catch(err){
        console.log(err.stack);
        res.end();
    }
});

router.get('/get_filterd_flights', async (req, res) => {
    try{
        let body = req.query;
        let origin = body.origin;
        let destination = body.destination;
        let date = body.date;

        let flights = await get_filtered_flights(origin, destination, date);

        if(!flights){
            res.status(400).send({message:"invalid input for flight search" ,code :400});
        }

        else res.status(200).send(flights);

    }catch(err){
         console.log(err.stack);
        res.status(400).send({message:"invalid input for flight search" ,code :400});
    }
});


var get_user = async function(token){
    try{
        var res = syncrequest('GET', 'http://localhost:9000/user-info', {
        headers: {
            'Authorization': `JWT ${token}`,
        },
        });
        console.log(res.getBody());
        let user = JSON.parse(res.getBody());
        return user;
    }
    catch(err){
        console.log(err.stack);
    }
    // let user;
    // let query = `SELECT * FROM user_account WHERE user_id = ${user_id}`;
    // try{
    //     user = await database.query(query);
    //     return user.rows;

    // }catch(err){
    //     console.log(err.stack);
    // }

}

var get_purchases = async function(user_id){
    let purchases;
    let query = `SELECT * FROM purchase WHERE corresponding_user_id = ${user_id};`;
    try{
        purchases = await database.query(query);
        return purchases.rows;

    }catch(err){
        console.log(err.stack);
    }

}

var get_all_flights = async function(){
    let flights;
    let query = `SELECT * FROM available_offers;`;
    try{
        flights = await database.query(query);
        return flights.rows;

    }catch(err){
        console.log(err.stack);
    }

}

var get_filtered_flights = async function(origin, destination, date){
    let flights;
    let query = `SELECT * FROM available_offers WHERE origin = '${origin}' AND destination = '${destination}' AND departure_local_time::TIMESTAMP::DATE = '${date}';`;
    try{
        flights = await database.query(query);
        return flights.rows;

    }catch(err){
        console.log(err.stack);
    }

}


module.exports = router;
