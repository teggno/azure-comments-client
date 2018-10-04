import escapeHtml from "./escape";
import { VoidFn } from "./common";
import createElement from "./htmlBuilder";
import "./commentList.css";

export function getCommentList() {
  var refreshCallback: VoidFn;
  var replyCallback: ReplyCallback;
  var div = document.createElement("div");
  var refreshButton = document.createElement("button");
  refreshButton.innerHTML = "Refresh comments";
  div.appendChild(refreshButton);

  var ul: HTMLElement;
  refreshButton.addEventListener("click", () => {
    if (refreshCallback) refreshCallback();
  });

  return {
    list: div,
    show: () => {
      div.style.display = "block";
    },
    hide: () => {
      div.style.display = "none";
    },
    refreshClicked: (callback: VoidFn) => {
      refreshCallback = callback;
    },
    replyClicked: (callback: ReplyCallback) => {
      replyCallback = callback;
    },
    displayComments: (comments: ThreadedComment[]) => {
      if (ul) div.removeChild(ul);

      ul = getUl(comments, replyCallback).build();

      div.appendChild(ul);
    }
  };
}

function getUl(comments: ThreadedComment[], replyCallback: ReplyCallback) {
  if (comments.length) {
    return createElement("ul")
      .attribute("class", "comment-list")
      .withChildren(
        comments.map(comment =>
          getSingleCommentListItem(comment, replyCallback)
        )
      );
  }

  return createElement("div")
    .attribute("class", "no-comments-message")
    .innerHTML("This post doesn't have any comments yet.");
}

function getSingleCommentListItem(
  comment: ThreadedComment,
  replyCallback: ReplyCallback
) {
  var authorNameEscaped = escapeHtml(comment.authorName);

  var formPlaceholder = createElement("div").build();

  var liBuilder = createElement("li")
    .attribute("class", "comment-list-item")
    .withChildren([
      createElement("div")
        .attribute("class", "author-name")
        .innerHTML(authorNameEscaped),
      createElement("div")
        .attribute("class", "created-timestamp")
        .innerHTML(comment.createdTimestampUtc.toLocaleString()),
      createElement("div")
        .attribute("class", "comment-text")
        .innerHTML(escapeHtml(comment.text)),
      createElement("button")
        .innerHTML(`Reply to ${authorNameEscaped}`)
        .addEventListener("click", e => {
          if (replyCallback)
            replyCallback(
              comment.rowKey,
              <HTMLButtonElement>e.currentTarget,
              formPlaceholder
            );
        }),
      () => formPlaceholder
    ]);

  if (comment.children && comment.children.length) {
    liBuilder.withChildren([getUl(comment.children, replyCallback)]);
  }

  return liBuilder;
}

export interface ThreadedComment {
  rowKey: string;
  text: string;
  authorName: string;
  email: string;
  createdTimestampUtc: Date;
  children: ThreadedComment[];
}

export interface ReplyCallback {
  (rowKey: string, button: HTMLElement, placeholderForForm: HTMLElement): void;
}
