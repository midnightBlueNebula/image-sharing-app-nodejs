import session from "express-session";
import h from "./helper.js";
import userController from "./controllers/userController.js";
import postController from "./controllers/postController.js";
import commentController from "./controllers/commentController.js";
import likeController from "./controllers/likeController.js";
import followController from "./controllers/followController.js";
const __dirname = process.cwd();

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

  likeController(app, db);

  commentController(app, db);

  followController(app, db);
}
