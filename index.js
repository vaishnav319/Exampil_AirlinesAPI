//This code was done by M.Vaishnav(email:msvsurya1@gmail.com)
//Here I have done server side using NODEJS and database using MONGO_DB
//This code is done as per given instructions given in documentation
//Completed creating all endpoints and everything with validation . ex: passenger airline validation

require('dotenv').config();

//Libraries
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';

//requirements
const airlines = express();
const PORT = process.env.PORT || 5000;

// middleware
airlines.use(express.json());
airlines.use(cors());

//body-parser
airlines.use(bodyParser.urlencoded({ extended: true }));
airlines.use(bodyParser.json());
//Database Models

import AirlinesDB from './database/Airlines';
import PassengersDB from './database/Passenger';

//DB config
mongoose
  .connect(process.env.MONGO_URL)
  .then(() => console.log('connected to database'));

airlines.get('/', (req, res) =>
  res
    .status(200)
    .send('Your server is running and you can go to /airlines for url data')
);
/*
Route           /airlines
Description     Getting all airlines
Access          Public
Parameter       None
Method          GET
*/
airlines.get('/airlines', async (req, res) => {
  try {
    const getAllAirlinesData = await AirlinesDB.find();
    return res.json(getAllAirlinesData);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});
/*
Route           /airlines/new
Description     Adding a new Airline and also validating id
Access          Public
Parameter       None
Method          POST
*/
airlines.post('/airlines', async (req, res) => {
  try {
    const { newAirlines } = req.body;
    await AirlinesDB.findAirline(newAirlines.id);
    const addNewAirlines = AirlinesDB.create(newAirlines);
    return res.json({
      Airlines: addNewAirlines,
      message: 'Airlines was added',
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});
/*
Route           /airlines/:id
Description     Get specific airline info based on id
Access          Public
Parameter       id
Method          GET
*/
airlines.get('/airlines/:id', async (req, res) => {
  const getSpecificAirline = await AirlinesDB.findOne({ id: req.params.id });

  if (!getSpecificAirline) {
    return res.json({
      error: `No Airline found on id ${req.params.id}`,
    });
  }
  return res.json({ Airline: getSpecificAirline });
});

/*
Route            /passengers
Description     ADD a new passenger by checking a valid airline
Access          Public
Parameter       none
Method          POST
*/
airlines.post('/passengers', async (req, res) => {
  try {
    const { newPassenger } = req.body;
    //checking whether
    await AirlinesDB.findAirlineByID(newPassenger);
    const airid = newPassenger.airline;
    const airline = await AirlinesDB.findOne({ id: airid });
    newPassenger.airline = airline;
    //adding new passenger
    const addNewPassenger = PassengersDB.create(newPassenger);
    return res.json({
      Passenger: addNewPassenger,
      message: 'Passenger was added',
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

/*
Route            /passengers/:id
Description     Get specific passenger info based on id
Access          Public
Parameter       id
Method          GET
*/
airlines.get('/passengers/:id', async (req, res) => {
  const getSpecificPassenger = await PassengersDB.findOne({
    _id: req.params.id,
  });
  if (!getSpecificPassenger) {
    return res.json({
      error: `No Passenger found for the id ${req.params.id}`,
    });
  }
  return res.json({ Passenger: getSpecificPassenger });
});

/*
Route            /passengers/delete
Description     Delete a passenger
Access          Public
Parameter       _id
Method          DELETE
*/

airlines.delete('/passengers/delete/:id', async (req, res) => {
  try {
    const updatedPassengers = await PassengersDB.findOneAndDelete({
      _id: req.params.id,
    });
    return res.json({
      Passengers: updatedPassengers,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

/*
Route           /passengers/:id
Description     Update a passenger name
Access          Public
Parameter       _id
Method          PATCH
*/
airlines.patch('/passengers/:id', async (req, res) => {
  try {
    const updatedDetails = req.body;
    const id = req.params.id;
    await PassengersDB.findOneAndUpdate({ _id: id }, { $set: updatedDetails });
    return res.json({
      Passenger: updatedDetails,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

/*
Route            /passengers/:id
Description     Update a passenger name,trips and airline
Access          Public
Parameter       _id
Method          PUT
*/
airlines.put('/passengers/:id', async (req, res) => {
  try {
    const updatedDetails = req.body;
    await AirlinesDB.findAirlineByID(updatedDetails);
    const id = req.params.id;
    const airid = updatedDetails.airline;
    const airline = await AirlinesDB.findOne({ id: airid });
    updatedDetails.airline = airline;
    await PassengersDB.findOneAndUpdate({ _id: id }, { $set: updatedDetails });
    return res.json({
      Passenger: updatedDetails,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});
/*
Route            /passengers
Description     Getting passengers based on pagination
Access          Public
Parameter       page & size
Method          GET
*/
airlines.get('/passengers', async (req, res) => {
  const page = req.query.page;
  const size = req.query.size;
  const startIndex = (page - 1) * size;
  const endIndex = page * size;
  const getAllPassengers = await PassengersDB.find();
  const result = getAllPassengers.slice(startIndex, endIndex);

  res.json({
    'Total Passengers': getAllPassengers.length,
    'total Pages': Math.floor(getAllPassengers.length / size),
    ' data': result,
  });
});

airlines.listen(PORT, () => {
  console.log(`server is running at port ${PORT}`);
});
