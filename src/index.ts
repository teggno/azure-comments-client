import "whatwg-fetch";
import getSettings from "./settings";
import getForm from "./commentForm";
import { getCommentList, ThreadedComment } from "./commentList";
import { VoidFn } from "./common";
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
  var list: CommentList;

  showCommentsButton.addEventListener("click", () => {
    if (isListVisible === null) {
      // list has never ever been displayed
      list = getCommentList();

      list.refreshClicked(() =>
        commentsForPost(postUrl)
          .then(putCommentsIntoTree)
          .then(list.displayComments)
      );
      list.replyClicked(rowKey => {
        
      });

      commentsForPost(postUrl)
        .then(putCommentsIntoTree)
        .then(list.displayComments)
        .then(() => {
          div.appendChild(list.list);
          showCommentsButton.innerHTML = "Hide comments";
          isListVisible = true;
        });
    } else if (isListVisible === true) {
      list.hide();
      showCommentsButton.innerHTML = "ShowComments";
      isListVisible = false;
    } else {
      list.show();
      showCommentsButton.innerHTML = "Hide comments";
      isListVisible = true;
    }
  });
  return div;
}

function getCommentUI(postUrl: string) {
  var div = document.createElement("div");
  var leaveACommentButton = document.createElement("button");
  leaveACommentButton.innerHTML = "Leave a comment";

  div.appendChild(leaveACommentButton);

  var isFormVisible: boolean | null = null;
  var formComponent: CommentForm;

  leaveACommentButton.addEventListener("click", () => {
    if (isFormVisible === null) {
      // form has never ever been displayed
      formComponent = getForm();
      formComponent.sendClicked(() => {
        var input = formComponent.getEnteredData();
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
    .then(json => <CommentFromApi[]>json);
}

function putCommentsIntoTree(comments: CommentFromApi[]) {
  return getThreadTree(
    c => c.rowKey,
    c => c.parentRowKey,
    () => <ThreadedComment>{},
    (src, tgt) => {
      tgt.authorName = src.authorName;
      tgt.authorEmail = src.authorEmail;
      tgt.text = src.text;
      tgt.rowKey = src.rowKey;
      return tgt;
    },
    comments
  );
}

interface CommentFromApi {
  authorName: string;
  postUrl: string;
  rowKey: string;
  parentRowKey: string;
  authorEmail: string;
  text: string;
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

interface CommentForm {
  show: VoidFn;
  hide: VoidFn;
  reset: VoidFn;
  focusTextarea: VoidFn;
  form: HTMLElement;
  sendClicked: (callback: VoidFn) => void;
  getEnteredData: () => { text: string; authorName: string };
}

interface CommentList {
  list: HTMLElement;
  show: VoidFn;
  hide: VoidFn;
  refreshClicked(callback: VoidFn): void;
  replyClicked(callback: (rowKey:string) => void): void;
  displayComments(comments: ThreadedComment[]): void;
}
