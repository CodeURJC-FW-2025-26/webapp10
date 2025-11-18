import express from 'express';
import multer from 'multer';
import fs from 'node:fs/promises';
import { ObjectId } from 'mongodb';
import * as catalog from './catalog.js';
const router = express.Router();
export default router;

const upload = multer({ dest: catalog.UPLOADS_FOLDER })

const allGenres = [
    { value: 'Shooters', icon: 'bi-bullseye', display: 'Shooters' },
    { value: 'Mundo Abierto', icon: 'bi-globe2', display: 'Mundo Abierto' },
    { value: 'Indie', icon: 'bi-heart-fill', display: 'Indie' },
    { value: 'Carreras', icon: 'bi-speedometer2', display: 'Carreras' },
    { value: 'Deportes', icon: 'bi-trophy-fill', display: 'Deportes' },
    { value: 'RPG', icon: 'bi-shield-shaded', display: 'RPG' },
    { value: 'Supervivencia', icon: 'bi-tree-fill', display: 'Supervivencia' },
    { value: 'Aventura', icon: 'bi-compass', display: 'Acción-Aventura' },
    { value: 'Estrategia', icon: 'bi-diagram-3', display: 'Estrategia' },
    { value: 'Sandbox', icon: 'bi-bucket', display: 'Sandbox' },
    { value: 'Simulación', icon: 'bi-cpu', display: 'Simulación' },
    { value: 'Puzles', icon: 'bi-puzzle', display: 'Puzles' },
    { value: 'Terror', icon: 'bi-moon-stars', display: 'Terror' },
    { value: 'Battle Royale', icon: 'bi-people', display: 'Battle Royale' }
];

const allPlatforms = [
    { value: 'PCs', icon: 'bi-windows', color: 'text-primary', display: 'PC', useClass: true },
    { value: 'Play Station', icon: 'bi-playstation', color: 'text-info', display: 'PlayStation', useClass: true },
    { value: 'XBox', icon: 'bi-xbox', color: 'text-success', display: 'Xbox', useClass: true },
    { value: 'Nintendo', icon: 'bi-nintendo-switch', color: 'text-danger', display: 'Nintendo', useClass: true },
    { value: 'Móvil', icon: 'bi-phone', color: 'text-warning', display: 'Móviles', useClass: true },
    { value: 'Realidad Virtual', icon: 'bi-vr', color: 'purple', display: 'Realidad Virtual', useClass: false },
    { value: 'Arcade', icon: 'bi-joystick', color: 'orangered', display: 'Arcade', useClass: false }
];

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
        hasNext: numPage < totalPages,
        genres: allGenres.map(g => ({ ...g, active: false })),
        platforms: allPlatforms.map(p => ({ ...p, active: false }))
    });
});

router.get('/creategame', async (req, res) => {

    res.render('CreateGame', {
        genres: allGenres.map(g => ({ ...g, active: false })),
        platforms: allPlatforms.map(p => ({ ...p, active: false }))
    });
});

router.get('/success', async (req, res) => {

    res.render('Success', {
        genres: allGenres.map(g => ({ ...g, active: false })),
        platforms: allPlatforms.map(p => ({ ...p, active: false }))
    });

    let game = await catalog.getGame(req.params.id);

    game.reviews = game.reviews.map(review => { // Map over each game to add stars property
        return {
            ...review, // Spread operator to copy existing properties
            stars: calcRating(review.rating) // Add stars property with calculated stars
        };
    });

    game.stars = calcRating(game.rating);

    res.render('game', {
        game,
        genres: allGenres.map(g => ({ ...g, active: false })),
        platforms: allPlatforms.map(p => ({ ...p, active: false }))
    });
});

router.get('/game/:id/delete', async (req, res) => {

    let game = await catalog.deleteGame(req.params.id);

    if (game && game.imageFilename) {
        await fs.rm(catalog.UPLOADS_FOLDER + '/' + game.imageFilename);
    }

    res.render('deleted', {
        genres: allGenres.map(g => ({ ...g, active: false })),
        platforms: allPlatforms.map(p => ({ ...p, active: false })),
        game_deleted: true
    });
});

router.get('/game/:id/image', async (req, res) => {

    let game = await catalog.getGame(req.params.id);

    res.download(catalog.UPLOADS_FOLDER + '/' + game.imageFilename);

});

