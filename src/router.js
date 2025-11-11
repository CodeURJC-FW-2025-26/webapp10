import express from 'express';
import multer from 'multer';
import fs from 'node:fs/promises';

import * as catalog from './catalog.js';

const router = express.Router();
export default router;

const upload = multer({ dest: catalog.UPLOADS_FOLDER })

router.get('/', async (req, res) => {

    let games = await catalog.getGames();

    function calcRating(rating){   
        let ratingt = trunc(rating)
        while(ratingt>0){
                //pintar estrella completa
                ratingt--
        }
        if(rating%1!==0){
                //pintar media estrella 
        }
        if(trunc(rating)<=4){
                for(rating; 5; rating++){
                    //pintar estrella vacía
                }
        }
        return;
    }

    res.render('index', { games });

});

router.post('/game/new', upload.single('image'), async (req, res) => {

    let game = {
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

    res.render('show_game', { game });
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


