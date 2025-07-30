import callPromise from "../callPromise.js";
import pkg from "mongodb";
const { ObjectId } = pkg;

//call createComment as shown beneath
/* 
    callPromise(createComment(db, content, parentType, parentId, userId)).then(function(result) {
      use received data here...
    });
  */

const createComment = (db, content, parentType, parentId, userId) => {
  return new Promise((resolve, reject) => {
    const date = new Date();

    db.collection("image-app-comments").insertOne(
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
    callPromise(deleteComment(db, parentType, parentId, commentId)).then(function(result) {
      use received data here...
    });
  */

const deleteComment = (db, parentType, parentId, commentId) => {
  return new Promise((resolve, reject) => {
    db.collection("image-app-comments").deleteOne(
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
                  deleteCommentsOfParent(db, commentId)
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
    callPromise(deleteCommentsOfParent(db, parentId)).then(function(result) {
      use received data here...
    });
  */

const deleteCommentsOfParent = (db, parentId) => {
  return new Promise((resolve, reject) => {
    getAllSubCommentsAndDelete(resolve, reject, db, parentId);
  });
};

//call getCommentById as shown beneath
/* 
    callPromise(getCommentById(db, commentId)).then(function(result) {
      use received data here...
    });
  */

const getCommentById = (db, commentId) => {
  return new Promise((resolve, reject) => {
    db.collection("image-app-comments").findOne(
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

//call isCommentor
/* 
    callPromise(isCommentor(db, commentId, userId)).then(function(result) {
      use received data here...
    });
  */

const isCommentor = (db, commentId, userId) => {
  return new Promise((resolve, reject) => {
    callPromise(getCommentById(db, "image-app-comments", commentId)).then(function (
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
    callPromise(getCommentsByIds(db, commentIds)).then(function(result) {
      use received data here...
    });
  */

const getCommentsByIds = (db, commentIds) => {
  return new Promise((resolve, reject) => {
    db.collection("image-app-comments")
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
    callPromise(getCommentsOfParent(db, parentId)).then(function(result) {
      use received data here...
    });
  */

const getCommentsOfParent = (db, parentId) => {
  return new Promise((resolve, reject) => {
    db.collection("image-app-comments")
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

const getCommentsOfParentForDel = (db, parentId) => {
  return new Promise((resolve, reject) => {
    db.collection("image-app-comments")
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
      getCommentsOfParentForDel(db, data[index])
    ).then(function (result) {
      if (result) {
        data = data.concat(result);
      }
      getAllSubCommentsAndDelete(resolve, reject, db, parentId, ++index, data);
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
      getCommentsOfParentForDel(db, data[index])
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
    callPromise(getCommentsOfUser(db, userId)).then(function(result) {
      use received data here...
    });
  */

const getCommentsOfUser = (db, userId) => {
  return new Promise((resolve, reject) => {
    db.collection("image-app-comments")
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

const Comment = {
  createComment,
  deleteComment,
  deleteCommentsOfParent,
  getCommentById,
  getCommentsOfParentForDel,
  isCommentor,
  getCommentsByIds,
  getCommentsOfParent,
  getAllSubCommentsAndDelete,
  getAllSubCommentsJSON,
  getCommentsOfUser,
};

export default Comment;
