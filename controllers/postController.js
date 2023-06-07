const Posts = require("../model/Posts");
const User = require("../model/User");
const { mapPost } = require("../utils/Utils");
const cloudinary = require('cloudinary').v2;
const { success, error } = require("../utils/responseWrapper");

const createPostController = async (req, res) => {
  try {
    const { caption, img } = req.body;
    const owner = req._id;
    if(!caption || !img){
      return res.send(error(400,"Caption and img required"))
    }

    const user = await User.findById(req._id);

    const cloudImg = await cloudinary.uploader.upload(img, {
      folder: 'Postpics'
    });

    const post = await Posts.create({
      caption,
      owner,
      image:{
        url: cloudImg.secure_url,
        publicId: cloudImg.public_id
      }
    });
    user.posts.push(post._id);
    await user.save();
    return res.send(success(201, {post}));
  } catch (e) {
    return res.send(error(500, e.message));
  }
};

const likeController = async (req, res) => {
  try {
    const { postId } = req.body;
    const currUserId = req._id;
    const post = await Posts.findById(postId).populate('owner');
    if (!post) {
      return res.send(error(404, "Post not found"));
    }

    if (post.likes.includes(currUserId)) {
      const index = post.likes.indexOf(currUserId);
      post.likes.splice(index, 1);
     
    } else {
      post.likes.push(currUserId);
      
      
    }

    await post.save();
    return res.send(success(200,{post:mapPost(post,req._id)}));
  } catch (e) {
    return res.send(error(500, e.message));
  }
};

const updatePostController = async (req, res) => {
  try {
    const { postId, updatedCaption } = req.body;


    if (!postId || !updatedCaption) {
      return res.send(error(401, "Id and caption reqruired"));
    }
    const currUserId = req._id;
    const targetPost = await Posts.findById(postId);

    if (targetPost && targetPost.owner == currUserId) {
      targetPost.caption = updatedCaption;
      await targetPost.save();
      return res.send(success(200, { targetPost }));
    } else {
      return res.send(error(401, "Cannot update other's post"));
    }
  } catch (e) {
    return res.send(error(500, e.message));
  }
};


const deletePostController = async (req, res) => {
  try {
    const { postId } = req.body;
    const currUserId = req._id;

    if (!postId) {
      return res.send(error(400, "Post id required"))
    }
    const targetPost = await Posts.findById(postId)
    const currUser = await User.findById(currUserId)
    if (!currUser) {
      return res.send(error(400, "You need to login"))
    }


    if (targetPost.owner != currUserId) {
      return res.send(error(401, "Cannot delete other's posts"))
    };

    const index = currUser.posts.indexOf(postId)
    currUser.posts.splice(index, 1);
    await currUser.save();
    await targetPost.deleteOne();
    return res.send(success(200, "Post deleted"))

  } catch (e) {
    return res.send(error(500, e.message))

  }

}

module.exports = {
  createPostController,
  likeController,
  updatePostController,
  deletePostController
};
