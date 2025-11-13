import express from 'express';
import multer from 'multer';
import fs from 'node:fs/promises';

import * as catalog from './catalog.js';

const router = express.Router();
export default router;

const upload = multer({ dest: catalog.UPLOADS_FOLDER })

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

router.get('/', async (req, res) => {

    let pageSize = 6;
    let numPage = parseInt(req.query.page) || 1;
    let totalPages = Math.ceil(await catalog.countGames() / pageSize);
    let pages = [];
    for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
    }

    let games = await catalog.getGames(pageSize, numPage);

    games = games.map(game => { // Map over each game to add stars property
        return {
            ...game, // Spread operator to copy existing properties
            stars: calcRating(game.rating) // Add stars property with calculated stars
        };
    });

    res.render('index', {
        games, pages, currentPage: numPage,
        isCurrent: function () {
            return this === numPage;
        },
        prevPage: numPage - 1,
        nextPage: numPage + 1,
        hasPrev: numPage > 1,
        hasNext: numPage < totalPages
    });
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
    let reviews = game.reviews;

    reviews = reviews.map(review => { // Map over each game to add stars property
        return {
            ...review, // Spread operator to copy existing properties
            stars: calcRating(review.rating) // Add stars property with calculated stars
        };
    });

    console.log(reviews);

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

router.post('/game/create', upload.single('image'), async (req, res) => {

    let game_create = {
        videogame_name: req.body.videogame_name,

        videogame_description: req.body.videogame_description,

        videogame_secondary_description: req.body.videogame_secondary_description,

        videogame_developer: req.body.videogame_developer,

        videogame_editor: req.body.videogame_editor,

        videogame_image: req.file?.filename,

        videogame_cost: req.body.videogame_cost,

        videogame_release_date: req.body.videogame_release_date,

        videogame_platforms: {
            platform_PlayStation: req.body.platform_PlayStation === 'on',
            platform_Xbox: req.body.platform_Xbox === 'on',
            platform_Nintendo: req.body.platform_Nintendo === 'on',
            platform_PCs: req.body.platform_PCs === 'on',
            platform_Mobiles: req.body.platform_Mobiles === 'on',
            platform_VR: req.body.platform_VR === 'on',
            platform_Arcade: req.body.platform_Arcade === 'on',
        },

        videogame_modes: {
            mode_SinglePlayer: req.body.mode_SinglePlayer === 'on',
            mode_MultiPlayer: req.body.mode_MultiPlayer === 'on',
            mode_Cooperative: req.body.mode_Cooperative === 'on',
            mode_Competitive: req.body.mode_Competitive === 'on',
            mode_Practice: req.body.mode_Practice === 'on',
            mode_Story: req.body.mode_Story === 'on',
        },

        age_classification: req.body.age_classification,

        videogame_qualification: req.body.videogame_qualification,

        videogame_genres: {
            genre_Survival: req.body.genre_Survival === 'on',
            genre_ActionAdventure: req.body.genre_ActionAdventure === 'on',
            genre_Strategy: req.body.genre_Strategy === 'on',
            genre_Sandbox: req.body.genre_Sandbox === 'on',
            genre_Sports: req.body.genre_Sports === 'on',
            genre_Simulation: req.body.genre_Simulation === 'on',
            genre_Puzzle: req.body.genre_Puzzle === 'on',
            genre_RPG: req.body.genre_RPG === 'on',
            genre_Horror: req.body.genre_Horror === 'on',
            genre_BattleRoyale: req.body.genre_BattleRoyale === 'on',
            genre_Racing: req.body.genre_Racing === 'on',
            genre_Indie: req.body.genre_Indie === 'on',
            genre_Shooters: req.body.genre_Shooters === 'on',
            genre_OpenWorld: req.body.genre_OpenWorld === 'on',
        }
    };

    await catalog.addGame(game_create);

    res.render('saved_game', { _id: game_create._id.toString() });

});

router.post('/search', async (req, res) => {
    let query = req.body.q || "";
    let pageSize = 6;
    let numPage = parseInt(req.query.page) || 1;

    let games = await catalog.searchGames(query, pageSize, numPage);
    let total = await catalog.countSearchResults(query);
    let totalPages = Math.ceil(total / pageSize);

    let pages = [];
    for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
    }

    games = games.map(game => {
        return {
            ...game,
            stars: calcRating(game.rating)
        };
    });

    res.render('index', {
        games,
        pages,
        currentPage: numPage,
        prevPage: numPage - 1,
        nextPage: numPage + 1,
        hasPrev: numPage > 1,
        hasNext: numPage < totalPages,
        query: query
    });
});

