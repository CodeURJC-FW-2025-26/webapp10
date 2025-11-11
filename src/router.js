import express from 'express';
import multer from 'multer';
import fs from 'node:fs/promises';

import * as board from './board.js';

const router = express.Router();
export default router;

const upload = multer({ dest: board.UPLOADS_FOLDER })

router.get('/', async (req, res) => {

    let posts = await board.getPosts();

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

    res.render('index', { posts });
});

router.post('/post/new', upload.single('image'), async (req, res) => {

    let post = {
        title: req.body.title,
        price: req.body.price,
        rating: req.body.rating,
        imageFilename: req.file?.filename
    };

    await board.addPost(post);

    res.render('saved_post', { _id: post._id.toString() });

});

router.get('/post/:id', async (req, res) => {

    let post = await board.getPost(req.params.id);

    res.render('show_post', { post });
});

router.get('/post/:id/delete', async (req, res) => {

    let post = await board.deletePost(req.params.id);

    if (post && post.imageFilename) {
        await fs.rm(board.UPLOADS_FOLDER + '/' + post.imageFilename);
    }

    res.render('deleted_post');
});

router.get('/post/:id/image', async (req, res) => {

    let post = await board.getPost(req.params.id);

    res.download(board.UPLOADS_FOLDER + '/' + post.imageFilename);

});


