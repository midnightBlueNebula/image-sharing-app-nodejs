$(document).on("click", ".like-content", function(event){
      if(!$(this).attr("class").includes("liked-content")){
        $(this).toggleClass("liked-content")
        const content = $(this).attr("contentType")
        const contentId = $(this).attr("contentId")
        
        const url = `https://image-sharing-with-mongodb.glitch.me/like/${content}/${contentId}`
        
        $.post(url).done(function(data, status){
          if(data){
            const text = `${data.value.likedUserIds.length} ${data.value.likedUserIds.length > 1 ? "likes" : "like"}`
            
            event.target.innerText = text
          } else {
            $("#show-post-div").append("div id='alert-box'>failed to like</div>")
            $("#alert-box").css({
              "border": "1px solid red",
              "color": "red",
              "height": "25px",
              "width": "100px",
              "margin": "auto"
            })
            
            setTimeout(function(){
              $("#alert-box").remove()
            }, 2000)
          }
        }).fail(function(xhr, status, error){
          console.log("fail")
          console.log("Result: " + status + " " + error + " " + xhr.status + " " + xhr.statusText)
        })
      } else {
        $(this).toggleClass("liked-content")
        const content = $(this).attr("contentType")
        const contentId = $(this).attr("contentId")
        const url = `https://image-sharing-with-mongodb.glitch.me/regret-like/${content}/${contentId}`
  
        
        $.post(url).done(function(data, status){
          if(data){
            const text = `${data.value.likedUserIds.length} ${data.value.likedUserIds.length > 1 ? "likes" : "like"}`
            
            event.target.innerText = text
          } else {
            $("#show-post-div").append("div id='alert-box'>failed to retract like</div>")
            $("#alert-box").css({
              "border": "1px solid red",
              "color": "red",
              "height": "25px",
              "width": "100px",
              "margin": "auto"
            })
            
            setTimeout(function(){
              $("#alert-box").remove()
            }, 2000)
          }
        }).fail(function(xhr, status, error){
          console.log("fail")
          console.log("Result: " + status + " " + error + " " + xhr.status + " " + xhr.statusText)
        })
      }
      
    })
    
    var mouseBack = false
    
    $(document).on("mouseover", ".user-name", function(event){
      event.stopPropagation()
      mouseBack = true
      const url = `https://image-sharing-with-mongodb.glitch.me/getUserJSON/${$(this).attr("creatorId")}`
      $.get(url).done(function(data, status){
        if(data){
          const creatorId = data.creatorId
          const name = data.name
          const about = data.about
          const image = data.image
          const followerIds = data.followerIds
          const viewerId = data.viewerId
          const rect = event.target.getBoundingClientRect()
          const parentRect = event.target.parentElement.getBoundingClientRect();
          const creatorProfile = document.querySelector("#creator-profile");
          const h = creatorProfile.getBoundingClientRect().height;
          const w = creatorProfile.getBoundingClientRect().width;
          
          $("#creator-profile").css({"top": `${parentRect.top - h}px`, "left": `${parentRect.left+parentRect.width/2-w/2}px`})
          $("#creator-img").attr("src", data.image)
          $("#creator-about").text(data.about)
          
          if(!viewerId){
            
          } else if(creatorId != viewerId){
            if(followerIds.includes(viewerId)){
              $("#follow-button").addClass("following")
              $("#follow-button").text("Unfollow")
            } else {
              $("#follow-button").removeClass("following")
              $("#follow-button").text("Follow")
            }
            $("#follow-button").css("display", "block")
            $("#follow-button").attr("creatorId", creatorId)
          } else {
            $("#follow-button").css("display", "none")
            $("#follow-button").attr("creatorId", creatorId)
          }
          
          const followerCount = data.followerIds.length > 1 ? 
                `${data.followerIds.length} followers` 
                : `${data.followerIds.length} follower`
          
          $("#follower-count").text(followerCount)
          
        } else {
          $("#show-post-div").append("div id='alert-box'>failed to follow</div>")
          $("#alert-box").css({
            "border": "1px solid red",
            "color": "red",
            "height": "25px",
            "width": "100px",
            "margin": "auto"
          })
            
          setTimeout(function(){
            $("#alert-box").remove()
          }, 2000)
        }
      }).fail(function(xhr, status, error){
          console.log("fail")
          console.log("Result: " + status + " " + error + " " + xhr.status + " " + xhr.statusText)
        })
    })
    
    
    $(document).on("mouseleave", ".user-name", function(event){
      mouseBack = false
      
      setTimeout(function(){
        if(!mouseBack){
          $("#creator-profile").css({"top": "-1000px", "left": "-1000px"})
          $("#creator-img").attr("src", "")
          $("#creator-about").text("")
          $("#follow-button").css("display", "none")
          $("#follow-button").attr("creatorId", "")
        }
      }, 500)
    })
    
    $(document).on("click", "#follow-button", function(event){
      const creatorId = $(this).attr("creatorId")
      
      if($(this).attr("class").includes("following") == false){
        $(this).toggleClass("following")
        
        const url = `https://image-sharing-with-mongodb.glitch.me/follow/${creatorId}`
        
        $.post(url).done(function(data, status){
          if(data){
            event.target.innerText = "Unfollow"
            
            const followerCount = data.followerIds.length > 1 ? 
                  `${data.followerIds.length} followers` 
                  : `${data.followerIds.length} follower`
            
            $("#follower-count").text(followerCount)
          } else {
            $("#show-post-div").append("div id='alert-box'>failed to follow</div>")
            $("#alert-box").css({
              "border": "1px solid red",
              "color": "red",
              "height": "25px",
              "width": "100px",
              "margin": "auto"
            })
            
            setTimeout(function(){
              $("#alert-box").remove()
            }, 2000)
          }
        }).fail(function(xhr, status, error){
          console.log("fail")
          console.log("Result: " + status + " " + error + " " + xhr.status + " " + xhr.statusText)
        })
      } else {
        $(this).toggleClass("following")
        
        const url = `https://image-sharing-with-mongodb.glitch.me/unfollow/${creatorId}`
        
        $.post(url).done(function(data, status){
          if(data){
            event.target.innerText = "Follow"
          
            const followerCount = data.followerIds.length > 1 ? 
                  `${data.followerIds.length} followers` 
                  : `${data.followerIds.length} follower`
            
            $("#follower-count").text(followerCount)
          } else {
            $("#show-post-div").append("div id='alert-box'>failed to unfollow</div>")
            $("#alert-box").css({
              "border": "1px solid red",
              "color": "red",
              "height": "25px",
              "width": "100px",
              "margin": "auto"
            })
            
            setTimeout(function(){
              $("#alert-box").remove()
            }, 2000)
          }
        }).fail(function(xhr, status, error){
          console.log("fail")
          console.log("Result: " + status + " " + error + " " + xhr.status + " " + xhr.statusText)
        })
      }
    })
    
    $(document).on("click", ".comments-count", function(event){
      $("#comments-div-of-post").css({"top": "0px", 
                                      "left": $(window).width()/2-500/2+"px"});
      
      const contentId = $(this).attr("contentId");
      const contentType = $(this).attr("contentType")
      
      if(contentType == "post"){
        const imageSrc = $(`#post-image-${contentId}`).attr("src");
        const title = $(`#post-title-${contentId}`).text();
        const context = $(`#post-context-${contentId}`).text();

        $("#post-image-in-comments-div").attr("src", imageSrc);
        $("#post-title-in-comments-div").text(title);
        $("#post-context-in-comments-div").text(context);
      }
      
      if($("#send-comment")){
        $("#send-comment").attr("contentType", contentType);
        $("#send-comment").attr("contentId", contentId);
      }
      
      $("#show-comments").empty();
      
      if(contentType == "comment"){
        $("#show-comments").append(`<div id="back" class="btn btn-primary comments-count in-comments-div" style="width:100%; position:relative; z-index:10000"><--<div>`)
      } else {
        $("#show-comments").append(`<div id="close" class="btn btn-danger" style="position:relative; z-index:10000; width:100%">X</div>`)
      }
      
      const url = `https://image-sharing-with-mongodb.glitch.me/get-comments/${contentType}/${contentId}`
      
      $.get(url).done(function(data){
        if(data && data.data){
          const viewerId = data.viewerId
          const commentsAndUsers = data.data
          
          commentsAndUsers.forEach((commentAndUser, i) => {
            const user = commentAndUser.user;
            const comment = commentAndUser.comment;
            
            if(contentType == "comment" && i == 0){
              $("#back").attr("contentType", comment.parentType)
              $("#back").attr("contentId", comment.parentId)
            }
            
            var contentClass = viewerId && viewerId != comment.userId ? "like-content" : "no-liking-auth"
            
            if(comment.likedUserIds.indexOf(viewerId) != -1){
              contentClass += " liked-content"
            }
             
            
            const commentDate = new Date(comment.createdAt)
                                .toLocaleDateString("en-EN", 
                                {day: "2-digit", month: "short", 
                                year:"numeric", hour12: false, hour: "numeric", 
                                minute: "numeric", second: "numeric"})
                                
            const commentDiv = `<div id="comment-${comment._id}" class="comment-div in-comments-div">
                                  
                                  <div class="user-name user-name-in-comments-div in-comments-div" creatorId="${user._id.toString()}">
                                    <img src="${user.profileImageURL}" 
                                         class="user-image-in-comment in-comments-div">
                                    <p class="user-name-in-comment in-comments-div">${user.name}</p>
                                  </div>
                                  
                                  <div class="comment-in-comments-div in-comments-div">
                                    <p class="comment-content in-comments-div">${comment.content}</p>
                                  </div>
                                  <div class="comment-count-likes-date in-comments-div">
                                    <a class="card-link comment-likes in-comments-div ${contentClass}" contentType="comment" contentId="${comment._id}">${comment.likedUserIds.length > 1 ? comment.likedUserIds.length + " likes" : comment.likedUserIds.length + " like"}</a>
                                    <a class="card-link comments-count"
                                       contentId="${comment._id}"
                                       contentType="comment">${comment.commentIds.length > 1 ? comment.commentIds.length + " comments" : comment.commentIds.length + " comment"}</a>
                                    <a class="card-link comment-date in-comments-div">${commentDate}</a>
                                    ${comment.userId==viewerId ? `<br/ ><a parentType="${comment.parentType}" parentId="${comment.parentId}" commentId="${comment._id}" class="card-link remove-comment in-comments-div">remove</a>` : "" }
                                  </div>
                                
                                </div>`
                                
            $("#show-comments").append(commentDiv)
          })
        }
      }).fail(function(xhr, status, error){
        console.log("fail")
        console.log("Result: " + status + " " + error + " " + xhr.status + " " + xhr.statusText)
      })
    })
    
    $("#send-comment").on("click", function(event){
      event.preventDefault();
  
      const comment = $("#comment-input").val();
      const contentType = $(this).attr("contentType");
      const contentId = $(this).attr("contentId");
      
      const url = `https://image-sharing-with-mongodb.glitch.me/comment/${contentType}/${contentId}`;
      $.post(url, { content: comment }).done(function(data){
        if(data){
          $(`.comments-count[contentId=${contentId}]`).click()
        }
      }).fail(function(xhr, status, error){
        console.log("fail")
        console.log("Result: " + status + " " + error + " " + xhr.status + " " + xhr.statusText)
      })
    })
    
    $(document).on("click", function(event){
    
      if(event.target.className.includes("comments-div") == false && event.target.className.includes("in-comments-div") == false && event.target.className.includes("comments-count") == false && event.target.className.includes("expand-profile") == false){
        $("#comments-div-of-post").css({"top": "-10000px", 
                                      "left": "-100000px"});
        
        $("#post-image-in-comments-div").attr("src", "");
        $("#post-title-in-comments-div").text("");
        $("#post-context-in-comments-div").text("");
        $("#show-comments").empty()
      }
    })
    
    $("#posts-div").on("scroll", function(event){
      if(event.target.scrollTop != 0){
        $(".nav-link").css("color", "white");
        $("#nav-bar").css("background-color", "#007bff");
      } else {
        $(".nav-link").css("color", "#007bff");
        $("#nav-bar").css("background-color", "white");
      }
    })


$(document).on("click", ".remove-post", function(event){
  const postId = $(this).attr("postId");
  const url = `https://image-sharing-with-mongodb.glitch.me/delete-post/${postId}`;
  
  $.get(url).done(function(data){
    if(data){
      $(`#post-card-${postId}`).remove();
    } else {
      alert("failed to delete post.")
    }
  }).fail(function(xhr, status, error){
    console.log("fail");
    console.log("Result: " + status + " " + error + " " + xhr.status + " " + xhr.statusText);
  })
})


$(document).on("click", ".remove-comment", function(event){
  const parentType = $(this).attr("parentType");
  const parentId = $(this).attr("parentId");
  const commentId = $(this).attr("commentId");
  
  const url = `/delete-comment/${parentType}/${parentId}/${commentId}`;
  
  $.get(url).done(function(data){
    if(data){
      $(`#comment-${commentId}`).remove();
    } else {
      alert("failed to delete comment.");
    }
  }).fail(function(xhr, status, error){
    console.log("fail");
    console.log("Result: " + status + " " + error + " " + xhr.status + " " + xhr.statusText);
  })
})