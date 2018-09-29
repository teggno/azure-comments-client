import "whatwg-fetch";

document.addEventListener("DOMContentLoaded", function(){
    commentsForPost("post2")
        .then(displayComments);
});

function displayComments(comments){
    var ul = document.createElement("ul");
    var lis = comments.forEach(function(comment){
        var li = document.createElement("li");
        li.innerHTML = comment.authorName;
        ul.appendChild(li);
    });
    document.getElementById("commentContainer").appendChild(ul);
}

function commentsForPost(postUrl) {
  var url = getSettings().getCommentsUrl(postUrl);
  return fetch(url)
    .then(function(response) {
      return response.json();
    })
    .then(function(json) {
      console.log("parsed json", json);
      return json;
    })
    .catch(function(ex) {
      console.log("parsing failed", ex);
    });
}

function getSettings() {
  var azureUrl = "https://adw1blogcomments.azurewebsites.net/api";
  return {
    getCommentsUrl: function(postUrl) {
      return azureUrl + "/GetComments?postUrl=" + encodeURIComponent(postUrl);
    }
  };
}
