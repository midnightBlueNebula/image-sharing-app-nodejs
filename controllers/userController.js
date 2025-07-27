import bcrypt from "bcrypt";
import pkg from "mongodb";
const { ObjectId } = pkg;
import h from "../helper.js";
import callPromise from "../callPromise.js";

const saltRounds = 12;

export default function (app, db) {
  app
    .route("/register")
    .get((req, res) => {
      if (h.loggedIn(req.session.user_id)) {
        res.redirect("/profile");
      }
      res.sendFile(`${__dirname}/views/register.html`);
    })
    .post((req, res) => {
      if (h.loggedIn(req.session.user_id)) {
        res.redirect("/profile");
      }

      const email = h.cleanseString(req.body.email);
      const name = h.cleanseString(req.body.name);
      const password = req.body.password;

      callPromise(getUserByEmail(db, "image-app-users", email)).then(function (
        result
      ) {
        if (result) {
          res.send("email has already been taken");
          return;
        } else {
          bcrypt.genSalt(saltRounds, function (fail, salt) {
            bcrypt.hash(password, salt, function (fail, hash) {
              if (fail) {
                res.send(fail.message);
                return;
              } else {
                const date = new Date();
                db.collection("image-app-users").insertOne(
                  {
                    _id: new ObjectId(),
                    email: email,
                    name: name,
                    password_hash: hash,
                    about: "",
                    admin: false,
                    profileImageURL: "",
                    followedIds: [],
                    followerIds: [],
                    createdAt: date,
                    updatedAt: date,
                  },
                  (insert_error, new_el) => {
                    if (insert_error) {
                      res.send(insert_error.message);
                    } else {
                      req.session.user_id = new_el.ops[0]._id;
                      req.session.user_name = new_el.ops[0].name;
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
    if (h.loggedIn(req.session.user_id)) {
      res.redirect("/profile");
    }
    const email = h.cleanseString(req.body.email);
    const password = req.body.password;

    callPromise(getUserByEmail(db, "image-app-users", email)).then(function (
      result
    ) {
      if (!result) {
        res.send("Email is not registered.");
        return;
      }
      const hash = result.password_hash;
      bcrypt.compare(password, hash, function (fail, outcome) {
        if (fail) {
          res.send(fail.message);
          return;
        } else {
          if (outcome) {
            req.session.user_id = result._id;
            req.session.user_name = result.name;
            h.back(req, res);
          } else {
            res.send("Wrong password.");
          }
        }
      });
    });
  });

  app.get("/logout", (req, res) => {
    req.session.user_id = undefined;
    h.back(req, res);
  });

  app.get("/profile", (req, res) => {
    const id = req.session.user_id;
    if (!h.loggedIn(id)) {
      res.redirect("/");
    }

    req.session.currentURL = "/profile";

    callPromise(getUserById(db, "image-app-users", id)).then(function (user) {
      callPromise(
        getPostsOfUser(db, "image-app-posts", user._id.toString())
      ).then(function (posts) {
        callPromise(
          getLikedPostsByUser(db, "image-app-posts", user._id.toString())
        ).then(function (likedPosts) {
          getCreatorPerPostThenRender(
            h.renderWithData,
            res,
            "profile.ejs",
            { user: user, posts: posts, viewerId: req.session.user_id },
            likedPosts,
            1
          );
        });
      });
    });
  });

  app.post("/addProfileImage", (req, res) => {
    if (!h.loggedIn(req.session.user_id)) {
      res.redirect("/");
    }

    const imageURL = h.cleanseString(req.body.imageURL);

    db.collection("image-app-users").updateOne(
      { _id: ObjectId(req.session.user_id) },
      { $set: { profileImageURL: imageURL } }
    );

    res.redirect("/profile");
  });

  app.post("/changeProfileImage", (req, res) => {
    if (!h.loggedIn(req.session.user_id)) {
      res.redirect("/");
    }

    db.collection("image-app-users").updateOne(
      { _id: ObjectId(req.session.user_id) },
      { $set: { profileImageURL: "" } }
    );

    res.redirect("/profile");
  });

  app.post("/addProfileDescription", (req, res) => {
    if (!h.loggedIn(req.session.user_id)) {
      res.redirect("/");
    }

    const about = h.cleanseString(req.body.about);

    db.collection("image-app-users").updateOne(
      { _id: ObjectId(req.session.user_id) },
      { $set: { about: about } }
    );

    res.redirect("/profile");
  });

  app.get("/changeProfileDescription", (req, res) => {
    if (!h.loggedIn(req.session.user_id)) {
      res.redirect("/");
    }

    db.collection("image-app-users").updateOne(
      { _id: ObjectId(req.session.user_id) },
      { $set: { about: "" } }
    );

    res.redirect("/profile");
  });
}
