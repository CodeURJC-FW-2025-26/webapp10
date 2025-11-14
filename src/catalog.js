import express from 'express';
import { MongoClient, ObjectId } from 'mongodb';

const router = express.Router();
export default router;

const client = new MongoClient('mongodb://localhost:27017');

const db = client.db('catalog');
const games = db.collection('games');

export const UPLOADS_FOLDER = './uploads';

export async function addGame(game) {

    return await games.insertOne(game);
}

export async function updateGame(query, update) {
    console.log("Intentando actualizar con Query:", query); 
    console.log("Con Update:", update);
    // 1. La función recibe dos argumentos:
    //    - query: Un objeto para encontrar el juego (ej: { _id: new ObjectID(id) })
    //    - update: Un objeto con los cambios a aplicar (ej: { $push: { reviews: review_create } })
    return await games.updateOne(query, update);
}

export async function deleteGame(id){

    return await games.findOneAndDelete({ _id: new ObjectId(id) });
}

export async function deleteGames(){

    return await games.deleteMany();
}

export async function getGames(pageSize, numPage){

    return await games.find()
    .skip((numPage - 1) * pageSize)
    .limit(pageSize)
    .toArray();
}

export async function getGame(id){

    return await games.findOne({ _id: new ObjectId(id) });
}

export async function countGames() {
    return await games.countDocuments();
}
    

export async function searchGames(query, limit, page) {
    const filter = { title: { $regex: query, $options: 'i' } };
    
    const result = await games.find(filter)
               .skip((page - 1) * limit)
               .limit(limit)
               .toArray();
    
    return result;
}

export async function countSearchResults(query) {
    if (!query) return 0;
    return games.countDocuments({ title: { $regex: query, $options: 'i' } });
}