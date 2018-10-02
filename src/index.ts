import "whatwg-fetch";
import escapeHtml from "./escape";
import getSettings from "./settings";
import getForm from "./commentForm";
import getThreadTree from "./tree";

document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("commentContainer");
  if (container) {
    container.appendChild(getCommentUI("post2"));
    container.appendChild(getCommentListUIWithButton("post2"));
  }
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
    li.innerHTML = escapeHtml(comment.authorName);
    ul.appendChild(li);
  });
  return ul;
}


type StringOrNumber = string|number;

function getCommentListItemUI() {}

function getCommentUI(postUrl: string) {
  var div = document.createElement("div");
  var leaveACommentButton = document.createElement("button");
  leaveACommentButton.innerHTML = "Leave a comment";

  div.appendChild(leaveACommentButton);

  var isFormVisible: boolean | null = null;
  var formComponent: FormComponent;

  leaveACommentButton.addEventListener("click", () => {
    if (isFormVisible === null) {
      // form has never ever been displayed
      formComponent = getForm();
      formComponent.sendClicked(() => {
        var input = formComponent.getComment();
        var comment = {
          text: input.text,
          authorName: input.authorName,
          postUrl: postUrl,
          captchaToken: ""
        };
        if (!validateComment(comment)) {
          return;
        }

        (<any>grecaptcha)
          .execute(getSettings().recaptchaSiteKey(), {
            action: "newComment"
          })
          .then((token: string) => {
            comment.captchaToken = token;
            return saveComment(comment).then(() => {
              formComponent.reset();
            });
          });
      });
      div.appendChild(formComponent.form);
      formComponent.focusTextarea();
      leaveACommentButton.innerHTML = "Hide comment form";
      isFormVisible = true;
    } else if (isFormVisible === true) {
      formComponent.hide();
      leaveACommentButton.innerHTML = "Leave a comment";
      isFormVisible = false;
    } else {
      formComponent.show();
      formComponent.focusTextarea();
      leaveACommentButton.innerHTML = "Hide comment form";
      isFormVisible = true;
    }
  });
  return div;
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

interface FormComponent {
  show: VoidFn;
  hide: VoidFn;
  reset: VoidFn;
  focusTextarea: VoidFn;
  form: HTMLElement;
  sendClicked: (callback: VoidFn) => void;
  getComment: () => { text: string; authorName: string };
}

interface VoidFn {
  (): void;
}
