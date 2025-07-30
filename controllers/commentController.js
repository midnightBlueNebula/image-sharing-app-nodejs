import callPromise from "../callPromise.js";
import h from "../helper.js";
import User from "../models/user.js";
import Comment from "../models/comment.js";

export default function (app, db) {
  app.post("/comment/:parentType/:parentId", (req, res) => {
    if (!h.loggedIn(req.session.user_id)) {
      res.redirect("/");
    }

    const content = h.cleanseString(req.body.content.trim());
    const parentType = req.params.parentType;
    const parentId = req.params.parentId;
    const userId = req.session.user_id;

    callPromise(
      Comment.createComment(db, content, parentType, parentId, userId)
    ).then(function (comment) {
      if (comment) {
        callPromise(User.getUserById(db, userId.toString())).then(function (
          user
        ) {
          if (user) {
            res.json({ comment: comment, user: user });
          } else {
            res.send(false);
          }
        });
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

    callPromise(User.isAdmin(db, userId)).then(function (admin) {
      if (admin) {
        callPromise(Comment.deleteComment(db, parentType, parentId, commentId))
          .then(function (result) {
            res.json(true);
          })
          .catch(function (error) {
            console.log(error.message);
            res.json(false);
          });
      } else {
        callPromise(Comment.isCommentor(db, commentId, userId)).then(function (
          commentor
        ) {
          if (commentor) {
            callPromise(
              Comment.deleteComment(db, parentType, parentId, commentId)
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
      callPromise(Comment.getCommentById(db, parentId)).then(function (
        parentComment
      ) {
        callPromise(Comment.getCommentsOfParent(db, parentId)).then(function (
          comments
        ) {
          comments.unshift(parentComment);
          User.getUserPerCommentThenSend(res, viewerId, comments, 0, [], db);
        });
      });
    } else {
      callPromise(Comment.getCommentsOfParent(db, parentId)).then(function (
        comments
      ) {
        User.getUserPerCommentThenSend(res, viewerId, comments, 0, [], db);
      });
    }
  });
}
