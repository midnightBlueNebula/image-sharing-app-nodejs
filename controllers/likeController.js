import callPromise from "../callPromise.js";
import h from "../helper.js";
import Like from "../models/like.js";

export default function (app, db) {
  app.post("/like/:content/:contentId", (req, res) => {
    if (!h.loggedIn(req.session.user_id)) {
      res.redirect("/");
    }

    const content = req.params.content;
    const contentId = req.params.contentId;
    const userId = req.session.user_id;

    callPromise(Like.likeContent(db, `image-app-${content}s`, contentId, userId))
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
      Like.regretLikeContent(db, `image-app-${content}s`, contentId, userId)
    )
      .then(function (result) {
        res.json(result);
      })
      .catch(function (error) {
        res.json(error.message);
      });
  });
}
