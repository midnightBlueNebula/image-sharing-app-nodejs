import pkg from "mongodb";
const { ObjectId } = pkg;
import callPromise from "../callPromise.js";

//call createPost as shown beneath
/* 
    callPromise(createPost(db, userId, title, imageURL, context)).then(function(result) {
      use received data here...
    });
  */

function createPost(db, userId, title, imageURL, context, tags) {
  return new Promise((resolve, reject) => {
    const date = new Date();
    db.collection("image-app-posts").insertOne(
      {
        _id: new ObjectId(),
        creatorId: userId,
        title: title,
        imageURL: imageURL,
        context: context,
        tags: tags,
        likedUserIds: [],
        commentIds: [],
        createdAt: date,
        updatedAt: date,
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result.ops[0]);
        }
      }
    );
  });
}

//call getPostById as shown beneath
/* 
    callPromise(getPostById(db, postId)).then(function(result) {
      use received data here...
    });
  */

function getPostById(db, postId) {
  return new Promise((resolve, reject) => {
    db.collection("image-app-posts").findOne(
      { _id: ObjectId(postId) },
      (error, result) => {
        if (error) {
          reject(error);
        } else if (result) {
          resolve(result);
        } else {
          resolve(false);
        }
      }
    );
  });
}

//call getPostsByTags as shown beneath
/* 
    callPromise(getPostsByTags(db, tags)).then(function(result) {
      use received data here...
    });
  */

function getPostsByTags(db, tags) {
  return new Promise((resolve, reject) => {
    db.collection("image-app-posts")
      .find({ tags: tags })
      .sort({ createdAt: -1 })
      .toArray((error, result) => {
        if (error) {
          reject(error);
        } else if (result) {
          resolve(result);
        } else {
          resolve(false);
        }
      });
  });
}

//call deletePost as shown beneath
/* 
    callPromise(deletePost(db, postId)).then(function(result) {
      use received data here...
    });
  */

function deletePost(db, postId) {
  return new Promise((resolve, reject) => {
    db.collection("image-app-posts").deleteOne(
      { _id: ObjectId(postId) },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          callPromise(
            deleteCommentsOfParent(db, "image-app-comments", postId)
          ).then(function (result2) {
            resolve(true);
          });
        }
      }
    );
  });
}

//call isCreator as shown beneath
/* 
    callPromise(isCreator(db, postId, userId)).then(function(result) {
      use received data here...
    });
  */

function isCreator(db, postId, userId) {
  return new Promise((resolve, reject) => {
    callPromise(getPostById(db, "image-app-posts", postId)).then(function (
      result
    ) {
      if (result) {
        if (result.creatorId == userId) {
          resolve(true);
        } else {
          resolve(false);
        }
      } else {
        resolve(false);
      }
    });
  });
}

//call getLikedPostsByUser as shown beneath
/* 
    callPromise(getLikedPostsByUser(db, userId)).then(function(result) {
      use received data here...
    });
  */

const getLikedPostsByUser = (db, userId) => {
  return new Promise((resolve, reject) => {
    db.collection("image-app-posts")
      .find({ likedUserIds: userId })
      .sort({ createdAt: -1 })
      .toArray((error, result) => {
        if (error) {
          reject(error);
        } else if (result) {
          resolve(result);
        } else {
          resolve(false);
        }
      });
  });
};

//call getPostsOfUser as shown beneath
/* 
    callPromise(getPostsOfUser(db, userId, dateFilter, false)).then(function(result) {
      use received data here...
    });
  */

const getPostsOfUser = (
  db,
  userId,
  dateFilter = false,
  multipleUsers = false
) => {
  return new Promise((resolve, reject) => {
    var query = multipleUsers
      ? { creatorId: { $in: userId } }
      : { creatorId: userId };

    if (dateFilter) {
      query.createdAt = { $gte: dateFilter };
    }

    db.collection("image-app-posts")
      .find(query)
      .sort({ createdAt: -1 })
      .toArray((error, resultArray) => {
        if (error) {
          reject(error);
        } else if (resultArray) {
          resolve(resultArray);
        } else {
          resolve(false);
        }
      });
  });
};

//call getPostsByDate as shown beneath
/* 
    callPromise(getPostsByDate(db, "image-app-posts", date)).then(function(result) {
      use received data here...
    });
  */

const getPostsByDate = (db, date) => {
  return new Promise((resolve, reject) => {
    db.collection("image-app-posts")
      .find({ createdAt: { $gte: date } })
      .sort({ createdAt: -1 })
      .toArray((error, result) => {
        if (error) {
          reject(error);
        } else if (result) {
          resolve(result);
        } else {
          resolve(false);
        }
      });
  });
};

//call getTopLikedPosts as shown beneath
/* 
    callPromise(getPostsOfUser(db, dateFilter)).then(function(result) {
      use received data here...
    });
  */

const getTopLikedPosts = (db, dateFilter) => {
  return new Promise((resolve, reject) => {
    db.collection("image-app-posts")
      .find({ createdAt: { $gte: dateFilter } })
      .toArray((error, result) => {
        if (error) {
          reject(error);
        } else if (result) {
          const posts = result.sort((a, b) => {
            b.likedUserIds.length - a.likedUserIds.length;
          });
          resolve(posts);
        } else {
          resolve(false);
        }
      });
  });
};

//call getUserFeed as shown beneath
/* 
    callPromise(getUserFeed(db, userId, dateFilter)).then(function(result) {
      use received data here...
    });
  */

const getUserFeed = (db, userId, dateFilter) => {
  return new Promise((resolve, reject) => {
    callPromise(User.getUserById(db, "image-app-users", userId)).then(function (
      user
    ) {
      if (user) {
        const userIds = user.followedIds;

        callPromise(
          getPostsOfUser(db, "image-app-posts", userIds, dateFilter, true)
        ).then(function (posts) {
          if (posts) {
            resolve(posts);
          } else {
            resolve(false);
          }
        });
      } else {
        resolve(false);
      }
    });
  });
};

const Post = {
  createPost,
  getPostById,
  getPostsByTags,
  deletePost,
  isCreator,
  getLikedPostsByUser,
  getPostsOfUser,
  getPostsByDate,
  getTopLikedPosts,
  getUserFeed,
};

export default Post;
