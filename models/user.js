import pkg from "mongodb"; const { ObjectId } = pkg;
import callPromise from "../callPromise.js";

//call isAdmin as shown beneath
/* 
    callPromise(isAdmin(db, "image-app-users", userId)).then(function(result) {
      use received data here...
    });
  */

export function isAdmin(db, cluster, userId) {
  return new Promise((resolve, reject) => {
    callPromise(getUserById(db, cluster, userId)).then(function (result) {
      if (result) {
        resolve(result.admin);
      } else {
        resolve(false);
      }
    });
  });
}

//call getUserById as shown beneath
/* 
    callPromise(getUserById(db, "image-app-users", id)).then(function(result) {
      use received data here...
    });
  */

export function getUserById(db, cluster, id) {
  return new Promise((resolve, reject) => {
    db.collection(cluster).findOne({ _id: ObjectId(id) }, (error, result) => {
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

//call getUserByIds as shown beneath
/* 
    callPromise(getUserByIds(db, "image-app-users", ids)).then(function(result) {
      use received data here...
    });
  */

export function getUserByIds(db, cluster, ids) {
  return new Promise((resolve, reject) => {
    db.collection(cluster)
      .find({ _id: { $in: ids } })
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

//call getUserByEmail as shown beneath
/* 
    callPromise(getUserByEmail(db, "image-app-users", email)).then(function(result) {
      use received data here...
    });
  */

export function getUserByEmail(db, cluster, email) {
  return new Promise((resolve, reject) => {
    db.collection(cluster).findOne({ email: email }, (error, result) => {
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

//call isCreator as shown beneath
/* 
    callPromise(isCreator(db, "image-app-posts", postId, userId)).then(function(result) {
      use received data here...
    });
  */

export function isCreator(db, cluster, postId, userId) {
  return new Promise((resolve, reject) => {
    callPromise(getPostById(db, cluster, postId)).then(function (result) {
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

//call getCreatorPerPostThenRender as shown beneath
/* 
    getCreatorPerPostThenRender(renderWithData, res, "page.ejs", { renderWithData: argsToPage }, posts, sortBy)
    sortBy -> 0: no sorting, 1: sort by likes, 2: sort by date.
  */

export function getCreatorPerPostThenRender(
  renderCall,
  response,
  renderView,
  renderOpts,
  posts,
  sortBy = 0,
  db
) {
  const creatorIdPostMap = {};
  const creatorIds = posts.map((post) => {
    const creatorId = post.creatorId;
    if (creatorIdPostMap[creatorId] == undefined) {
      creatorIdPostMap[creatorId] = [];
      creatorIdPostMap[creatorId].push(post);
      return ObjectId(creatorId);
    } else {
      creatorIdPostMap[creatorId].push(post);
    }
  });
  callPromise(getUserByIds(db, "image-app-users", creatorIds)).then(function (
    creators
  ) {
    let data = [];
    creators.forEach((creator) => {
      creatorIdPostMap[creator._id + ""].forEach((post) => {
        data.push({ post: post, creator: creator });
      });
    });
    if (sortBy == 1) {
      data = data.sort(
        (a, b) => b.post.likedUserIds.length - a.post.likedUserIds.length
      );
    } else if (sortBy == 2) {
      data = data.sort(
        (a, b) => b.post.createdAt.length - a.post.createdAt.length
      );
    }
    renderOpts.data = data;
    renderCall(response, renderView, renderOpts);
  });
}

//call getCreatorPerPostThenSendJSON as shown beneath
/* 
    getCreatorPerPostThenSendJSON(res, feedPosts, 0, [])
  */

export function getCreatorPerPostThenSendJSON(
  res,
  feedPosts,
  index = 0,
  data = [],
  db
) {
  if (feedPosts[index]) {
    callPromise(
      getUserById(db, "image-app-users", feedPosts[index].creatorId)
    ).then(function (creator) {
      data.push({ post: feedPosts[index], creator: creator });
      getCreatorPerPostThenSendJSON(res, feedPosts, ++index, data);
    });
  } else {
    res.json(data);
  }
}

// Bundle all functions into one object
const User = {
  isAdmin,
  getUserById,
  getUserByIds,
  getUserByEmail,
  isCreator,
  getCreatorPerPostThenRender,
  getCreatorPerPostThenSendJSON,
};

// Default export the object
export default User;
