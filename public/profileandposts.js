$(".like-post").on("click", function (event) {
  if (!$(this).attr("class").includes("liked-post")) {
    $(this).toggleClass("liked-post");

    const url = `https://image-sharing-with-mongodb.glitch.me/like-post/${event.target.id.replace("like-post-","")}`;

    $.post(url)
      .done(function (data, status) {
        if (data) {
          const text = `${data.value.likedUserIds.length} 
                          ${
                            data.value.likedUserIds.length > 1
                              ? "likes"
                              : "like"
                          }`;

          event.target.innerText = text;
        } else {
          $("#show-post-div").append("div id='alert-box'>failed to like</div>");
          $("#alert-box").css({
            border: "1px solid red",
            color: "red",
            height: "25px",
            width: "100px",
            margin: "auto",
          });

          setTimeout(function () {
            $("#alert-box").remove();
          }, 2000);
        }
      })
      .fail(function (xhr, status, error) {
        console.log("fail");
        console.log(
          "Result: " +
            status +
            " " +
            error +
            " " +
            xhr.status +
            " " +
            xhr.statusText
        );
      });
  } else {
    $(this).toggleClass("liked-post");

    const url = `https://image-sharing-with-mongodb.glitch.me/regret-like-post/${event.target.id.replace(
      "like-post-",
      ""
    )}`;

    $.post(url)
      .done(function (data, status) {
        if (data) {
          const text = `${data.value.likedUserIds.length} 
                          ${
                            data.value.likedUserIds.length > 1
                              ? "likes"
                              : "like"
                          }`;

          event.target.innerText = text;
        } else {
          $("#show-post-div").append(
            "div id='alert-box'>failed to retract like</div>"
          );
          $("#alert-box").css({
            border: "1px solid red",
            color: "red",
            height: "25px",
            width: "100px",
            margin: "auto",
          });

          setTimeout(function () {
            $("#alert-box").remove();
          }, 2000);
        }
      })
      .fail(function (xhr, status, error) {
        console.log("fail");
        console.log(
          "Result: " +
            status +
            " " +
            error +
            " " +
            xhr.status +
            " " +
            xhr.statusText
        );
      });
  }
});

var mouseBack = false;

$(".user-name").on("mouseover", function (event) {
  mouseBack = true;
  const url = `https://image-sharing-with-mongodb.glitch.me/getUserJSON/${$(
    this
  ).attr("creatorId")}`;
  $.get(url)
    .done(function (data, status) {
      if (data) {
        const creatorId = data.creatorId;
        const name = data.name;
        const about = data.about;
        const image = data.image;
        const followerIds = data.followerIds;
        const viewerId = data.viewerId;

        $("#creator-profile").css({
          top: `${event.clientY - 100}px`,
          left: `${event.clientX}px`,
        });
        $("#creator-img").attr("src", data.image);
        $("#creator-about").text(data.about);

        if (!viewerId) {
        } else if (creatorId != viewerId) {
          if (followerIds.includes(viewerId)) {
            $("#follow-button").addClass("following");
            $("#follow-button").text("Unfollow");
          } else {
            $("#follow-button").removeClass("following");
            $("#follow-button").text("Follow");
          }
          $("#follow-button").css("display", "block");
          $("#follow-button").attr("creatorId", creatorId);
        } else {
          $("#follow-button").css("display", "none");
          $("#follow-button").attr("creatorId", creatorId);
        }

        const followerCount =
          data.followerIds.length > 1
            ? `${data.followerIds.length} followers`
            : `${data.followerIds.length} follower`;

        $("#follower-count").text(followerCount);
      } else {
        $("#show-post-div").append("div id='alert-box'>failed to follow</div>");
        $("#alert-box").css({
          border: "1px solid red",
          color: "red",
          height: "25px",
          width: "100px",
          margin: "auto",
        });

        setTimeout(function () {
          $("#alert-box").remove();
        }, 2000);
      }
    })
    .fail(function (xhr, status, error) {
      console.log("fail");
      console.log(
        "Result: " +
          status +
          " " +
          error +
          " " +
          xhr.status +
          " " +
          xhr.statusText
      );
    });
});

