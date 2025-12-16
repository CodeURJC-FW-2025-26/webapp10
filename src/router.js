import express from 'express';
import multer from 'multer';
import fs from 'node:fs/promises';
import { ObjectId } from 'mongodb';
import * as catalog from './catalog.js';
const router = express.Router();
export default router;

// Configure multer to store uploads in the uploads folder defined by catalog
const upload = multer({ dest: catalog.UPLOADS_FOLDER })

// Static lists used to render filters / sidebar. Each item has value, icon and display.
// These are hard-coded application constants representing genres and platforms.
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
    { value: 'PlayStation', icon: 'bi-playstation', color: 'text-info', display: 'PlayStation', useClass: true },
    { value: 'XBox', icon: 'bi-xbox', color: 'text-success', display: 'XBox', useClass: true },
    { value: 'Nintendo', icon: 'bi-nintendo-switch', color: 'text-danger', display: 'Nintendo', useClass: true },
    { value: 'Móvil', icon: 'bi-phone', color: 'text-warning', display: 'Móviles', useClass: true },
    { value: 'Realidad Virtual', icon: 'bi-vr', color: 'purple', display: 'Realidad Virtual', useClass: false },
    { value: 'Arcade', icon: 'bi-joystick', color: 'orangered', display: 'Arcade', useClass: false }
];

// calcRating: convert a numeric rating into arrays representing full, half and empty stars.
// Returns an object { starFull, starHalf, starEmpty } where each array contains placeholders
// used by the template to render the correct number of star icons.
function calcRating(rating) {
    let ratingt = Math.trunc(rating);
    let starFull = [];
    let starHalf = [];
    let starEmpty = [];

    // Full stars based on integer part
    for (let i = 0; i < ratingt; i++) {
        starFull.push('1');
    }

    // If there is a fractional part, add one half star
    if (rating % 1 !== 0) {
        starHalf.push('1');
    }

    // Calculate empty stars to reach 5 stars total
    const totalFilled = starFull.length + starHalf.length;
    const emptyCount = 5 - totalFilled;

    for (let i = 0; i < emptyCount; i++) {
        starEmpty.push('1');
    }

    return { starFull, starHalf, starEmpty };
}

// Helper function to convert a value to an array
function toArr(v) {
    return Array.isArray(v) ? v : (v ? [v] : []);
    }

