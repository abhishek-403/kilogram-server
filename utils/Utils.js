var ta = require('time-ago')

const mapPost = (post, userId) => {
    return {
        _id: post.id,
        caption: post.caption,
        image: post.image,
        owner: {
            _id: post.owner._id,
            name: post.owner.name,
            username: post.owner.username,
            avatar: post.owner.avatar
        },
        likesCount: post.likes.length,
        isLiked: post.likes.includes(userId),
        timeAgo: ta.ago(post.createdAt),
        isMyPost:post.owner._id==userId
    }
}

module.exports = {
    mapPost
}