$(".user-name").on("mouseleave", function (event) {
  mouseBack = false;

  setTimeout(function () {
    if (!mouseBack) {
      $("#creator-profile").css({ top: "-1000px", left: "-1000px" });
      $("#creator-img").attr("src", "");
      $("#creator-about").text("");
      $("#follow-button").css("display", "none");
      $("#follow-button").attr("creatorId", "");
    }
  }, 500);
});

$("#follow-button").on("click", function (event) {
  const creatorId = $(this).attr("creatorId");

  if ($(this).attr("class").includes("following") == false) {
    $(this).toggleClass("following");

    const url = `https://image-sharing-with-mongodb.glitch.me/follow/${creatorId}`;

    $.post(url)
      .done(function (data, status) {
        if (data) {
          event.target.innerText = "Unfollow";

          const followerCount =
            data.followerIds.length > 1
              ? `${data.followerIds.length} followers`
              : `${data.followerIds.length} follower`;

          $("#follower-count").text(followerCount);
        } else {
          $("#show-post-div").append(
            "div id='alert-box'>failed to follow</div>"
          );
          $("#alert-box").css({
            border: "1px solid red",
            color: "red",
            height: "25px",
            width: "100px",
            margin: "auto",
          });

          setTimeout(function () {
            $("#alert-box").remove();
          }, 2000);
        }
      })
      .fail(function (xhr, status, error) {
        console.log("fail");
        console.log(
          "Result: " +
            status +
            " " +
            error +
            " " +
            xhr.status +
            " " +
            xhr.statusText
        );
      });
  } else {
    $(this).toggleClass("following");

    const url = `https://image-sharing-with-mongodb.glitch.me/unfollow/${creatorId}`;

    $.post(url)
      .done(function (data, status) {
        if (data) {
          event.target.innerText = "Follow";

          const followerCount =
            data.followerIds.length > 1
              ? `${data.followerIds.length} followers`
              : `${data.followerIds.length} follower`;

          $("#follower-count").text(followerCount);
        } else {
          $("#show-post-div").append(
            "div id='alert-box'>failed to unfollow</div>"
          );
          $("#alert-box").css({
            border: "1px solid red",
            color: "red",
            height: "25px",
            width: "100px",
            margin: "auto",
          });

          setTimeout(function () {
            $("#alert-box").remove();
          }, 2000);
        }
      })
      .fail(function (xhr, status, error) {
        console.log("fail");
        console.log(
          "Result: " +
            status +
            " " +
            error +
            " " +
            xhr.status +
            " " +
            xhr.statusText
        );
      });
  }
});

