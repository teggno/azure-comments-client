import escapeHtml from "./escape";
import { VoidFn } from "./common";

export function getCommentList() {
  var refreshCallback: VoidFn;
  var div = document.createElement("div");
  var refreshButton = document.createElement("button");
  refreshButton.innerHTML = "Refresh comments";
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
    refreshClicked: (callback: VoidFn) =>{
      refreshCallback = callback;
    },
    displayComments: (comments: ThreadedComment[])=>{
      if (ul) div.removeChild(ul);

      ul = document.createElement("ul");
      comments.forEach(comment => {
        var li = document.createElement("li");
        li.innerHTML = escapeHtml(comment.authorName);
        ul.appendChild(li);
      });
      div.appendChild(ul);
    }
  }
}

export interface ThreadedComment{
  text: string;
  authorName: string;
  authorEmail: string;
  date: Date;
  children: ThreadedComment[];
}