// Route: Home page - list games with pagination
router.get('/', async (req, res) => {

    let pageSize = 6;
    let numPage = parseInt(req.query.page) || 1;
    let totalPages = Math.ceil(await catalog.countGames() / pageSize);
    let pages = [];
    for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
    }

    // Fetch games for the current page
    let games = await catalog.getGames(pageSize, numPage);

    // Add stars representation to each game for templates
    games = games.map(game => {
        return {
            ...game, // Spread the existing game properties
            stars: calcRating(game.rating)
        };
    });

    // Render index template with games and sidebar/filter data
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

// Route: Load more games for infinite scroll / "Load More" button
router.get('/games/load', async (req, res) => {
    let pageSize = 6;
    let numPage = parseInt(req.query.page) || 1;
    let query = req.query.q || "";
    let genre = req.query.genre || "";
    let platform = req.query.platform || "";
    
    let games = await catalog.searchGames(query, genre, platform, pageSize, numPage);
    let total = await catalog.countSearchResults(query, genre, platform);
    let hasMore = (numPage * pageSize) < total;
    
    games = games.map(game => ({
        ...game,
        stars: calcRating(game.rating)
    }));
    
    res.json({
        games,
        numPage,
        hasMore,
        total,
        query,
        genre,
        platform
    });
});


// Route: Show create game form
router.get('/creategame', async (req, res) => {

    res.render('CreateGame', {
        new_game_from_scratch: true,
        genres: allGenres.map(g => ({ ...g, active: false })),
        platforms: allPlatforms.map(p => ({ ...p, active: false })),
        gamemods: [
            { value: 'Un jugador', display: 'Un jugador', checked: false },
            { value: 'Multijugador', display: 'Multijugador', checked: false },
            { value: 'Cooperativo', display: 'Cooperativo', checked: false },
            { value: 'Competitivo', display: 'Competitivo', checked: false },
            { value: 'Práctica/Entrenamiento', display: 'Práctica/Entrenamiento', checked: false },
            { value: 'Historia', display: 'Historia', checked: false }
        ]
    });
});

// Route: Success page (NOTE: this route contains unreachable code - see comments below)
router.get('/success', async (req, res) => {

    // Render a generic success page first
    res.render('Success', {
        genres: allGenres.map(g => ({ ...g, active: false })),
        platforms: allPlatforms.map(p => ({ ...p, active: false }))
    });

    // The code below will never run in normal flow because a response has already been sent above.
    // It appears intended to render a specific game page; consider removing the first render or
    // restructuring this route.
    let game = await catalog.getGame(req.params.id);

    game.reviews = game.reviews.map(review => {
        return {
            ...review,
            stars: calcRating(review.rating)
        };
    });

    game.stars = calcRating(game.rating);

    res.render('game', {
        game,
        genres: allGenres.map(g => ({ ...g, active: false })),
        platforms: allPlatforms.map(p => ({ ...p, active: false }))
    });
});

// Route: Delete a game (POST) - deletes and returns JSON response
router.post('/game/:id/delete', async (req, res) => {
    try {
        let game = await catalog.deleteGame(req.params.id);

        // Remove uploaded image file if present
        if (game && game.imageFilename) {
            try {
                await fs.rm(catalog.UPLOADS_FOLDER + '/' + game.imageFilename);
            } catch (err) {
                console.error('Error al eliminar archivo de imagen:', err);
            }
        }

        res.json({
            success: true,
            message: 'Juego borrado exitosamente',
            gameId: req.params.id
        });

    } catch (error) {
        console.error('Error al borrar el juego:', error);
        res.status(500).json({
            success: false,
            message: 'Ocurrió un error al borrar el juego. Por favor, intenta nuevamente.'
        });
    }
});

// Route: View deleted game confirmation page
router.get('/game/:id/deleted', async (req, res) => {
    res.render('deleted', {
        genres: allGenres.map(g => ({ ...g, active: false })),
        platforms: allPlatforms.map(p => ({ ...p, active: false })),
        game_deleted: true,
        game_id: req.params.id
    });
});

// Route: Download the main game image
router.get('/game/:id/image', async (req, res) => {

    let game = await catalog.getGame(req.params.id);

    // If it's the default image, serve from public/images, otherwise from uploads
    if (game.imageFilename === 'default_img.jpg') {
        res.download('./public/images/' + game.imageFilename);
    } else {
        res.download(catalog.UPLOADS_FOLDER + '/' + game.imageFilename);
    }

});

// New endpoint to verify the uniqueness of the title
router.get('/check-title-unique', async (req, res) => {
    // 1. Obtain the title from the query parameter
    const title = req.query.title ? req.query.title.trim() : '';

    // ID of the game being edited
    const existingGameId = req.query.game_id;

    if (!title) {
        return res.status(400).json({ isUnique: false, message: 'El título es requerido.' });
    }

    try {
        // 2. Search in MongoDB for a game with the same title
        const existingGame = await catalog.findGameByName(title); 

        // 3. Respond to the client based on the search result
        if (existingGame) {
            // A game with that title was found
            
            if (existingGameId && existingGame._id.toString() === existingGameId) {
                // Edition case, where the found title belongs to the same game we are editing.
                return res.json({ isUnique: true });
            } else {
                // Creation or Edition case, where the title belongs to ANOTHER game.
                return res.json({ 
                    isUnique: false, 
                    message: 'Ya existe un videojuego con ese nombre en el catálogo.' 
                });
            }
            
        } else {
            // The game doesn't exist -> It is unique
            return res.json({ isUnique: true });
        }

    } catch (error) {
        console.error('Error al verificar título:', error);
        res.status(500).json({ isUnique: false, message: 'Error interno del servidor.' });
    }
});

router.post('/game/create', upload.single('imageFilename'), handler);
router.post('/game/create/:id', upload.single('imageFilename'), handler);

async function handler(req, res) {

    let new_game_from_scratch = !req.query.id; 
    let game_id = req.query.id;
    let existing_game = game_id ? await catalog.getGame(game_id) : null;

    if (req.params.id) {
        game_id = req.params.id;
        existing_game = await catalog.getGame(game_id);
        new_game_from_scratch = false;
    }

    const errors = [];

    // 1. Required fields list
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

    // Diccionario para traducir los nombres de los campos
    const fieldTranslations = {
        "title": "Título",
        "description": "Descripción",
        "short_description": "Descripción Corta",
        "developer": "Desarrollador",
        "editor": "Editor",
        "price": "Precio",
        "release_date": "Fecha de Lanzamiento",
        "age_classification": "Clasificación por Edad",
        "rating": "Puntuación"
    };

    // 1.1 Validate required fields
    for (const field of requiredFields) {
        if (!req.body[field] || req.body[field].trim() === "") {
            errors.push(`El campo "${fieldTranslations[field]}" es obligatorio.`);
        }
    };

    // 1.2 Image is required
    /*
    if (new_game_from_scratch && !req.file) {
        errors.push("El campo \"Imagen\" es obligatorio.");
    };
    */

    // 2. Title must start with uppercase (locale insensitive regex includes accented uppercase)
    if (req.body.title && !/^[A-ZÁÉÍÓÚÑ]/.test(req.body.title.trim())) {
        errors.push("El título del videojuego debe comenzar con mayúscula.");
    };

    // 3. Validate release_date is a valid date
    const date = new Date(req.body.release_date);
    if (isNaN(date.getTime())) {
        errors.push("La fecha de lanzamiento no es válida.");
    };

    // 4. Validate price is a number within allowed range (0 - 1000)
    const cost = Number(req.body.price);
    if (isNaN(cost) || cost < 0 || cost > 1000 || Math.round(cost * 100) !== cost * 100) {
        errors.push("El coste debe ser un número entre 0 y 1000, con hasta dos decimales.");
    };

    // 5. Validate rating is between 0 and 5
    const rating = Number(req.body.rating);
    if (isNaN(rating) || rating < 0 || rating > 5 || rating % 0.5 !== 0) {
        errors.push("El rating debe estar entre 0 y 5, y en incrementos de 0,5.");
    };

    // 6. The name, descriptions, developer and editor sizes are adequate
    if (req.body.title) {
        if (req.body.title.length < 1 || req.body.title.length > 75) {
            errors.push("El nombre debe tener entre 1 y 75 caracteres.");
        }
    };
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

    // 7. Ensure title is unique ONLY if creating a new game or changing the title
    const newTitle = req.body.title.trim();
    const existing = await catalog.findGameByName(newTitle); // Returns the found game object or null

    if (existing) {
        // Case 1: A game with the same title was found -> Potential error.

        if (new_game_from_scratch) {
            // Option A: It's a creation, and the title already exists -> ERROR.
            errors.push("Ya existe un videojuego con ese nombre.");

        } else {
            // Option B: It's an edit. We must check if the found game is the same as the one we are editing.

            // Compare the ID of the found game with the ID of the game we are editing.
            // .toString() is used to strictly compare MongoDB ObjectIDs.
            const isSameGame = existing._id.toString() === existing_game._id.toString();

            if (!isSameGame) {
                // The found game is NOT the game we are editing -> ERROR, the title belongs to ANOTHER.
                errors.push("Ya existe un videojuego con ese nombre.");
            }
            // If isSameGame is true, validation passes without error (the title is valid for this game).
        }
    }
    // Case 2: existing is null -> The name is unique and validation passes.

    const platformArr = toArr(req.body.platform);
    const gamemodArr = toArr(req.body.gamemod);
    const genreArr = toArr(req.body.genre);

    // In edition, if no platforms/modes/genres are sent, keep existing ones
    const platformsToValidate = platformArr.length > 0 ? platformArr : (existing_game?.platform || []);
    const modesToValidate = gamemodArr.length > 0 ? gamemodArr : (existing_game?.gamemod || []);
    const genresToValidate = genreArr.length > 0 ? genreArr : (existing_game?.genre || []);

    // 8. Ensure at least one platform, mode and genre is selected
    if (!platformsToValidate || platformsToValidate.length === 0) {
        errors.push("Debes seleccionar al menos una plataforma de juego.");
    };
    if (!modesToValidate || modesToValidate.length === 0) {
        errors.push("Debes seleccionar al menos un modo de juego.");
    };
    if (!genresToValidate || genresToValidate.length === 0) {
        errors.push("Debes seleccionar al menos un género.");
    };

    // 9. Check that the uploaded file is a valid image type (if a file was uploaded)
    if (req.file) {
        const allowedTypes = ['image/png', 'image/jpeg', 'image/svg+xml', 'image/webp'];
        if (!allowedTypes.includes(req.file.mimetype)) {
            errors.push("Tipo de imagen no válida. Solo se permiten PNG, JPG/JPEG, SVG y WebP.");
        }
    };

    // If validation failed, send a 400 Bad Request response with the error messages
    if (errors.length > 0) {
        return res.status(400).json({
            success: false,
            errors: errors // Sends the list of error messages to the client
        });
    } else {
        // Build game object for insertion
        let game_create = {
            title: req.body.title || existing_game.title,
            description: req.body.description || existing_game.description,
            short_description: req.body.short_description || existing_game.short_description,
            developer: req.body.developer || existing_game.developer,
            editor: req.body.editor || existing_game.editor,
            price: req.body.price || existing_game.price,
            release_date: req.body.release_date || existing_game.release_date,
            platform: platformArr.length > 0 ? platformArr : existing_game.platform,
            gamemod: gamemodArr.length > 0 ? gamemodArr : existing_game.gamemod,
            age_classification: req.body.age_classification || existing_game.age_classification,
            rating: req.body.rating || existing_game.rating,
            genre: genreArr.length > 0 ? genreArr : existing_game.genre
        };

        if (req.file) {
            game_create.imageFilename = req.file.filename;
        } else if (existing_game && existing_game.imageFilename) {
            game_create.imageFilename = existing_game.imageFilename;
        } else {
            game_create.imageFilename = 'default_img.jpg';
        }

        // Create or modify the game in the database
        let finalGameId;

        if (new_game_from_scratch) {
            game_create.reviews = [];
            await catalog.addGame(game_create);
            finalGameId = game_create._id?.toString();
        } else {
            await catalog.editGame({ _id: new ObjectId(game_id) }, { $set: game_create });
            finalGameId = game_id;
        }
        
        // After insertion, send a success JSON response to the client
            return res.status(new_game_from_scratch ? 201 : 200).json({
            success: true,
            gameId: finalGameId // Use gameId so the client can redirect properly
        });

    };

};

// Route: Generic image download endpoint with a simple traversal check
router.get('/image', (req, res) => {
    let filename = req.query.filename;
    // Prevent path traversal by disallowing path separators
    if (/[\\/]/.test(filename)) {
        return res.status(400);
    }
    res.download('uploads/' + filename);
});

// Route: Show a specific game page with reviews and stars
router.get('/game/:id', async (req, res) => {
    let game_id = req.params.id;
    let game = await catalog.getGame(game_id);

    // Add stars and game_id to each review for template rendering / linking
    game.reviews = game.reviews.map(review => {
        return {
            ...review,
            stars: calcRating(review.rating),
            game_id: game_id
        };
    });

    // Add stars for the game itself
    game.stars = calcRating(game.rating);

    // Render 'game' template, spreading game properties and including sidebar data
    res.render('game', {
        ...game,
        sidebarData: {
            genres: allGenres.map(g => ({ ...g, active: false })),
            platforms: allPlatforms.map(p => ({ ...p, active: false }))
        }
    });
});

router.post('/game/:id/delete-image', async (req, res) => {
    let game_id = req.params.id;
    let game = await catalog.getGame(game_id);
    if (game && game.imageFilename && game.imageFilename !== 'default_img.jpg') {
        try {
            await fs.rm(catalog.UPLOADS_FOLDER + '/' + game.imageFilename);
        } catch (err) {
            console.error('Error al eliminar archivo de imagen:', err);
        }
        await catalog.editGame({ _id: new ObjectId(game_id) }, { $set: { imageFilename: 'default_img.jpg' } });
    }
    res.json({ success: true });
});

// Route: Delete game via POST (also used to submit review deletions in some flows)
router.post('/game/:id/delete', async (req, res) => {
    let game_id = req.params.id;
    let review_id = req.body.review_id;

    await catalog.deleteGame(game_id);

    // Attempt to fetch game after deletion (may be null)
    let game = await catalog.getGame(game_id);

    res.render('deleted', { game_deleted: true, game, _id: game_id });
});

// Route: Show edit form for a game
router.get('/editgame/:id', async (req, res) => {

    let game_id = req.params.id;
    let game = await catalog.getGame(game_id);

    //Convert to Sets for easier checking
    const platformSet = new Set(toArr(game.platform));
    const genreSet = new Set(toArr(game.genre));
    const gamemodSet = new Set(toArr(game.gamemod));

    res.render('CreateGame', {
        game,
        game_id,
        new_game_from_scratch: false,
        genres: allGenres.map(g => ({ 
            ...g, 
            active: false,
            checked: genreSet.has(g.value)
        })),
        platforms: allPlatforms.map(p => ({ 
            ...p, 
            active: false,
            checked: platformSet.has(p.value)
        })),
        gamemods: [
            { value: 'Un jugador', display: 'Un jugador', checked: gamemodSet.has('Un jugador') },
            { value: 'Multijugador', display: 'Multijugador', checked: gamemodSet.has('Multijugador') },
            { value: 'Cooperativo', display: 'Cooperativo', checked: gamemodSet.has('Cooperativo') },
            { value: 'Competitivo', display: 'Competitivo', checked: gamemodSet.has('Competitivo') },
            { value: 'Práctica/Entrenamiento', display: 'Práctica/Entrenamiento', checked: gamemodSet.has('Práctica/Entrenamiento') },
            { value: 'Historia', display: 'Historia', checked: gamemodSet.has('Historia') }
        ]
    });
});

// Route: Download image attached to a review
router.get('/game/:id/review/:_id/image', async (req, res) => {
    let game_id = req.params.id;
    let game = await catalog.getGame(game_id);
    let review_id = req.params._id;
    let review = game.reviews.find(r => r._id.toString() === review_id);


    res.download(catalog.UPLOADS_FOLDER + '/' + review.imageFilename);

});

// Route: Create a review for a game (POST) with optional image upload
router.post('/game/:id/review/create', upload.single('imageFilename'), async (req, res) => {

    let game = await catalog.getGame(req.params.id);
    let game_id = req.params.id;

    const errors = [];

    // 1. Required fields
    const requiredFields = [
        "user_name",
        "comment_description",
        "rating"
    ];

    for (const field of requiredFields) {
        if (!req.body[field] || req.body[field].trim() === "") {
            errors.push(`El campo "${field}" es obligatorio.`);
        }
    };

    // 2. Validate rating (0 to 5)
    const rating = Number(req.body.rating);
    if (isNaN(rating) || rating < 0 || rating > 5 || rating % 0.5 !== 0) {
        errors.push("El rating debe estar entre 0 y 5, y en incrementos de 0,5.");
    };

    // 3. The name and comment sizes are adequate
    if (req.body.user_name) {
        if (req.body.user_name.length < 1 || req.body.user_name.length > 50) {
            errors.push("El nombre de usuario debe tener entre 1 y 50 caracteres.");
        }
    };
    if (req.body.comment_description) {
        if (req.body.comment_description.length < 25 || req.body.comment_description.length > 500) {
            errors.push("La descripción debe tener entre 25 y 500 caracteres.");
        }
    };

    // ---------------------------
    // If there are errors: Show them and send back to form
    if (errors.length > 0) {
        return res.status(400).json({
            success: false,
            errors 
        });
    } else {
        // ---------------------------
        // If there are no errors: Create game
        let review_create = {
            _id: new ObjectId(),
            username: req.body.user_name,
            comment: req.body.comment_description,
            rating: req.body.rating,
            date: new Date().toISOString().split('T')[0],
            imageFilename: req.file ? req.file.filename : 'cod-poster.jpg'
        };

        await catalog.addreview({ _id: new ObjectId(game_id) }, { $push: { reviews: review_create } });
        res.json({
            success: true,
            message: 'Reseña creada exitosamente',
            review: review_create
        });
        
    };

});

// Route: Delete a specific review from a game
router.post('/game/:id/review/delete', async (req, res) => {

    let game_id = req.params.id;
    let review_id = req.body.review_id;

    console.log('Deleting review:', review_id, 'from game:', game_id);

    try {
        let review = await catalog.deletereview({ _id: new ObjectId(game_id) }, { $pull: { reviews: { _id: new ObjectId(review_id) } } });
        console.log('Review deleted:', review);
        // Remove uploaded image file if present
        if (review && review.imageFilename) {
            try {
                await fs.rm(catalog.UPLOADS_FOLDER + '/' + review.imageFilename);
            } catch (err) {
                console.error('Error al eliminar archivo de imagen:', err);
            }
        }

        res.json({
            success: true,
            message: 'Juego borrado exitosamente',
            gameId: req.params.id
        });

    } catch (error) {
        console.error('Error al borrar el juego:', error);
        res.status(500).json({
            success: false,
            message: 'Ocurrió un error al borrar el juego. Por favor, intenta nuevamente.'
        });
    }
});

// Route: Edit a review (POST) with optional new image
router.post('/game/:id/review_editor/:_id/edit', upload.single('imageFilename'), async (req, res) => {

    let game_id = req.params.id;
    let review_id = req.params._id;

    let game = await catalog.getGame(game_id);
    let review = game.reviews.find(r => r._id.toString() === review_id);

    // Server-side validation (same rules as creation)
    // We collect field-specific errors (errorsObj) and an array of messages (errorsArr)
    const errorsObj = {};
    const errorsArr = [];

    // Required fields
    const required = [ 'user_name', 'comment_description', 'rating' ];
    for (const f of required) {
        if (!req.body[f] || req.body[f].trim() === '') {
            const msg = `El campo "${f}" es obligatorio.`;
            errorsObj[f] = msg;
            errorsArr.push(msg);
        }
    }

    // Rating validation
    const ratingVal = Number(req.body.rating);
    if (isNaN(ratingVal) || ratingVal < 0 || ratingVal > 5 || ratingVal % 0.5 !== 0) {
        const msg = 'El rating debe estar entre 0 y 5, y en incrementos de 0,5.';
        errorsObj.rating = msg;
        errorsArr.push(msg);
    }

    // Name/comment sizes
    if (req.body.user_name && (req.body.user_name.length < 1 || req.body.user_name.length > 50)) {
        const msg = 'El nombre de usuario debe tener entre 1 y 50 caracteres.';
        errorsObj.user_name = msg;
        errorsArr.push(msg);
    }
    if (req.body.comment_description && (req.body.comment_description.length < 25 || req.body.comment_description.length > 500)) {
        const msg = 'La descripción debe tener entre 25 y 500 caracteres.';
        errorsObj.comment_description = msg;
        errorsArr.push(msg);
    }

    // If a file was uploaded, ensure it's an image
    if (req.file && req.file.mimetype && !req.file.mimetype.startsWith('image/')) {
        const msg = 'El archivo debe ser una imagen.';
        errorsObj.imageFilename = msg;
        errorsArr.push(msg);
    }

    if (errorsArr.length > 0) {
        // If request expects JSON (AJAX), return JSON errors so client can show them in a dialog and map them to fields
        const acceptsJson = req.xhr || (req.headers.accept && req.headers.accept.indexOf('application/json') !== -1);
        if (acceptsJson) {
            return res.status(400).json({ success: false, errors: errorsObj, messages: errorsArr });
        } else {
            // For non-AJAX, render the editor page with errors array
            return res.render('review_editor', {
                game, review, game_id, _id: review_id, errors: errorsArr,
                genres: allGenres.map(g => ({ ...g, active: false })),
                platforms: allPlatforms.map(p => ({ ...p, active: false }))
            });
        }
    }

    // Build the updated review object (replace the review in the array)
    let review_edit = {
        _id: new ObjectId(review_id),
        username: req.body ? req.body.user_name : review.username,
        comment: req.body ? req.body.comment_description : review.comment,
        rating: req.body ? req.body.rating : review.rating,
        date: new Date().toISOString().split('T')[0],
        imageFilename: req.file ? req.file.filename : 'cod-poster.jpg'
    };

    try {
        // Update the specific review using positional operator
        await catalog.editreview({ _id: new ObjectId(game_id), "reviews._id": new ObjectId(review_id) }, { $set: { "reviews.$": review_edit } });

        // If this is an XHR / AJAX request, respond with JSON so the client can update in-place
        if (req.xhr || (req.headers.accept && req.headers.accept.indexOf('application/json') !== -1)) {
            return res.json({ success: true, review: review_edit });
        }

        res.render('Success', {
            new_game_added: false, game_id, review_id, _id: game_id,
            genres: allGenres.map(g => ({ ...g, active: false })),
            platforms: allPlatforms.map(p => ({ ...p, active: false }))
        });
    } catch (err) {
        console.error('Error editing review:', err);
        if (req.xhr || (req.headers.accept && req.headers.accept.indexOf('application/json') !== -1)) {
            return res.status(500).json({ success: false, message: 'Error editing review' });
        }
        res.status(500).render('Error', { message: 'Error editing review' });
    }
});

// Route: Search endpoint with pagination
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

    // Add star info to games
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

// Route: Category filter combined with search and pagination
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

    // Add star info to games
    games = games.map(game => {
        return {
            ...game,
            stars: calcRating(game.rating)
        };
    });

    // Render index with active flags for selected genre/platform
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

