import express from 'express';
import multer from 'multer';
import fs from 'node:fs/promises';

import * as catalog from './catalog.js';

const router = express.Router();
export default router;

const upload = multer({ dest: catalog.UPLOADS_FOLDER })

router.get('/', async (req, res) => {

    let posts = await catalog.getPosts();

    res.render('index', { posts });
});

router.post('/post/new', upload.single('image'), async (req, res) => {

    let post = {
        title: req.body.title,
        price: req.body.price,
        rating: req.body.rating,
        imageFilename: req.file?.filename
    };

    await catalog.addPost(post);

    res.render('saved_post', { _id: post._id.toString() });

});

router.get('/post/:id', async (req, res) => {

    let post = await catalog.getPost(req.params.id);

    res.render('show_post', { post });
});

router.get('/post/:id/delete', async (req, res) => {

    let post = await catalog.deletePost(req.params.id);

    if (post && post.imageFilename) {
        await fs.rm(catalog.UPLOADS_FOLDER + '/' + post.imageFilename);
    }

    res.render('deleted_post');
});

router.get('/post/:id/image', async (req, res) => {

    let post = await catalog.getPost(req.params.id);

    res.download(catalog.UPLOADS_FOLDER + '/' + post.imageFilename);

});

