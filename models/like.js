import pkg from "mongodb";
const { ObjectId } = pkg;

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

const Like = {
    likeContent,
    regretLikeContent
};

export default Like;
