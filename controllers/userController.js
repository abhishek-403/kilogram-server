const Posts = require("../model/Posts");
const User = require("../model/User");
const bcrypt = require("bcrypt");
const { error, success } = require("../utils/responseWrapper");
const { mapPost } = require("../utils/Utils");
const cloudinary = require('cloudinary').v2;



const followController = async (req, res) => {

    try {

        const { userIdToFollow } = req.body;
        const currUserId = req._id;
        if (currUserId === userIdToFollow) {
            return res.send(error(409, "Cannot follow ourself"))
        }

        if (!userIdToFollow) {
            return res.send(error(403, "Userto follow required"))
        }



        const userToFollow = await User.findById(userIdToFollow);

        if (!userToFollow) {
            return res.send(error(404, "Requested user not found!"))
        }

        const currUser = await User.findById(currUserId)




        if (currUser.followings.includes(userIdToFollow)) {
            const index = currUser.followings.indexOf(userIdToFollow);
            const index2 = userToFollow.followers.indexOf(currUserId);

            currUser.followings.splice(index, 1);
            userToFollow.followers.splice(index2, 1)
            // await userToFollow.save();
            // await currUser.save();
            // return res.send(success(200, "Unfollowed!"))


        } else {
            userToFollow.followers.push(currUserId)
            currUser.followings.push(userIdToFollow);

            // await userToFollow.save();
            // await currUser.save();
            // return res.send(success(200, "Followed!"))

        }
        await userToFollow.save();
        await currUser.save();
        return res.send(success(200, { user: userToFollow }))

    } catch (e) {

        return res.send(error(500, e.message));
    }



}



const getFeedData = async (req, res) => {
    try {
        const currUserId = req._id;
        const currUser = await User.findById(currUserId).populate('followings')

        const allPosts = await Posts.find().populate('owner');



        const posts = allPosts.map(item => mapPost(item, req._id)).reverse()



        const followingsIds = currUser.followings.map(item => item._id);
        followingsIds.push(currUserId)

        const notFollowings = await User.find({
            _id: {
                $nin: followingsIds
            }
        })



        return res.send(success(200, { ...currUser._doc, suggestions: notFollowings, posts }))



    } catch (e) {
        return res.send(error(500, e.message));

    }


}

const getAllUsers = async (req, res) => {
    try {
        const temp = await User.find();
        const allUsers = temp.map((e) => {
            return (
                {
                    avatar: e.avatar,
                    _id: e._id,
                    name: e.name,
                    username: e.username
                }
            )

        })

        return res.send(success(200, { allUsers }))

    } catch (e) {
        return res.send(error(500, e.message));

    }
}


const getMyPosts = async (req, res) => {
    try {
        const currUserId = req._id;

        const allPosts = await Posts.find({
            owner: currUserId
            // 'owner':{
            //     '$in':currUserId
            // }
        }).populate('likes');

        if (!allPosts) {
            return res.send(error(404, "No posts found."))

        }



        return res.send(success(200, { allPosts }))

    } catch (e) {
        return res.send(error(500, e.message))

    }

}


const getAnyPost = async (req, res) => {
    try {

        const { postId } = req.body;
        if (!postId) {
            return res.send(error(400, "Post id required"))
        }

        const targetPost = await Posts.findById(postId)
        if (!targetPost) {
            return res.send(error(404, "Post not found"))
        }

        return res.send(success(200, targetPost))

    } catch (e) {
        return res.send(error(500, e.message))

    }

}


const getUsersPost = async (req, res) => {
    try {

        const { targetUserId } = req.body;

        const result = await Posts.find({
            'owner': {
                '$in': targetUserId
            }
        })

        if (!result) {
            return res.send(error(404, "Posts not found"))
        }


        return res.send(success(200, result))
    } catch (e) {
        return res.send(error(500, e.message))

    }
}


const deleteMyProfile = async (req, res) => {
    try {

        // const {userEmail,userPassword}= req.body;
        const currUserId = req._id;


        // if(!userEmail || !userPassword){
        //     return res.send(error(400,"Email and password required!"))
        // }

        // const targetUser = await User.findOne({email:userEmail}).select('+password')
        const currUser = await User.findById(currUserId)
        // if(!currUser){
        //     return res.send(error(404,"Login to delete"))

        // }

        // if(!targetUser){
        //     return res.send(error(404,"User doesnot exists"))
        // }

        // if(currUser.email !== targetUser.email){
        //     return res.send(error(401,"Login to delete profile"))
        // }

        // const verify = await bcrypt.compare(userPassword,currUser.password)

        // if(!verify){
        //     return res.send(error(401,"Incorrect password!"))
        // }



        await Posts.deleteMany({
            owner: currUserId
        })

        currUser.followings.forEach(async (followedId) => {

            const followedUser = await User.findById(followedId);

            const i = followedUser.followers.indexOf(currUserId);
            followedUser.followers.splice(i, 1);
            await followedUser.save()


        })

        currUser.followers.forEach(async (followingId) => {

            const followingUser = await User.findById(followingId);

            const i = followingUser.followings.indexOf(currUserId);
            followingUser.followings.splice(i, 1);
            await followingUser.save();


        })


        const likedPosts = await Posts.find({
            likes: currUserId
        })

        likedPosts.forEach(async (eachPost) => {
            const i = eachPost.likes.indexOf(currUserId);
            eachPost.likes.splice(i, 1);
            await eachPost.save()
        })


        await currUser.deleteOne();
        res.clearCookie('jwt', {
            httpOnly: true,
            secure: true

        })



        return res.send(success(200, "User deleted successfully"));



    } catch (e) {
        return res.send(error(500, e.message))

    }
}


const getMyProfile = async (req, res) => {
    try {
        const user = await User.findById(req._id)

        return res.send(success(200, { user }))

    } catch (e) {
        return res.send(error(500, e.message))


    }
}




const updateProfile = async (req, res) => {
    try {
        const { userName, name, bio, dp } = req.body;

        const user = await User.findById(req._id);
        if (userName) {
            user.username = userName;

        }
        if (name) {
            user.name = name;

        }
        if (bio) {
            user.bio = bio;

        }
        if (dp) {
            const cloudImg = await cloudinary.uploader.upload(dp, {
                folder: 'userProfilePics'
            });

            user.avatar = {
                url: cloudImg.secure_url,
                publicId: cloudImg.public_id
            }


        }


        await user.save();

        return res.send(success(200, { user }))


    } catch (e) {
        return res.send(error(500, e.message))


    }



}


const getUsersProfile = async (req, res) => {

    try {
        const user = await User.findById(req.body.userId).populate({
            path: 'posts',
            populate: {
                path: 'owner'

            }
        });


        const fullPost = user.posts;
        const posts = fullPost.map(item => mapPost(item, req._id)).reverse()





        return res.send(success(200, { ...user._doc, posts }))

    } catch (e) {
        return res.send(error(500, e.message))


    }

}


module.exports = {
    followController,
    getFeedData,
    getAllUsers,
    getMyPosts,
    getAnyPost,
    getUsersPost,
    getUsersProfile,
    deleteMyProfile,
    getMyProfile,
    updateProfile

}