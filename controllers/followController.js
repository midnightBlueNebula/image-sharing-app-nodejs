import User from "../models/user.js";
import callPromise from "../callPromise.js";

export default function (app, db) {
  app.post("/follow/:followedId", (req, res) => {
    if (!h.loggedIn(req.session.user_id)) {
      res.redirect("/");
    }

    const followerId = req.session.user_id;
    const followedId = req.params.followedId;

    callPromise(User.followUser(db, followerId, followedId)).then(
      function (result) {
        if (result) {
          callPromise(User.getUserById(db, followedId)).then(
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
      User.unfollowUser(db, followerId, followedId)
    ).then(function (result) {
      if (result) {
        callPromise(User.getUserById(db, followedId)).then(
          function (followedUser) {
            res.json(followedUser);
          }
        );
      } else {
        res.send(false);
      }
    });
  });
}
