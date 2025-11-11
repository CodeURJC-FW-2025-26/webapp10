import express from 'express';
import multer from 'multer';
import fs from 'node:fs/promises';

import * as catalog from './catalog.js';

const router = express.Router();
export default router;

const upload = multer({ dest: catalog.UPLOADS_FOLDER })

router.get('/', async (req, res) => {

    function calcRating(rating){   
        let ratingt = Math.trunc(rating);
        let starFull = [];
        let starHalf = [];
        let starEmpty = [];
        let stars = [starFull, starHalf, starEmpty];

        while(ratingt>0){
                starFull.push('1')//pintar estrella completa
                ratingt--
        }
        if(rating%1!==0){
                starHalf.push('1')//pintar media estrella 
        }
        if(Math.trunc(rating)<=4){
                for(rating; 5; rating++){
                    starEmpty.push('1')//pintar estrella vacía
                }
        }
        return stars;
    };

    // Tengo q cambiar el rating = calcRating(rating); de donde lo coja getGames
   
    let games = await catalog.getGames();

    res.render('index', { games });

});

router.get('/', async (req, res) => {

    let post = await catalog.getPost(req.params.id);

    res.render('minecraft', { post });
});

router.post('/game/new', upload.single('image'), async (req, res) => {

    let game = {
        title: req.body.title,
        price: req.body.price,
        rating: calcRating(req.body.rating),
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


