import pkg from "mongodb"; const { ObjectId } = pkg;
import callPromise from "../callPromise.js";

const saltRounds = 12;

//call createPost as shown beneath
/* 
    callPromise(createPost(db, "image-app-posts", userId, title, imageURL, context)).then(function(result) {
      use received data here...
    });
  */

function createPost(db, cluster, userId, title, imageURL, context, tags) {
  return new Promise((resolve, reject) => {
    const date = new Date();
    db.collection(cluster).insertOne(
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
    callPromise(getPostById(db, "image-app-posts", postId)).then(function(result) {
      use received data here...
    });
  */

function getPostById(db, cluster, postId) {
  return new Promise((resolve, reject) => {
    db.collection(cluster).findOne(
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
    callPromise(getPostsByTags(db, "image-app-posts", tags)).then(function(result) {
      use received data here...
    });
  */

function getPostsByTags(db, cluster, tags) {
  return new Promise((resolve, reject) => {
    db.collection(cluster)
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
    callPromise(deletePost(db, "image-app-posts", postId)).then(function(result) {
      use received data here...
    });
  */

function deletePost(db, cluster, postId) {
  return new Promise((resolve, reject) => {
    db.collection(cluster).deleteOne(
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

//call getLikedPostsByUser as shown beneath
/* 
    callPromise(getLikedPostsByUser(db, "image-app-posts", userId)).then(function(result) {
      use received data here...
    });
  */

const getLikedPostsByUser = (db, cluster, userId) => {
  return new Promise((resolve, reject) => {
    db.collection(cluster)
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
    callPromise(getPostsOfUser(db, "image-app-posts", userId, dateFilter, false)).then(function(result) {
      use received data here...
    });
  */

const getPostsOfUser = (
  db,
  cluster,
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

    db.collection(cluster)
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

const getPostsByDate = (db, cluster, date) => {
  return new Promise((resolve, reject) => {
    db.collection(cluster)
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
    callPromise(getPostsOfUser(db, "image-app-posts", dateFilter)).then(function(result) {
      use received data here...
    });
  */

const getTopLikedPosts = (db, cluster, dateFilter) => {
  return new Promise((resolve, reject) => {
    db.collection(cluster)
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

// models/post.js
const Post = {
  createPost,
  getPostById,
  getPostsByTags,
  deletePost,
  getLikedPostsByUser,
  getPostsOfUser,
  getPostsByDate,
  getTopLikedPosts,
};

export default Post;
