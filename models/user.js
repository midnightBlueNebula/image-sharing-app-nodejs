import pkg from "mongodb";
const { ObjectId } = pkg;
import callPromise from "../callPromise.js";

//call isAdmin as shown beneath
/* 
    callPromise(isAdmin(db, userId)).then(function(result) {
      use received data here...
    });
  */

function isAdmin(db, userId) {
  return new Promise((resolve, reject) => {
    callPromise(getUserById(db, userId)).then(function (result) {
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
    callPromise(getUserById(db, id)).then(function(result) {
      use received data here...
    });
  */

function getUserById(db, id) {
  return new Promise((resolve, reject) => {
    db.collection("image-app-users").findOne({ _id: ObjectId(id) }, (error, result) => {
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
    callPromise(getUserByIds(db, ids)).then(function(result) {
      use received data here...
    });
  */

function getUserByIds(db, ids) {
  return new Promise((resolve, reject) => {
    db.collection("image-app-users")
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
    callPromise(getUserByEmail(db, email)).then(function(result) {
      use received data here...
    });
  */

function getUserByEmail(db, email) {
  return new Promise((resolve, reject) => {
    db.collection("image-app-users").findOne({ email: email }, (error, result) => {
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

//call getCreatorPerPostThenRender as shown beneath
/* 
    getCreatorPerPostThenRender(renderWithData, res, "page.ejs", { renderWithData: argsToPage }, posts, sortBy)
    sortBy -> 0: no sorting, 1: sort by likes, 2: sort by date.
  */

function getCreatorPerPostThenRender(
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
  callPromise(getUserByIds(db, creatorIds)).then(function (
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

function getCreatorPerPostThenSendJSON(
  res,
  feedPosts,
  index = 0,
  data = [],
  db
) {
  if (feedPosts[index]) {
    callPromise(
      getUserById(db, feedPosts[index].creatorId)
    ).then(function (creator) {
      data.push({ post: feedPosts[index], creator: creator });
      getCreatorPerPostThenSendJSON(res, feedPosts, ++index, data);
    });
  } else {
    res.json(data);
  }
}

const getUserPerCommentThenSend = (
  response,
  viewerId,
  comments,
  index,
  data,
  db
) => {
  if (comments[index]) {
    callPromise(
      getUserById(db, comments[index].userId)
    ).then(function (user) {
      data.push({ comment: comments[index], user: user });
      getUserPerCommentThenSend(
        response,
        viewerId,
        comments,
        ++index,
        data,
        db
      );
    });
  } else {
    response.json({ viewerId: viewerId, data: data });
  }
};

//call followUser as shown beneath
/* 
    callPromise(followUser(db, followerId, followedId)).then(function(result) {
      use received data here...
    });
  */

const followUser = (db, followerId, followedId) => {
  if (followerId == followedId) return;

  return new Promise((resolve, reject) => {
    db.collection("image-app-users").findOneAndUpdate(
      { _id: ObjectId(followerId), followedIds: { $ne: followedId } },
      { $push: { followedIds: followedId } },
      { returnOriginal: false },
      (error, result) => {
        if (error) {
          reject(error);
        } else if (result) {
          db.collection(cluster).findOneAndUpdate(
            { _id: ObjectId(followedId), followerIds: { $ne: followerId } },
            { $push: { followerIds: followerId } },
            { returnOriginal: false },
            (error2, result2) => {
              if (error2 || !result2) {
                db.collection(cluster).findOneAndUpdate(
                  { _id: ObjectId(followerId), followedIds: followedId },
                  { $pull: { followerIds: followerId } },
                  (error3, result3) => {
                    if (error2) {
                      reject(error2);
                    } else if (error3) {
                      reject(error3);
                    } else {
                      resolve(false);
                    }
                  }
                );
              } else {
                resolve(result2);
              }
            }
          );
        } else {
          resolve(false);
        }
      }
    );
  });
};

//call unfollowUser as shown beneath
/* 
    callPromise(unfollowUser(db, followerId, followedId)).then(function(result) {
      use received data here...
    });
  */

const unfollowUser = (db, followerId, followedId) => {
  return new Promise((resolve, reject) => {
    db.collection("image-app-users").findOneAndUpdate(
      { _id: ObjectId(followerId), followedIds: followedId },
      { $pull: { followedIds: followedId } },
      { returnOriginal: false },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          db.collection("image-app-users").findOneAndUpdate(
            { _id: ObjectId(followedId), followerIds: followerId },
            { $pull: { followerIds: followerId } },
            { returnOriginal: false },
            (error2, result2) => {
              if (error2) {
                reject(error2);
              } else if (result2) {
                resolve(result2);
              } else {
                resolve(false);
              }
            }
          );
        }
      }
    );
  });
};

//call getFollowedUsers as shown beneath
/* 
    callPromise(getFollowedUsers(db, userId)).then(function(result) {
      use received data here...
    });
  */

const getFollowedUsers = (db, userId) => {
  return new Promise((resolve, reject) => {
    db.collection("image-app-users")
      .find({ followerIds: userId })
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

const User = {
  isAdmin,
  getUserById,
  getUserByIds,
  getUserByEmail,
  getCreatorPerPostThenRender,
  getCreatorPerPostThenSendJSON,
  getUserPerCommentThenSend,
  followUser,
  unfollowUser,
  getFollowedUsers,
};

export default User;