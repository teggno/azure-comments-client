import escapeHtml from "./escape";
import { VoidFn } from "./common";
import createElement from "./htmlBuilder";
import "./commentList.css";

export function getCommentList() {
  var refreshCallback: VoidFn;
  var replyCallback: (rowKey: string) => void;
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
    replyClicked: (callback: (rowKey: string) => void) => {
      replyCallback = callback;
    },
    displayComments: (comments: ThreadedComment[]) => {
      if (ul) div.removeChild(ul);

      ul = createElement("ul")
        .attribute("class", "comment-list")
        .withChildren(
          comments.map(comment => {
            var authorNameEscaped = escapeHtml(comment.authorName);

            return createElement("li")
              .attribute("class", "comment-list-item")
              .withChildren([
                createElement("div")
                  .attribute("class", "author-name")
                  .innerHTML(authorNameEscaped),
                createElement("div")
                  .attribute("class", "comment-text")
                  .innerHTML(escapeHtml(comment.text)),
                createElement("button")
                  .innerHTML(`Reply to ${authorNameEscaped}`)
                  .addEventListener("click", () => {
                    if (replyCallback) replyCallback(comment.rowKey);
                  })
              ]);
          })
        )
        .build();
      div.appendChild(ul);
    }
  };
}

export interface ThreadedComment {
  rowKey: string;
  text: string;
  authorName: string;
  authorEmail: string;
  date: Date;
  children: ThreadedComment[];
}
