import "whatwg-fetch";

document.addEventListener("DOMContentLoaded", () => {
  commentsForPost("post2").then(comments => {
    const container = document.getElementById("commentContainer");
    if (container) container.appendChild(getCommentUI(comments));
  });
});

function getCommentUI(comments: Comment[]) {
  var ul = document.createElement("ul");
  comments.forEach(comment => {
    var li = document.createElement("li");
    li.innerHTML = comment.authorName;
    ul.appendChild(li);
  });
  return ul;
}

function commentsForPost(postUrl: string) {
  var url = getSettings().getCommentsUrl(postUrl);
  return fetch(url)
    .then(response => response.json())
    .then(json => <Comment[]>json);
}

function getSettings() {
  var azureUrl = "https://adw1blogcomments.azurewebsites.net/api";
  return {
    getCommentsUrl: (postUrl: string) => {
      return azureUrl + "/GetComments?postUrl=" + encodeURIComponent(postUrl);
    }
  };
}

interface Comment {
  rowKey: string;
  authorName: string;
  postUrl: string;
  text: string;
}
