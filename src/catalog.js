import express from 'express';
import { MongoClient } from 'mongodb';
import { ObjectId } from 'mongodb';
const router = express.Router();
export default router;

const client = new MongoClient('mongodb://localhost:27017');

const db = client.db('catalog');
const games = db.collection('games');

export const UPLOADS_FOLDER = './uploads';

export async function addGame(query, update) {

    return await games.insertOne(query, update);
}

export async function findGame(filter) {
   const item = await games.findOne(filter); 

    if (!item) {
       console.log("Elemento no encontrado.");
        return null;
   }
    return item;
}

export async function findGameByName(title) {
    return await games.findOne({ title: title });
}

export async function deletereview(query, update) {
    console.log("Intentando actualizar con Query:", query); 
    console.log("Con Update:", update);
    // 1. La función recibe dos argumentos:
    //    - query: Un objeto para encontrar el juego (ej: { _id: new ObjectID(id) })
    //    - update: Un objeto con los cambios a aplicar (ej: { $pull: { reviews: {_id: new ObjectId(taskId)} } })
    return await games.updateOne(query, update);
}

export async function addreview(query, update) {
    
    return await games.updateOne(query, update);
}

export async function editreview(query, update) {
    
    return await games.updateOne(query, update);
}

export async function editGame(query, update) {
    
    return await games.updateOne(query, update);
}

export async function deleteGame(id) {

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

export async function searchGames(query, genre, platform, pageSize, numPage) {
    let filter = {};
    
    if (query) {
        filter.title = { $regex: query, $options: 'i' };
    }
    
    if (genre) {
        filter.genre = genre;
    }
    
    if (platform) {
        filter.platform = platform;
    }
    
    const result = await games.find(filter)
               .skip((numPage - 1) * pageSize)
               .limit(pageSize)
               .toArray();
    
    return result;
}

export async function countSearchResults(query, genre, platform) {
    let filter = {};
    
    if (query) {
        filter.title = { $regex: query, $options: 'i' };
    }
    
    if (genre) {
        filter.genre = genre;
    }
    
    if (platform) {
        filter.platform = platform;
    }
    
    return games.countDocuments(filter);
}