router.post('/game/create', upload.single('imageFilename'), async (req, res) => {

    const errors = [];

    // 1. Required fields
    const requiredFields = [
        "title",
        "description",
        "short_description",
        "developer",
        "editor",
        "price",
        "release_date",
        "age_classification",
        "rating"
    ];

    for (const field of requiredFields) {
        if (!req.body[field] || req.body[field].trim() === "") {
            errors.push(`El campo "${field}" es obligatorio.`);
        }
    };
    
    if (!req.file) {
        errors.push("La imagen es obligatoria.");
    };

    // 2. title starts with capital letter
    if (req.body.title && !/^[A-ZÁÉÍÓÚÑ]/.test(req.body.title.trim())) {
        errors.push("El nombre del videojuego debe comenzar con mayúscula.");
    };

    // 3. Validate release_date format
    const date = new Date(req.body.release_date);
    if (isNaN(date.getTime())) {
        errors.push("La fecha de lanzamiento no es válida.");
    };

    // 4. Validate number in range (cost 0 to 1000)
    const cost = Number(req.body.price);
    if (isNaN(cost) || cost < 0 || cost > 1000) {
        errors.push("El coste debe ser un número entre 0 y 1000.");
    };

    // 5. Validate rating (0 to 5)
    const rating = Number(req.body.rating);
    if (isNaN(rating) || rating < 0 || rating > 5) {
        errors.push("El rating debe estar entre 0 y 5.");
    };

    // 6. The descriptions size is adequate
    if (req.body.description) {
        if (req.body.description.length < 250 || req.body.description.length > 1500) {
            errors.push("La descripción debe tener entre 250 y 1500 caracteres.");
        }
    };
    if (req.body.short_description) {
        if (req.body.short_description.length < 100 || req.body.short_description.length > 500) {
            errors.push("La descripción corta debe tener entre 100 y 500 caracteres.");
        }
    };

    // 7. Validate that the title is NOT repeated
    const existing = await catalog.findGameByName(req.body.title.trim());
    if (existing) {
        errors.push("Ya existe un videojuego con ese nombre.");
    };

    // ---------------------------
    // If there are errors: Show them and send back to form
    if (errors.length > 0) {
        return res.status(400).render("Error", {
            errors
        });
    } else {
        // ---------------------------
        // If there are no errors: Create game
        let game_create = {
            title: req.body.title,

            description: req.body.description,

            short_description: req.body.short_description,

            developer: req.body.developer,

            editor: req.body.editor,

            imageFilename: req.file?.filename,

            price: req.body.price,

            release_date: req.body.release_date,

            platforms: {
                platform_PlayStation: req.body.platform_PlayStation === 'on',
                platform_Xbox: req.body.platform_Xbox === 'on',
                platform_Nintendo: req.body.platform_Nintendo === 'on',
                platform_PCs: req.body.platform_PCs === 'on',
                platform_Mobiles: req.body.platform_Mobiles === 'on',
                platform_VR: req.body.platform_VR === 'on',
                platform_Arcade: req.body.platform_Arcade === 'on',
            },

            modes: {
                mode_SinglePlayer: req.body.mode_SinglePlayer === 'on',
                mode_MultiPlayer: req.body.mode_MultiPlayer === 'on',
                mode_Cooperative: req.body.mode_Cooperative === 'on',
                mode_Competitive: req.body.mode_Competitive === 'on',
                mode_Practice: req.body.mode_Practice === 'on',
                mode_Story: req.body.mode_Story === 'on',
            },

            age_classification: req.body.age_classification,

            rating: req.body.rating,

            genres: {
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
            },

            reviews: []
        };
    
        await catalog.addGame(game_create);

        res.render('Success', {
        
            _id: game_create._id.toString(),
            new_game_added: true,
            genres: allGenres.map(g => ({ ...g, active: false })),
            platforms: allPlatforms.map(p => ({ ...p, active: false }))
        });

    };

});

router.get('/image', (req, res) => {
    let filename = req.query.filename;
    // If filename has \ or / then path traversal attack is detected
    if(/[\\/]/.test(filename)){
    return res.status(400);
    }
    res.download('uploads/' + filename);
});

// Function to turn the platforms object into an array of selected platform names
function getSelectedPlatforms(platforms) {
    const labels = {
        platform_PlayStation: "PlayStation",
        platform_Xbox: "Xbox",
        platform_Nintendo: "Nintendo",
        platform_PCs: "PCs",
        platform_Mobiles: "Móviles",
        platform_VR: "Realidad Virtual (VR)",
        platform_Arcade: "Máquinas Arcade"
    };

    return Object.keys(platforms)
        .filter(key => platforms[key])   // What platforms are marked (true)
        .map(key => labels[key]);        // Convert key into readable text
};

// Function to turn the modes object into an array of selected mode names
function getSelectedModes(modes) {
    const labels = {
        mode_SinglePlayer: "Solitario",
        mode_MultiPlayer: "Multijugador",
        mode_Cooperative: "Cooperativo",
        mode_Competitive: "Competitivo",
        mode_Practice: "Práctica",
        mode_Story: "Historia"
    };

    return Object.keys(modes)
        .filter(key => modes[key])   // What modes are marked (true)
        .map(key => labels[key]);        // Convert key into readable text
};

// Function to turn the genres object into an array of selected genre names
function getSelectedGenres(genres) {
    const labels = {
        genre_Survival: "Supervivencia",
        genre_ActionAdventure: "Acción/Aventura",
        genre_Strategy: "Estrategia",
        genre_Sandbox: "Sandbox",
        genre_Sports: "Deportes",
        genre_Simulation: "Simulación",
        genre_Puzzle: "Puzzle",
        genre_RPG: "RPG",
        genre_Horror: "Horror",
        genre_BattleRoyale: "Battle Royale",
        genre_Racing: "Carreras",
        genre_Indie: "Indie",
        genre_Shooters: "Shooters",
        genre_OpenWorld: "Mundo Abierto"
    };

    return Object.keys(genres)
        .filter(key => genres[key])   // What genres are marked (true)
        .map(key => labels[key]);        // Convert key into readable text
};

