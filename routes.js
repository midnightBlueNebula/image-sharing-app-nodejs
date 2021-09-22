const session = require("express-session");
const bcrypt = require("bcrypt");
const ObjectId = require("mongodb").ObjectId;
const helper = require("./helper.js");
const saltRounds = 12;

module.exports = function(app, db, bucket) {
  app.use(
    session({
      secret: process.env.SECRET_SESSION_KEY,
      resave: true,
      saveUninitialized: true
    })
  );

  app.get("/", function(request, response) {
    if (loggedIn(request.session.user_id)) {
      response.redirect("/profile");
    }
    response.render(`${__dirname}/views/index.ejs`);
  });

  app
    .route("/register")
    .get((req, res) => {
      if (loggedIn(req.session.user_id)) {
        res.redirect("/profile");
      }
      res.sendFile(`${__dirname}/views/register.html`);
    })
    .post((req, res) => {
      if (loggedIn(req.session.user_id)) {
        res.redirect("/profile");
      }

      const email = helper.cleanseString(req.body.email);
      const name = helper.cleanseString(req.body.name);
      const password = req.body.password;

      callPromise(getUserByEmail(db, "users", email)).then(function(result) {
        if (result) {
          res.send("email already has taken");
          return;
        } else {
          bcrypt.genSalt(saltRounds, function(fail, salt) {
            bcrypt.hash(password, salt, function(fail, hash) {
              if (fail) {
                res.send(fail.message);
                return;
              } else {
                db.collection("users").insertOne(
                  {
                    _id: new ObjectId(),
                    email: email,
                    name: name,
                    password_hash: hash,
                    admin: false
                  },
                  (insert_error, new_el) => {
                    if (insert_error) {
                      res.send(insert_error.message);
                    } else {
                      req.session.user_id = new_el.ops[0]._id;
                      res.redirect("/profile");
                    }
                  }
                );
              }
            });
          });
        }
      });
    });

  app.post("/login", (req, res) => {
    if (loggedIn(req.session.user_id)) {
      res.redirect("/profile");
    }
    const email = helper.cleanseString(req.body.email);
    const password = req.body.password;

    callPromise(getUserByEmail(db, "users", email)).then(function(result) {
      if (!result) {
        res.send("Email is not registered.");
        return;
      }
      const hash = result.password_hash;
      bcrypt.compare(password, hash, function(fail, outcome) {
        if (fail) {
          res.send(fail.message);
          return;
        } else {
          if (outcome) {
            req.session.user_id = result._id;
            res.redirect("/profile");
          } else {
            res.send("Wrong password.");
          }
        }
      });
    });
  });

  app.get("/logout", (req, res) => {
    req.session.user_id = undefined;
    res.redirect("/");
  });

  app.get("/profile", (req, res) => {
    const id = req.session.user_id;
    if (!loggedIn(id)) {
      res.redirect("/");
    }

    callPromise(getUserById(db, "users", id)).then(function(result) {
      if (!result) {
        res.send("user not found");
      }
      renderWithData(res, "profile.ejs", { user: result });
    });
  });

  app.get("/post", (req, res) => {
    if (loggedIn(req.session.user_id)) {
      res.redirect("/profile");
    }
  });

  app.post("/post", (req, res) => {});

  app.delete("/post", (req, res) => {});

  app.get("/new-posts", (req, res) => {});

  app.get("/top-posts", (req, res) => {});

  /*                                     helper methods depends on app and db added here                                    */

  //call async data request from database (promise -> data request, example: getUserById function)
  const callPromise = async promise => {
    const result = await promise;
    return result;
  };

  //call getUserById as shown beneath
  /* 
    callPromise(getUserById(db, "users", id)).then(function(result) {
      use received data here...
    });
  */

  const getUserById = (db, cluster, id) => {
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
  };

  //call getUserByEmail as shown beneath
  /* 
    callPromise(getUserByEmail(db, "users", email)).then(function(result) {
      use received data here...
    });
  */

  const getUserByEmail = (db, cluster, email) => {
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
  };

  //call createPost as shown beneath
  /* 
    callPromise(createPost(db, "image-app-posts", userId, image, text)).then(function(result) {
      use received data here...
    });
  */

  const createPost = (db, cluster, userId, image, text) => {
    return new Promise((resolve, reject) => {
      db.collection(cluster).InsertOne(
        {
          _id: new ObjectId(),
          creator_id: userId,
          image: image,
          text: text
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
  };

  //call getPostById as shown beneath
  /* 
    callPromise(getPostById(db, "image-app-posts", postId)).then(function(result) {
      use received data here...
    });
  */

  const getPostById = (db, cluster, postId) => {
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
  };

  //call deletePost as shown beneath
  /* 
    callPromise(deletePost(db, "image-app-posts", postId)).then(function(result) {
      use received data here...
    });
  */

  const deletePost = (db, cluster, postId) => {
    return new Promise((resolve, reject) => {
      db.collection(cluster).deleteOne(
        { _id: ObjectId(postId) },
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result);
          }
        }
      );
    });
  };

  //call viewPost as shown beneath
  /* 
    callPromise(postViewedByUser(db, "image-app-posts-view-track", postId, userId)).then(function(result) {
      use received data here...
    });
  */

  const postViewedByUser = (db, cluster, postId, userId) => {
    return new Promise((resolve, reject) => {
      db.collection(cluster).findOne(
        { post_id: ObjectId(postId), user_id: ObjectId(userId) },
        (error, result) => {
          if (error) {
            reject(error);
          } else if (result) {
            resolve(false);
          } else {
            db.collection(cluster).insertOne(
              {
                _id: new ObjectId(),
                post_id: postId,
                user_id: userId
              },
              (fail, outcome) => {
                if (fail) {
                  reject(fail);
                } else {
                  resolve(outcome.ops[0]);
                }
              }
            );
          }
        }
      );
    });
  };

  //call likePost as shown beneath
  /* 
    callPromise(likePost(db, "image-app-liked-posts", postId, userId)).then(function(result) {
      use received data here...
    });
  */

  const likePost = (db, cluster, postId, userId) => {
    return new Promise((resolve, reject) => {
      db.collection(cluster).findOne(
        { post_id: ObjectId(postId), user_id: ObjectId(userId) },
        (error, result) => {
          if (error) {
            reject(error);
          } else if (result) {
            resolve(false);
          } else {
            db.collection(cluster).insertOne(
              {
                _id: new ObjectId(),
                post_id: postId,
                user_id: userId
              },
              (fail, outcome) => {
                if (fail) {
                  reject(fail);
                } else {
                  resolve(outcome.ops[0]);
                }
              }
            );
          }
        }
      );
    });
  };
  
  //call getLikedPosts as shown beneath
  /* 
    callPromise(getLikedPosts(db, "image-app-liked-posts", userId)).then(function(result) {
      use received data here...
    });
  */
  
  const getLikedPosts = (db, cluster, userId) => {
    return new Promise((resolve, reject) => {
      db.collection(cluster).find({userId: userId}).toArray((error, result) => {
        if (error) {
          reject(error)
        } else if (result) {
          resolve(result)
        } else {
          resolve(false)
        }
      })
    })
  }

  //call isCreator as shown beneath
  /* 
    callPromise(isCreator(db, "image-app-posts", postId, userId)).then(function(result) {
      use received data here...
    });
  */

  const isCreator = (db, cluster, postId, userId) => {
    return new Promise((resolve, reject) => {
      callPromise(getPostById(db, cluster, postId)).then(function(result) {
        if (result) {
          if (ObjectId(result.creator_id) == ObjectId(userId)) {
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

  //call getPostsOfUser as shown beneath
  /* 
    callPromise(getPostsOfUser(db, "image-app-posts", userId)).then(function(result) {
      use received data here...
    });
  */

  const getPostsOfUser = (db, cluster, userId) => {
    return new Promise((resolve, reject) => {
      db.collection(cluster)
        .find({ user_id: ObjectId(userId) })
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

  //call isAdmin as shown beneath
  /* 
    callPromise(isAdmin(db, "users", userId)).then(function(result) {
      use received data here...
    });
  */

  const isAdmin = (db, cluster, userId) => {
    return new Promise((resolve, reject) => {
      callPromise(getUserById(db, cluster, userId)).then(function(result) {
        if (result) {
          resolve(result.admin);
        } else {
          resolve(false);
        }
      });
    });
  };

  //call getFollowRelationship as shown beneath
  /* 
    callPromise(getFollowRelationship(db, "image-app-relationships", followerId, followedId)).then(function(result) {
      use received data here...
    });
  */

  const getFollowRelationship = (db, cluster, followerId, followedId) => {
    return new Promise((resolve, reject) => {
      db.collection(cluster).findOne(
        { followerId: followerId, followedId: followedId },
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
    callPromise(followUser(db, "image-app-relationships", followerId, followedId)).then(function(result) {
      use received data here...
    });
  */

  const followUser = (db, cluster, followerId, followedId) => {
    return new Promise((resolve, reject) => {
      callPromise(
        getFollowRelationship(db, cluster, followerId, followedId)
      ).then(function(result) {
        if (result) {
          resolve(false);
        } else {
          db.collection(cluster).insertOne(
            {
              _id: new ObjectId(),
              followerId: followerId,
              followedId: followedId
            },
            (error, data) => {
              if (error) {
                reject(error);
              } else {
                resolve(data.ops[0]);
              }
            }
          );
        }
      });
    });
  };

  //call unfollowUser as shown beneath
  /* 
    callPromise(unfollowUser(db, "image-app-relationships", followerId, followedId)).then(function(result) {
      use received data here...
    });
  */

  const unfollowUser = (db, cluster, followerId, followedId) => {
    return new Promise((resolve, reject) => {
      db.collection(cluster).deleteOne(
        { followerId: followerId, followedId: followedId },
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result);
          }
        }
      );
    });
  };

  const renderWithData = (
    res,
    viewFile,
    obj
  ) /*(response, "profile.ejs", { variableName: data })*/ => {
    res.render(`${__dirname}/views/${viewFile}`, obj);
  };

  const loggedIn = id => {
    if (typeof id === "undefined") {
      return false;
    }

    return true;
  };

  const sendPost = (user_id, text, picture) => {};
  /*                                     helper methods depends on app and db added here                                    */
};
