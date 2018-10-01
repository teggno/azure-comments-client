import "whatwg-fetch";

document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("commentContainer");
  if (container) {
    container.appendChild(getCommentUI("post2"));
    container.appendChild(getCommentListUIWithButton("post2"));
  }
  // commentsForPost("post2").then(comments => {
  //   const container = document.getElementById("commentContainer");
  //   if (container) container.appendChild(getCommentTestUI(comments));
  // });
});

function getCommentListUIWithButton(postUrl: string) {
  var div = document.createElement("div");
  var showCommentsButton = document.createElement("button");
  showCommentsButton.innerHTML = "Show comments";

  div.appendChild(showCommentsButton);

  var isListVisible: boolean | null = null;
  var list: HTMLDivElement;
  showCommentsButton.addEventListener("click", () => {
    if (isListVisible === null) {
      // list has never ever been displayed
      list = document.createElement("div");
      var refreshButton = document.createElement("button");
      refreshButton.innerHTML = "Refresh comments";
      var ul: HTMLElement;
      refreshButton.addEventListener("click", () => {
        commentsForPost(postUrl).then(comments => {
          list.removeChild(ul);
          ul = getCommentListUI(comments);
          list.appendChild(ul);
        });  
      });
      commentsForPost(postUrl).then(comments => {
        list.appendChild(refreshButton);
        ul = getCommentListUI(comments);
        list.appendChild(ul);
        showCommentsButton.innerHTML = "Hide comments";
        isListVisible = true;
        div.appendChild(list);
      });
    } else if (isListVisible === true) {
      list.style.display = "none";
      showCommentsButton.innerHTML = "ShowComments";
      isListVisible = false;
    } else {
      list.style.display = "block";
      showCommentsButton.innerHTML = "Hide comments";
      isListVisible = true;
    }
  });
  return div;
}

function getCommentListUI(comments: Comment[]) {
  var ul = document.createElement("ul");
  comments.forEach(comment => {
    var li = document.createElement("li");
    li.innerHTML = comment.authorName;
    ul.appendChild(li);
  });
  return ul;
}

function getCommentUI(postUrl: string) {
  var div = document.createElement("div");
  var leaveACommentButton = document.createElement("button");
  leaveACommentButton.innerHTML = "Leave a comment";

  div.appendChild(leaveACommentButton);

  var isFormVisible: boolean | null = null;
  var form: HTMLFormElement;
  var textArea: HTMLTextAreaElement;
  leaveACommentButton.addEventListener("click", () => {
    if (isFormVisible === null) {
      // form has never ever been displayed
      form = document.createElement("form");
      form.addEventListener("submit", e => e.preventDefault());

      var authorNameTextBox = document.createElement("input");
      var authorNameLabel = document.createElement("label");
      authorNameLabel.appendChild(document.createTextNode("Your name"));
      authorNameLabel.appendChild(authorNameTextBox);

      textArea = document.createElement("textarea");
      var textAreaLabel = document.createElement("label");
      textAreaLabel.appendChild(document.createTextNode("Comment"));
      textAreaLabel.appendChild(textArea);

      var sendButton = document.createElement("button");
      sendButton.innerHTML = "Send";
      sendButton.addEventListener("click", () => {
        var comment = {
          text: textArea.value,
          authorName: authorNameTextBox.value,
          postUrl: postUrl,
          captchaToken: ""
        };
        if (!validateComment(comment)) {
          return;
        }
        (<any>grecaptcha)
          .execute("6Lc6rXIUAAAAAN16xUNrM3ONA6Gva8hvLku7LEfx", {
            action: "newComment"
          })
          .then(function(token: string) {
            comment.captchaToken = token;
            return saveComment(comment).then(() => {
              grecaptcha.reset();
              textArea.value = "";
              authorNameTextBox.value = "";
            });
          });
      });

      form.appendChild(textAreaLabel);
      form.appendChild(authorNameLabel);
      form.appendChild(sendButton);

      div.appendChild(form);
      textArea.focus();

      leaveACommentButton.innerHTML = "Hide comment form";
      isFormVisible = true;
    } else if (isFormVisible === true) {
      form.style.display = "none";
      leaveACommentButton.innerHTML = "Leave a comment";
      isFormVisible = false;
    } else {
      form.style.display = "block";
      leaveACommentButton.innerHTML = "Hide comment form";
      isFormVisible = true;
      textArea.focus();
    }
  });
  return div;
}

function getCommentTestUI(comments: Comment[]) {
  var ul = document.createElement("ul");
  comments.forEach(comment => {
    var li = document.createElement("li");
    li.innerHTML = comment.authorName;
    ul.appendChild(li);
  });
  return ul;
}

function validateComment(comment: CommentBase) {
  return comment.authorName !== "" && comment.text != "";
}

function saveComment(comment: NewComment) {
  var url = getSettings().newCommentUrl();
  var request = new Request(url, {
    method: "POST",
    body: JSON.stringify(comment),
    headers: {
      "Content-Type": "application/json"
    }
  });

  return fetch(request);
}

function commentsForPost(postUrl: string) {
  var url = getSettings().getCommentsUrl(postUrl);
  return fetch(url)
    .then(response => response.json())
    .then(json => <Comment[]>json);
}

function getSettings() {
  //var azureUrl = "https://adw1blogcomments.azurewebsites.net/api";
  var azureUrl = "http://localhost:7071/api";
  return {
    getCommentsUrl: (postUrl: string) =>
      `${azureUrl}/GetComments?postUrl=${encodeURIComponent(postUrl)}`,
    newCommentUrl: () => `${azureUrl}/NewComment`
  };
}

interface CommentBase {
  authorName: string;
  postUrl: string;
  text: string;
}

interface Comment extends CommentBase {
  rowKey: string;
}

interface NewComment extends CommentBase {
  captchaToken: string;
}
