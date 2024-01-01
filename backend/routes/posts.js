const cors = require('cors')
const Post = require("../models/Post");
const User = require("../models/User");
const getUri = require('../middleware/dataUri')
const uploadOnCloudinary = require('../middleware/clodinary')
const singleUpload = require('../middleware/multer');
const DataUriParser = require('datauri/parser.js')
const path = require('path')

// router.use(cors())
const multer = require('multer');
const { error } = require('console');
const upload = multer({ storage: multer.memoryStorage() });
const router = require("express").Router();

//  router.get("/",(req,res)=>{
//     console.log("post page")
//  })

// create a post
// router.post("/", async (req, res) => {
//     console.log(req.body);
//     const newPost = new Post(req.body);
//     try {
//         const savedPost = await newPost.save();
//         res.status(200).json(savedPost);
//     } catch (err) {
//         res.status(500).json(err)
//     }
// });

router.route('/upload').post(upload.single('file'), async (req, res) => {
    try {
        const { userId, desc } = req.body;

        const { file } = req;
        const parser = new DataUriParser();
        const exactName = new DataUriParser(file.originalname).toString();
        const fileUrl = parser.format(exactName, file.buffer);
        const imageResp = await uploadOnCloudinary(fileUrl.content);
        const newPost = new Post({
            userId,
            desc,
            img: imageResp.url
        })

        const data = await newPost.save();
        console.log(data)
        if (!data) {
            throw new error("problem in Upload");
        }
        res.status(200, data.data, "Post Created Successfully");
    } catch (error) {
        console.log(error)
    }

})


// update a post
router.put("/:id", async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (post.userId === req.body.userId) {
            await post.updateOne({ $set: req.body });
            res.status(200).json("post has been updated")
        } else {
            res.status(403).json("you can update only your post")
        }
    } catch (err) {
        res.status(500).json(err);
    }
})

//delete a post

router.delete("/:id", async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (post.userId === req.body.userId) {
            await post.deleteOne();
            res.status(200).json("the post has been deleted");
        } else {
            res.status(403).json("you can delete only your post");
        }
    } catch (err) {
        res.status(500).json(err);
    }
});

//like / dislike a post
router.put("/:id/like", async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post.likes.includes(req.body.userId)) {
            await post.updateOne({ $push: { likes: req.body.userId } });
            res.status(200).json("The post has been liked");
        } else {
            await post.updateOne({ $pull: { likes: req.body.userId } });
            res.status(200).json("The post has been disliked");
        }
    } catch (err) {
        res.status(500).json(err);
    }
});

//get a post
router.get("/:id", async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        // console.log('first',post)
        res.status(200).json(post);
    } catch (err) {
        res.status(500).json(err);
    }
});

// get timeline post
router.get("/timeline/:userId", async (req, res) => {
    try {
        const currentUser = await User.findById(req.params.userId);
        const userPosts = await Post.find({ userId: currentUser._id });
        const friendPosts = await Promise.all(
            currentUser.followings.map((friendId) => {
                return Post.find({ userId: friendId });
            })
        );
        res.status(200).json(userPosts.concat(...friendPosts))
    } catch (err) {
        res.status(500).json(err);
    }
});

// get user all post
router.get("/profile/:username", async (req, res) => {
    try {
        const user = await User.findOne({ username: req.params.username })
        const posts = await Post.find({ userId: user._id })
        res.status(200).json(posts)
    } catch (err) {
        res.status(500).json(err);
    }
});

module.exports = router;    