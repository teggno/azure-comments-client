import "whatwg-fetch";
import getSettings from "./settings";
import getForm from "./commentForm";
import { getCommentList, ThreadedComment, ReplyCallback } from "./commentList";
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
      list.replyClicked((rowKey, replyButton, placeholderForForm) => {
        var formComponent = getForm();
        replyButton.setAttribute("disabled", "disabled");
        formComponent.sendClicked(() => {
          var input = formComponent.getEnteredData();
          if (!validateComment(input)) {
            return;
          }
          var comment = createComment(input, postUrl);
          comment.parentRowKey = rowKey;
          captchaAndSave(comment).then(() => {
            placeholderForForm.removeChild(formComponent.form);
            replyButton.removeAttribute("disabled");
          });
        });
        formComponent.cancelClicked(() => {
          placeholderForForm.removeChild(formComponent.form);
          replyButton.removeAttribute("disabled");
        });
        placeholderForForm.appendChild(formComponent.form);
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

  var formComponent: CommentForm;

  leaveACommentButton.addEventListener("click", () => {
    if (!formComponent) {
      // form has never ever been displayed
      formComponent = getForm();
      formComponent.sendClicked(() => {
        var input = formComponent.getEnteredData();
        if (!validateComment(input)) {
          return;
        }
        var comment = createComment(input, postUrl);
        captchaAndSave(comment).then(() => {
          formComponent.reset();
          formComponent.hide();
          leaveACommentButton.removeAttribute("disabled");
        });
      });
      formComponent.cancelClicked(() => {
        formComponent.hide();
        leaveACommentButton.removeAttribute("disabled");
      });
      div.appendChild(formComponent.form);
    } else {
      formComponent.show();
    }
    formComponent.focusTextarea();
    leaveACommentButton.setAttribute("disabled", "disabled");
  });
  return div;
}

function captchaAndSave(comment: NewComment) {
  return (<any>grecaptcha)
    .execute(getSettings().recaptchaSiteKey(), {
      action: "newComment"
    })
    .then((token: string) => {
      comment.captchaToken = token;
      return saveComment(comment);
    });
}

function createComment(input: EnteredComment, postUrl: string): NewComment {
  return {
    text: input.text,
    authorName: input.authorName,
    email: input.email,
    postUrl: postUrl,
    createdTimestampUtc: new Date(),
    captchaToken: ""
  };
}

function validateComment(comment: EnteredComment) {
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
    .then(json => <CommentFromApi[]>json)
    .then(comments =>
      comments.sort(
        (a, b) =>
          // sort descending (newest first)
          new Date(b.createdTimestampUtc).valueOf() - new Date(a.createdTimestampUtc).valueOf()
      )
    );
}

function putCommentsIntoTree(comments: CommentFromApi[]) {
  return getThreadTree(
    c => c.rowKey,
    c => c.parentRowKey,
    () => <ThreadedComment>(<any>{ children: [] }),
    (src, tgt) => {
      tgt.authorName = src.authorName;
      tgt.email = src.email;
      tgt.text = src.text;
      tgt.rowKey = src.rowKey;
      tgt.createdTimestampUtc = new Date(src.createdTimestampUtc);
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
  email: string;
  text: string;
  createdTimestampUtc: string;
}

interface NewComment {
  authorName: string;
  postUrl: string;
  text: string;
  captchaToken: string;
  createdTimestampUtc: Date;
  parentRowKey?: string;
  email?: string;
}

interface CommentForm {
  show: VoidFn;
  hide: VoidFn;
  reset: VoidFn;
  focusTextarea: VoidFn;
  form: HTMLElement;
  sendClicked: (callback: VoidFn) => void;
  cancelClicked: (callback: VoidFn) => void;
  getEnteredData: () => EnteredComment;
}

interface EnteredComment {
  text: string;
  authorName: string;
  email: string;
}

interface CommentList {
  list: HTMLElement;
  show: VoidFn;
  hide: VoidFn;
  refreshClicked(callback: VoidFn): void;
  replyClicked(callback: ReplyCallback): void;
  displayComments(comments: ThreadedComment[]): void;
}
