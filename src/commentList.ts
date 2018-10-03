import escapeHtml from "./escape";
import { VoidFn } from "./common";
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

      ul = document.createElement("ul");
      ul.setAttribute("class", "comment-list");
      comments.forEach(comment => {
        var li = document.createElement("li");
        li.setAttribute("class", "comment-list-item");

        var authorNameEscaped = escapeHtml(comment.authorName);
        var authorNameDiv = document.createElement("div");
        authorNameDiv.innerHTML = authorNameEscaped;
        authorNameDiv.setAttribute("class", "author-name");
        li.appendChild(authorNameDiv);

        var textDiv = document.createElement("div");
        textDiv.innerHTML = escapeHtml(comment.text);
        textDiv.setAttribute("class", "comment-text");
        li.appendChild(textDiv);

        var replyButton = document.createElement("button");
        replyButton.innerHTML = `Reply to ${authorNameEscaped}`;
        replyButton.addEventListener("click", () => {
          if (replyCallback) replyCallback(comment.rowKey);
        });
        li.appendChild(replyButton);

        ul.appendChild(li);
      });
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
