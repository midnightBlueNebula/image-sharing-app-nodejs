import callPromise from "../callPromise.js";
import h from "../helper.js";
import User from "../models/user.js";
import Post from "../models/post.js";

export default function (app, db) {
  app.get("/post", (req, res) => {
    if (!h.loggedIn(req.session.user_id)) {
      res.redirect("/");
    }

    const id = req.session.user_id;

    callPromise(User.getUserById(db, id)).then(function (result) {
      h.renderWithData(res, "post.ejs", {
        user: result,
        viewerId: result._id.toString(),
      });
    });
  });

  app.post("/post", (req, res) => {
    if (!h.loggedIn(req.session.user_id)) {
      res.redirect("/");
    }

    const userId = req.session.user_id;
    const title = h.cleanseString(req.body.title);
    const imageURL = h.cleanseString(req.body.imageURL);
    const context = h.cleanseString(req.body.context);

    callPromise(Post.createPost(db, userId, title, imageURL, context)).then(
      function (result) {
        const path = "/show-post/" + result._id;
        res.redirect(path);
      }
    );
  });

  app.get("/delete-post/:id", (req, res) => {
    if (!h.loggedIn(req.session.user_id)) {
      res.redirect("/");
    }

    if (req.session.currentURL == `/show-post/${req.params.id}`) {
      req.session.currentURL = "/new-posts";
    }

    callPromise(User.isAdmin(db, req.session.user_id)).then(function (admin) {
      if (admin) {
        callPromise(Post.deletePost(db, req.params.id))
          .then(function (post) {
            res.send(true);
          })
          .catch(function (error) {
            console.log(error.message);
            res.send(false);
          });
      } else {
        callPromise(
          Post.isCreator(db, req.params.id, req.session.user_id)
        ).then(function (creator) {
          if (creator) {
            callPromise(Post.deletePost(db, req.params.id))
              .then(function (post) {
                res.send(true);
              })
              .catch(function (error) {
                console.log(error.message);
                res.send(false);
              });
          } else {
            res.send(false);
          }
        });
      }
    });
  });

  app.get("/random-post", (req, res) => {
    db.collection("image-app-posts")
      .aggregate([
        { $match: { creatorId: { $ne: req.session.user_id } } },
        { $sample: { size: 2 } },
      ])
      .toArray((error, result) => {
        if (result) {
          User.getCreatorPerPostThenSendJSON(res, result, 0, [], db);
        } else {
          res.send(false);
        }
      });
  });

  app.get("/show-post/:id", (req, res) => {
    const postId = req.params.id;
    req.session.currentURL = `/show-post/${postId}`;

    callPromise(Post.getPostById(db, postId)).then(function (post) {
      if (post) {
        callPromise(User.getUserById(db, post.creatorId)).then(function (
          creator
        ) {
          let data = [{ post: post, creator: creator }];
          h.renderWithData(res, "showPosts.ejs", {
            data: data,
            viewerId: req.session.user_id,
          });
        });
      } else {
        res.send("/no data available");
      }
    });
  });

  app.get("/new-posts", (req, res) => {
    let date = new Date();
    date.setHours(date.getHours() - 1);
    req.session.currentURL = "/new-posts";

    callPromise(Post.getPostsByDate(db, date)).then(function (posts) {
      if (posts) {
        User.getCreatorPerPostThenRender(
          h.renderWithData,
          res,
          "showPosts.ejs",
          { viewerId: req.session.user_id },
          posts,
          2,
          db
        );
      } else {
        res.send("/no data available");
      }
    });
  });

  app.get("/top-posts", (req, res) => {
    const date = req.query.date ? req.query.date : new Date("01 Jan 2021");
    req.session.currentURL = "/top-posts";

    callPromise(Post.getTopLikedPosts(db, date)).then(function (posts) {
      if (posts) {
        User.getCreatorPerPostThenRender(
          h.renderWithData,
          res,
          "showPosts.ejs",
          { viewerId: req.session.user_id },
          posts,
          1,
          db
        );
      } else {
        res.send("/no data available");
      }
    });
  });

  app.post("/feed", (req, res) => {
    if (!h.loggedIn(req.session.user_id)) {
      res.redirect("/");
    }

    const userId = req.session.user_id;
    const dateFilter = new Date(req.body.dateFilter);

    callPromise(Post.getUserFeed(db, userId, dateFilter)).then(function (
      feedPosts
    ) {
      if (feedPosts) {
        User.getCreatorPerPostThenSendJSON(res, feedPosts, 0, [], db);
      } else {
        res.send(false);
      }
    });
  });
}