$(".comments-count").on("click", function (event) {
  $("#comments-div-of-post").css({
    top: "0px",
    left: $(window).width() / 2 - 500 / 2 + "px",
  });

  const parentId = $(this).attr("parentId");
  const parentType = $(this).attr("parentType");
  const imageSrc = $(`#post-image-${parentId}`).attr("src");
  const title = $(`#post-title-${parentId}`).text();
  const context = $(`#post-context-${parentId}`).text();

  $("#post-image-in-comments-div").attr("src", imageSrc);
  $("#post-title-in-comments-div").text(title);
  $("#post-context-in-comments-div").text(context);

  if ($("#send-comment")) {
    $("#send-comment").attr("parentType", parentType);
    $("#send-comment").attr("parentId", parentId);
  }

  const url = `https://image-sharing-with-mongodb.glitch.me/get-comments/${parentType}/${parentId}`;

  $.get(url)
    .done(function (data) {
      if (data && data.data) {
        const commentsAndUsers = data.data;

        commentsAndUsers.forEach((commentAndUser) => {
          const user = commentAndUser.user;
          const comment = commentAndUser.comment;
          const commentDate = new Date(comment.createdAt).toLocaleDateString(
            "en-EN",
            {
              day: "2-digit",
              month: "short",
              year: "numeric",
              hour12: false,
              hour: "numeric",
              minute: "numeric",
              second: "numeric",
            }
          );

          const commentDiv = `<div class="comment-div in-comments-div">
                                  
                                  <div class="user-name-in-comments-div in-comments-div">
                                    <img src="${user.profileImageURL}" 
                                         class="user-image-in-comment in-comments-div">
                                    <p class="user-name-in-comment in-comments-div">${user.name}</p>
                                  </div>
                                  
                                  <div class="comment-in-comments-div in-comments-div">
                                    <p class="comment-content in-comments-div">${comment.content}</p>
                                  </div>
                                  <div class="comment-count-likes-date in-comments-div">
                                    <a class="card-link comments-count"
                                       parentId="${comment.userId}" 
                                       parentType="comment">
                                         ${comment.commentIds.length}
                                    </a>
                                    <a class="card-link comment-likes in-comments-div">${comment.likedUserIds.length}</a>
                                    <br />
                                    <a class="card-link comment-date in-comments-div">${commentDate}</a>
                                  </div>
                                
                                </div>`;

          $("#show-comments").append(commentDiv);
        });
      }
    })
    .fail(function (xhr, status, error) {
      console.log("fail");
      console.log(
        "Result: " +
          status +
          " " +
          error +
          " " +
          xhr.status +
          " " +
          xhr.statusText
      );
    });
});

$("#send-comment").on("click", function (event) {
  event.preventDefault();

  const comment = $("#comment-input").val();
  const parentType = $(this).attr("parentType");
  const parentId = $(this).attr("parentId");

  const url = `https://image-sharing-with-mongodb.glitch.me/comment/${parentType}/${parentId}`;
  $.post(url, { content: comment })
    .done(function (data) {
      if (data) {
        console.log(data);
        const user = data.user;
        const comment = data.comment;
        const commentDate = new Date(comment.createdAt).toLocaleDateString(
          "en-EN",
          {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour12: false,
            hour: "numeric",
            minute: "numeric",
            second: "numeric",
          }
        );

        const commentDiv = `<div class="comment-div in-comments-div">
                                  
                                  <div class="user-name-in-comments-div in-comments-div">
                                    <img src="${user.profileImageURL}" 
                                         class="user-image-in-comment in-comments-div">
                                    <p class="user-name-in-comment in-comments-div">${user.name}</p>
                                  </div>
                                  
                                  <div class="comment-in-comments-div in-comments-div">
                                    <p class="comment-content in-comments-div">${comment.content}</p>
                                  </div>
                                  <div class="comment-count-likes-date in-comments-div">
                                    <a class="card-link comments-count"
                                       parentId="${comment.userId}" 
                                       parentType="comment">
                                         ${comment.commentIds.length}
                                    </a>
                                    <a class="card-link comment-likes in-comments-div">${comment.likedUserIds.length}</a>
                                    <br />
                                    <a class="card-link comment-date in-comments-div">${commentDate}</a>
                                  </div>
                                
                              </div>`;

        $("#show-comments").prepend(commentDiv);
      }
    })
    .fail(function (xhr, status, error) {
      console.log("fail");
      console.log(
        "Result: " +
          status +
          " " +
          error +
          " " +
          xhr.status +
          " " +
          xhr.statusText
      );
    });
});

$(document).on("click", function (event) {
  if (
    event.target.className.includes("comments-div") == false &&
    event.target.className.includes("in-comments-div") == false &&
    event.target.className.includes("comments-count") == false
  ) {
    $("#comments-div-of-post").css({ top: "-10000px", left: "-100000px" });

    $("#post-image-in-comments-div").attr("src", "");
    $("#post-title-in-comments-div").text("");
    $("#post-context-in-comments-div").text("");
    $("#show-comments").empty();
  }
});

document.addEventListener("scroll", function (event) {}, { passive: true });