router.get('/game/:id', async (req, res) => {

    let game = await catalog.getGame(req.params.id);

    // Transforms platforms into an array of names
    game.platforms = getSelectedPlatforms(game.platforms);
    // Transforms modes into an array of names
    game.modes = getSelectedModes(game.modes);
    // Transforms genres into an array of names
    game.genres = getSelectedGenres(game.genres);

    game.reviews = game.reviews.map(review => { // Map over each game to add stars property
        return {
            ...review, // Spread operator to copy existing properties
            stars: calcRating(review.rating), // Add stars property with calculated stars
            game_id: req.params.id
        };
    });

    game.stars = calcRating(game.rating);
    
    res.render('game', game);
});

router.get('/game/:id/review/:_id/image', async (req, res) => {

    let game = await catalog.getGame(req.params.id);
    let review = game.reviews.find(r => r._id.toString() === req.params._id);

    res.download(catalog.UPLOADS_FOLDER + '/' + review.imageFilename);

});

router.post('/game/:id/review/create', upload.single('imageFilename'), async (req, res) => {

    let game_id = req.params.id;
    let review_create = {
        _id: new ObjectId(),
        username: req.body.user_name,
        comment: req.body.comment_description,
        rating: req.body.rating,
        date: new Date().toISOString().split('T')[0],
        imageFilename: req.file ? req.file.filename : null
    };
    console.log("review_creada:",review_create);
    await catalog.addreview({ _id: new ObjectId (game_id) }, {$push: {reviews: review_create}});
    res.render('Success', { new_game_added: false });
});

router.post('/game/:id/review/delete', async (req, res) => {

    let game_id = req.params.id;
    let review_id = req.body.review_id;

    await catalog.deletereview({ _id: new ObjectId (game_id) }, {$pull: {reviews: {_id: new ObjectId (review_id)}}});

    res.render('deleted', { game_deleted: false });
});

router.get('/game/:id/review_editor/:_id', async (req, res) => {

    let game_id = req.params.id;
    let review_id = req.params._id; 
    let game = await catalog.getGame(game_id);
    let review = game.reviews.find(r => r._id.toString() === review_id);

    res.render('review_editor', {game, review, game_id, _id: review_id});
});

router.post('/game/:id/review_editor/:_id/edit', async (req, res) => {

    let game_id = req.params.id;
    let review_id = req.params._id; 

    let game = await catalog.getGame(game_id);
    let review = game.reviews.find(r => r._id.toString() === review_id);

    console.log("review que entra en el editor:", review);

    let review_edit = {
        _id: new ObjectId(),
        username: req.body.user_name,
        comment: req.body.comment,
        rating: req.body.rating,
        date: new Date().toISOString().split('T')[0],
        videogame_image: req.file ? req.file.filename : game.reviews.find(r => r._id.toString() === review_id).videogame_image
    }; 
    console.log("review_editada:",review_edit);

    await catalog.updatereview({ _id: new ObjectId (game_id), "reviews._id": new ObjectId (review_id) }, { $set: { "reviews.$": review_edit } });

    res.render('Success', { new_game_added: false });
});

router.post('/search', async (req, res) => {
    let query = req.body.q || "";
    let pageSize = 6;
    let numPage = parseInt(req.query.page) || 1;

    let games = await catalog.searchGames(query, "", "", pageSize, numPage);
    let total = await catalog.countSearchResults(query, "", "");
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
        isCurrent: function () {
            return this === numPage;
        },
        prevPage: numPage - 1,
        nextPage: numPage + 1,
        hasPrev: numPage > 1,
        hasNext: numPage < totalPages,
        query: query,
        genres: allGenres.map(g => ({ ...g, active: false })),
        platforms: allPlatforms.map(p => ({ ...p, active: false }))
    });
});

router.get('/category', async (req, res) => {
    let query = req.query.q || "";
    let pageSize = 6;
    let numPage = parseInt(req.query.page) || 1;
    let genre = req.query.genre || "";
    let platform = req.query.platform || "";

    let games = await catalog.searchGames(query, genre, platform, pageSize, numPage);
    let total = await catalog.countSearchResults(query, genre, platform);
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
        isCurrent: function () {
            return this === numPage;
        },
        prevPage: numPage - 1,
        nextPage: numPage + 1,
        hasPrev: numPage > 1,
        hasNext: numPage < totalPages,
        query: query,
        genre: genre,
        platform: platform,
        genres: allGenres.map(g => ({
            ...g,
            active: genre === g.value
        })),
        platforms: allPlatforms.map(p => ({
            ...p,
            active: platform === p.value
        })), 
        activeGenre: genre,
        activePlatform: platform
    });
});