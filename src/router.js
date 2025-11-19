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
    { value: 'PC', icon: 'bi-windows', color: 'text-primary', display: 'PCs', useClass: true },
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
        game_deleted: true,
        game_id: req.params.id
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

    // 6. The descriptions, developer and editor sizes are adequate
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
    if (req.body.developer) {
        if (req.body.developer.length < 1 || req.body.developer.length > 50) {
            errors.push("El desarrollador debe tener entre 1 y 50 caracteres.");
        }
    };
    if (req.body.editor) {
        if (req.body.editor.length < 1 || req.body.editor.length > 50) {
            errors.push("El editor debe tener entre 1 y 50 caracteres.");
        }
    };

    // 7. Validate that the title is NOT repeated
    const existing = await catalog.findGameByName(req.body.title.trim());
    if (existing) {
        errors.push("Ya existe un videojuego con ese nombre.");
    };

    // 8.1. Validate at least one platform
    if (!req.body.platform || req.body.platform.length === 0) {
        errors.push("Debes seleccionar al menos una plataforma de juego.");
    };
    // 8.2. Validate at least one mode of gameplay
    if (!req.body.gamemod || req.body.gamemod.length === 0) {
        errors.push("Debes seleccionar al menos un modo de juego.");
    };
    // 8.3. Validate at least one genre
    if (!req.body.genre || req.body.genre.length === 0) {
        errors.push("Debes seleccionar al menos un género.");
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
            platform: Array.isArray(req.body.platform)? req.body.platform: [req.body.platform].filter(Boolean),
            gamemod: Array.isArray(req.body.gamemod)? req.body.gamemod: [req.body.gamemod].filter(Boolean),
            age_classification: req.body.age_classification,
            rating: req.body.rating,
            genre: Array.isArray(req.body.genre)? req.body.genre: [req.body.genre].filter(Boolean),
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
    if (/[\\/]/.test(filename)) {
        return res.status(400);
    }
    res.download('uploads/' + filename);
});

router.get('/game/:id', async (req, res) => {
    let game_id = req.params.id;
    let game = await catalog.getGame(game_id);

    game.reviews = game.reviews.map(review => { // Map over each game to add stars property
        return {
            ...review, // Spread operator to copy existing properties
            stars: calcRating(review.rating), // Add stars property with calculated stars
            game_id: game_id
        };
    });

    game.stars = calcRating(game.rating);

    res.render('game', {
        // Game properties
        ...game,
        // Sidebar data
        sidebarData: {
            genres: allGenres.map(g => ({ ...g, active: false })),
            platforms: allPlatforms.map(p => ({ ...p, active: false }))
        }
    });
});


router.post('/game/:id/delete', async (req, res) => {
    let game_id = req.params.id;
    let review_id = req.body.review_id;

    await catalog.deleteGame(game_id);

    let game = await catalog.getGame(game_id);

    res.render('deleted', { game_deleted: true, game, _id: game_id});
});

router.get('/editgame/:id', async (req, res) => {

    let game_id = req.params.id;
    let game = await catalog.getGame(game_id);

    res.render('CreateGame_editor', {
        game,
        game_id,
        genres: allGenres.map(g => ({ ...g, active: false })),
        platforms: allPlatforms.map(p => ({ ...p, active: false }))
    });
});

router.post('/game/edit/:id', upload.single('imageFilename'), async (req, res) => {

    let game_id = req.params.id;
    let game = await catalog.getGame(game_id);

    // New object with updated data
    let game_update = {
        title: req.body.title || game.title,
        description: req.body.description || game.description,
        short_description: req.body.short_description || game.short_description,
        developer: req.body.developer || game.developer,
        editor: req.body.editor || game.editor,
        imageFilename: req.file ? req.file.filename : game.imageFilename,
        price: req.body.price || game.price,
        release_date: req.body.release_date || game.release_date,
        platform: Array.isArray(req.body.platform)? req.body.platform: [req.body.platform].filter(Boolean),
        gamemod: Array.isArray(req.body.gamemod)? req.body.gamemod: [req.body.gamemod].filter(Boolean),
        age_classification: req.body.age_classification || game.age_classification,
        rating: req.body.rating || game.rating,
        genre: Array.isArray(req.body.genre)? req.body.genre: [req.body.genre].filter(Boolean),
    };

    await catalog.editGame({ _id: new ObjectId(game_id) }, { $set: game_update });

    res.render('Success', { new_game_added: true,
        _id: game_id,
        genres: allGenres.map(g => ({ ...g, active: false })),
        platforms: allPlatforms.map(p => ({ ...p, active: false }))
     });
});

router.get('/game/:id/review/:_id/image', async (req, res) => {
    let game_id = req.params.id;
    let game = await catalog.getGame(game_id);
    let review_id = req.params._id;
    let review = game.reviews.find(r => r._id.toString() === review_id);


    res.download(catalog.UPLOADS_FOLDER + '/' + review.imageFilename);

});

router.post('/game/:id/review/create', upload.single('imageFilename'), async (req, res) => {

    let game = await catalog.getGame(req.params.id);
    let game_id = req.params.id;
    let review_create = {
        _id: new ObjectId(),
        username: req.body.user_name,
        comment: req.body.comment_description,
        rating: req.body.rating,
        date: new Date().toISOString().split('T')[0],
        imageFilename: req.file ? req.file.filename : null
    };

    await catalog.addreview({ _id: new ObjectId(game_id) }, { $push: { reviews: review_create } });
    res.render('Success', { new_game_added: false, game, _id: game_id,});
});

router.post('/game/:id/review/delete', async (req, res) => {

    let game_id = req.params.id;
    let review_id = req.body.review_id;

    await catalog.deletereview({ _id: new ObjectId(game_id) }, { $pull: { reviews: { _id: new ObjectId(review_id) } } });

    let game = await catalog.getGame(game_id);

    res.render('deleted', { game_deleted: false, game, _id: game_id});
});

router.get('/game/:id/review_editor/:_id', async (req, res) => {

    let game_id = req.params.id;
    let review_id = req.params._id;
    let game = await catalog.getGame(game_id);
    let review = game.reviews.find(r => r._id.toString() === review_id);

    res.render('review_editor', {
        game, review, game_id, _id: review_id, genres: allGenres.map(g => ({ ...g, active: false })),
        platforms: allPlatforms.map(p => ({ ...p, active: false }))
    });
});

router.post('/game/:id/review_editor/:_id/edit', upload.single('imageFilename'), async (req, res) => {

    let game_id = req.params.id;
    let review_id = req.params._id;

    let game = await catalog.getGame(game_id);
    let review = game.reviews.find(r => r._id.toString() === review_id);

    let review_edit = {
        _id: new ObjectId(review_id),
        username: req.body ? req.body.user_name : review.username,
        comment: req.body ? req.body.comment_description : review.comment,
        rating: req.body ? req.body.rating : review.rating,
        date: new Date().toISOString().split('T')[0],
        imageFilename: req.file ? req.file.filename : review.imageFilename
    };

    await catalog.editreview({ _id: new ObjectId(game_id), "reviews._id": new ObjectId(review_id) }, { $set: { "reviews.$": review_edit } });

    res.render('Success', { new_game_added: false, game_id, review_id, _id: game_id, 
        genres: allGenres.map(g => ({ ...g, active: false })),
        platforms: allPlatforms.map(p => ({ ...p, active: false }))
     });
});

router.get('/search', async (req, res) => {
    let query = req.query.q || "";
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
        activeGenre: "",
        activePlatform: "",
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