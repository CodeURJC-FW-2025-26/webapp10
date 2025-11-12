import express from 'express';
import multer from 'multer';
import fs from 'node:fs/promises';

import * as catalog from './catalog.js';

const router = express.Router();
export default router;

const upload = multer({ dest: catalog.UPLOADS_FOLDER })

router.get('/', async (req, res) => {

    function calcRating(rating) {   
        let ratingt = Math.trunc(rating);
        let starFull = [];
        let starHalf = [];
        let starEmpty = [];
        
        // Full stars
        for (let i = 0; i < ratingt; i++) {
            starFull.push('1');
        }
        
        // Half star
        if (rating % 1 !== 0) {
            starHalf.push('1');
        }
        
        // Empty stars = 5 - (full stars + half star)
        const totalFilled = starFull.length + starHalf.length;
        const emptyCount = 5 - totalFilled;
        
        for (let i = 0; i < emptyCount; i++) {
            starEmpty.push('1');
        }
    
    return { starFull, starHalf, starEmpty };
}
   
    let games = await catalog.getGames();

    games = games.map(game => { // Map over each game to add stars property
        return {
            ...game, // Spread operator to copy existing properties
            stars: calcRating(game.rating) // Add stars property with calculated stars
        };
    });

    res.render('index', { games });

});

router.get('/', async (req, res) => {

    let game = await catalog.getPost(req.params.id);

    res.render('index', { game });
});

router.get('/newgame', async (req, res) => {
    
    res.render('CreateGame');
});

router.post('/game/new', upload.single('image'), async (req, res) => {

    let game = {
        object_id: new ObjectId(), 
        title: req.body.title,
        price: req.body.price,
        rating: req.body.rating,
        imageFilename: req.file?.filename
    };

    await catalog.addGame(game);

    res.render('saved_game', { _id: game._id.toString() });

});

router.get('/game/:id', async (req, res) => {

    let game = await catalog.getGame(req.params.id);

    res.render('Minecraft', { game });
});

router.get('/game/:id/delete', async (req, res) => {

    let game = await catalog.deleteGame(req.params.id);

    if (game && game.imageFilename) {
        await fs.rm(catalog.UPLOADS_FOLDER + '/' + game.imageFilename);
    }

    res.render('deleted_game');
});

router.get('/game/:id/image', async (req, res) => {

    let game = await catalog.getGame(req.params.id);

    res.download(catalog.UPLOADS_FOLDER + '/' + game.imageFilename);

});
