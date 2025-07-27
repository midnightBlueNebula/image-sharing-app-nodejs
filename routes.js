import session from "express-session";
import pkg from "mongodb";
const { ObjectId } = pkg;
import h from "./helper.js";
import callPromise from "./callPromise.js";
import postController from "./controllers/postController.js";
import userController from "./controllers/userController.js";
import { fileURLToPath } from "url";
import path from "path";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default function routes(app, db) {
  app.use(
    session({
      secret: process.env.SECRET_SESSION_KEY,
      resave: true,
      saveUninitialized: true,
    })
  );

  app.get("/", function (request, response) {
    if (h.loggedIn(request.session.user_id)) {
      response.redirect("/profile");
    }

    response.render(`${__dirname}/views/index.ejs`);
  });

  userController(app, db);

  postController(app, db);

  app.post("/like/:content/:contentId", (req, res) => {
    if (!h.loggedIn(req.session.user_id)) {
      res.redirect("/");
    }

    const content = req.params.content;
    const contentId = req.params.contentId;
    const userId = req.session.user_id;

    callPromise(likeContent(db, `image-app-${content}s`, contentId, userId))
      .then(function (result) {
        res.json(result);
      })
      .catch(function (error) {
        res.json(error.message);
      });
  });

  app.post("/regret-like/:content/:contentId", (req, res) => {
    if (!h.loggedIn(req.session.user_id)) {
      res.redirect("/");
    }

    const content = req.params.content;
    const contentId = req.params.contentId;
    const userId = req.session.user_id;

    callPromise(
      regretLikeContent(db, `image-app-${content}s`, contentId, userId)
    )
      .then(function (result) {
        res.json(result);
      })
      .catch(function (error) {
        res.json(error.message);
      });
  });

  app.post("/comment/:parentType/:parentId", (req, res) => {
    if (!h.loggedIn(req.session.user_id)) {
      res.redirect("/");
    }

    const content = h.cleanseString(req.body.content.trim());
    const parentType = req.params.parentType;
    const parentId = req.params.parentId;
    const userId = req.session.user_id;

    callPromise(
      createComment(
        db,
        "image-app-comments",
        content,
        parentType,
        parentId,
        userId
      )
    ).then(function (comment) {
      if (comment) {
        callPromise(getUserById(db, "image-app-users", userId.toString())).then(
          function (user) {
            if (user) {
              res.json({ comment: comment, user: user });
            } else {
              res.send(false);
            }
          }
        );
      } else {
        res.send(false);
      }
    });
  });

  app.get("/delete-comment/:parentType/:parentId/:commentId", (req, res) => {
    if (!h.loggedIn(req.session.user_id)) {
      res.redirect("/");
    }

    const parentType = req.params.parentType;
    const parentId = req.params.parentId;
    const commentId = req.params.commentId;
    const userId = req.session.user_id;

    callPromise(isAdmin(db, "image-app-users", userId)).then(function (admin) {
      if (admin) {
        callPromise(
          deleteComment(
            db,
            "image-app-comments",
            parentType,
            parentId,
            commentId
          )
        )
          .then(function (result) {
            res.json(true);
          })
          .catch(function (error) {
            console.log(error.message);
            res.json(false);
          });
      } else {
        callPromise(
          isCommentor(db, "image-app-comments", commentId, userId)
        ).then(function (commentor) {
          if (commentor) {
            callPromise(
              deleteComment(
                db,
                "image-app-comments",
                parentType,
                parentId,
                commentId
              )
            )
              .then(function (result) {
                res.json(true);
              })
              .catch(function (error) {
                console.log(error.message);
                res.json(false);
              });
          } else {
            res.json(false);
          }
        });
      }
    });
  });

  app.get("/get-comments/:parentType/:parentId", (req, res) => {
    const parentType = req.params.parentType;
    const parentId = req.params.parentId;
    const viewerId = req.session.user_id;

    if (parentType == "comment") {
      callPromise(getCommentById(db, "image-app-comments", parentId)).then(
        function (parentComment) {
          callPromise(
            getCommentsOfParent(db, "image-app-comments", parentId)
          ).then(function (comments) {
            comments.unshift(parentComment);
            getUserPerCommentThenSend(res, viewerId, comments, 0, []);
          });
        }
      );
    } else {
      callPromise(getCommentsOfParent(db, "image-app-comments", parentId)).then(
        function (comments) {
          getUserPerCommentThenSend(res, viewerId, comments, 0, []);
        }
      );
    }
  });

  app.post("/follow/:followedId", (req, res) => {
    if (!h.loggedIn(req.session.user_id)) {
      res.redirect("/");
    }

    const followerId = req.session.user_id;
    const followedId = req.params.followedId;

    callPromise(followUser(db, "image-app-users", followerId, followedId)).then(
      function (result) {
        if (result) {
          callPromise(getUserById(db, "image-app-users", followedId)).then(
            function (followedUser) {
              res.json(followedUser);
            }
          );
        } else {
          res.send(false);
        }
      }
    );
  });

  app.post("/unfollow/:followedId", (req, res) => {
    if (!h.loggedIn(req.session.user_id)) {
      res.redirect("/");
    }

    const followerId = req.session.user_id;
    const followedId = req.params.followedId;

    callPromise(
      unfollowUser(db, "image-app-users", followerId, followedId)
    ).then(function (result) {
      if (result) {
        callPromise(getUserById(db, "image-app-users", followedId)).then(
          function (followedUser) {
            res.json(followedUser);
          }
        );
      } else {
        res.send(false);
      }
    });
  });

  app.post("/feed", (req, res) => {
    if (!h.loggedIn(req.session.user_id)) {
      res.redirect("/");
    }

    const userId = req.session.user_id;
    const dateFilter = new Date(req.body.dateFilter);

    callPromise(getUserFeed(db, "image-app-users", userId, dateFilter)).then(
      function (feedPosts) {
        if (feedPosts) {
          getCreatorPerPostThenSendJSON(res, feedPosts, 0, []);
        } else {
          res.send(false);
        }
      }
    );
  });

  app.get("/getUserJSON/:id", (req, res) => {
    getUserById(db, "image-app-users", ObjectId(req.params.id)).then(function (
      user
    ) {
      if (user) {
        res.json({
          creatorId: user._id.toString(),
          viewerId: req.session.user_id,
          name: user.name,
          about: user.about,
          image: user.profileImageURL,
          followerIds: user.followerIds,
        });
      } else {
        res.send(false);
      }
    });
  });

  /*                                     Controller functions written below.                                    */

  //call likeContent as shown beneath
  /* 
    callPromise(likeContent(db, `image-app-${content}s`, contentId, userId)).then(function(result) {
      use received data here...
    });
  */

  const likeContent = (db, cluster, contentId, userId) => {
    return new Promise((resolve, reject) => {
      db.collection(cluster).findOneAndUpdate(
        {
          _id: ObjectId(contentId),
          likedUserIds: { $ne: userId },
          creatorId: { $ne: userId },
        },
        { $push: { likedUserIds: userId } },
        { returnOriginal: false },
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
  };

  //call regretLikeContent as shown beneath
  /* 
    callPromise(regretLikeContent(db, `image-app-${content}s`, contentId, userId)).then(function(result) {
      use received data here...
    });
  */

  const regretLikeContent = (db, collection, contentId, userId) => {
    return new Promise((resolve, reject) => {
      db.collection(collection).findOneAndUpdate(
        { _id: ObjectId(contentId), likedUserIds: userId },
        { $pull: { likedUserIds: userId } },
        { returnOriginal: false },
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
  };

  //call followUser as shown beneath
  /* 
    callPromise(followUser(db, "image-app-users", followerId, followedId)).then(function(result) {
      use received data here...
    });
  */

  const followUser = (db, cluster, followerId, followedId) => {
    if (followerId == followedId) return;

    return new Promise((resolve, reject) => {
      db.collection(cluster).findOneAndUpdate(
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
    callPromise(unfollowUser(db, "image-app-users", followerId, followedId)).then(function(result) {
      use received data here...
    });
  */

  const unfollowUser = (db, cluster, followerId, followedId) => {
    return new Promise((resolve, reject) => {
      db.collection(cluster).findOneAndUpdate(
        { _id: ObjectId(followerId), followedIds: followedId },
        { $pull: { followedIds: followedId } },
        { returnOriginal: false },
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            db.collection(cluster).findOneAndUpdate(
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
    callPromise(getFollowedUsers(db, "image-app-users", userId)).then(function(result) {
      use received data here...
    });
  */

  const getFollowedUsers = (db, collection, userId) => {
    return new Promise((resolve, reject) => {
      db.collection(collection)
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

  //call getUserFeed as shown beneath
  /* 
    callPromise(getUserFeed(db, "image-app-users", userId, dateFilter)).then(function(result) {
      use received data here...
    });
  */

  const getUserFeed = (db, cluster, userId, dateFilter) => {
    return new Promise((resolve, reject) => {
      callPromise(getUserById(db, "image-app-users", userId)).then(function (
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

  //call createComment as shown beneath
  /* 
    callPromise(createComment(db, "image-app-comments", content, parentType, parentId, userId)).then(function(result) {
      use received data here...
    });
  */

  const createComment = (
    db,
    cluster,
    content,
    parentType,
    parentId,
    userId
  ) => {
    return new Promise((resolve, reject) => {
      const date = new Date();

      db.collection(cluster).insertOne(
        {
          _id: new ObjectId(),
          content: content,
          createdAt: date,
          updatedAt: date,
          parentType: parentType,
          parentId: parentId,
          userId: userId,
          commentIds: [],
          likedUserIds: [],
        },
        (error, result) => {
          if (error) {
            reject(error);
          } else if (result) {
            db.collection(`image-app-${parentType}s`).findOneAndUpdate(
              { _id: ObjectId(parentId) },
              { $push: { commentIds: result.ops[0]._id } },
              { returnOrginal: false },
              (error2, result2) => {
                if (error2) {
                  reject(error2);
                } else if (result2) {
                  resolve(result.ops[0]);
                } else {
                  resolve(false);
                }
              }
            );
          } else {
            callPromise(
              deleteComment(
                db,
                "image-app-comments",
                parentType,
                result.ops[0]._id.toString()
              )
            ).then(function (result3) {
              resolve(false);
            });
          }
        }
      );
    });
  };

  //call deleteComment as shown beneath
  /* 
    callPromise(deleteComment(db, "image-app-comments", parentType, parentId, commentId)).then(function(result) {
      use received data here...
    });
  */

  const deleteComment = (db, cluster, parentType, parentId, commentId) => {
    return new Promise((resolve, reject) => {
      db.collection(cluster).deleteOne(
        { _id: ObjectId(commentId) },
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            db.collection(`image-app-${parentType}s`).findOneAndUpdate(
              { _id: ObjectId(parentId) },
              { $pull: { commentIds: ObjectId(commentId) } },
              { returnOrginal: false },
              (err2, res2) => {
                if (err2) {
                  reject(err2);
                } else {
                  callPromise(
                    deleteCommentsOfParent(db, `image-app-comments`, commentId)
                  ).then(function (result3) {
                    resolve(res2);
                  });
                }
              }
            );
          }
        }
      );
    });
  };

  //call deleteCommentsOfParent as shown beneath
  /* 
    callPromise(deleteCommentsOfParent(db, `image-app-comments`, parentId)).then(function(result) {
      use received data here...
    });
  */

  const deleteCommentsOfParent = (db, collection, parentId) => {
    return new Promise((resolve, reject) => {
      getAllSubCommentsAndDelete(resolve, reject, db, parentId);
    });
  };

  //call getCommentById as shown beneath
  /* 
    callPromise(getCommentById(db, "image-app-comments", commentId)).then(function(result) {
      use received data here...
    });
  */

  const getCommentById = (db, cluster, commentId) => {
    return new Promise((resolve, reject) => {
      db.collection(cluster).findOne(
        { _id: ObjectId(commentId) },
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
  };

  //call getUserPerCommentThenSend as shown beneath
  /* 
    getUserPerCommentThenSend(response, viewerId, comments, 0, [])
  */

  const getUserPerCommentThenSend = (
    response,
    viewerId,
    comments,
    index,
    data
  ) => {
    if (comments[index]) {
      callPromise(
        getUserById(db, "image-app-users", comments[index].userId)
      ).then(function (user) {
        data.push({ comment: comments[index], user: user });
        getUserPerCommentThenSend(response, viewerId, comments, ++index, data);
      });
    } else {
      response.json({ viewerId: viewerId, data: data });
    }
  };

  //call isCommentor
  /* 
    callPromise(isCommentor(db, "image-app-comments", commentId, userId)).then(function(result) {
      use received data here...
    });
  */

  const isCommentor = (db, cluster, commentId, userId) => {
    return new Promise((resolve, reject) => {
      callPromise(getCommentById(db, cluster, commentId)).then(function (
        comment
      ) {
        if (comment) {
          if (userId == comment.userId) {
            resolve(true);
          } else {
            resolve(false);
          }
        } else {
          resolve(false);
        }
      });
    });
  };

  //call getCommentsByIds as shown beneath
  /* 
    callPromise(getCommentsByIds(db, "image-app-comments", commentIds)).then(function(result) {
      use received data here...
    });
  */

  const getCommentsByIds = (db, cluster, commentIds) => {
    return new Promise((resolve, reject) => {
      db.collection(cluster)
        .find({ _id: { $in: commentIds } })
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

  //call getCommentsOfParent as shown beneath
  /* 
    callPromise(getCommentsOfParent(db, `image-app-comments`, parentId)).then(function(result) {
      use received data here...
    });
  */

  const getCommentsOfParent = (db, cluster, parentId) => {
    return new Promise((resolve, reject) => {
      db.collection(cluster)
        .find({ parentId: parentId })
        .sort({ createdAt: 1 })
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

  const getCommentsOfParentForDel = (db, cluster, parentId) => {
    return new Promise((resolve, reject) => {
      db.collection(cluster)
        .find({ parentId: parentId })
        .toArray((error, result) => {
          if (error) {
            reject(error);
          } else if (result) {
            result = result.map((r) => r._id.toString());
            resolve(result);
          } else {
            resolve(false);
          }
        });
    });
  };

  const getAllSubCommentsAndDelete = (
    resolve,
    reject,
    db,
    parentId,
    index = 0,
    data = [parentId]
  ) => {
    if (data[index]) {
      callPromise(
        getCommentsOfParentForDel(db, `image-app-comments`, data[index])
      ).then(function (result) {
        if (result) {
          data = data.concat(result);
        }
        getAllSubCommentsAndDelete(
          resolve,
          reject,
          db,
          parentId,
          ++index,
          data
        );
      });
    } else {
      db.collection("image-app-comments").deleteMany(
        { parentId: { $in: data } },
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(true);
          }
        }
      );
    }
  };

  const getAllSubCommentsJSON = (
    res,
    db,
    parentId,
    index = 0,
    data = [parentId]
  ) => {
    if (data[index]) {
      callPromise(
        getCommentsOfParentForDel(db, `image-app-comments`, data[index])
      ).then(function (result) {
        if (result) {
          data = data.concat(result);
        }
        getAllSubCommentsJSON(res, db, parentId, ++index, data);
      });
    } else {
      db.collection("image-app-comments")
        .find({ parentId: { $in: data } })
        .toArray((error, result) => {
          if (error) {
            res.send(error);
          } else {
            res.json(result);
          }
        });
    }
  };

  //call getCommentsOfUser as shown beneath
  /* 
    callPromise(getCommentsOfUser(db, "image-app-comments", userId)).then(function(result) {
      use received data here...
    });
  */

  const getCommentsOfUser = (db, cluster, userId) => {
    return new Promise((resolve, reject) => {
      db.collection(cluster)
        .find({ userId: userId })
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

  /*                                     helper methods depends on app and db added here                                    */
}
