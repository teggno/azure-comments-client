import "./toast.css";
import createElement from "./htmlBuilder";

export default function(text: string) {
  var toast = createElement("div")
    .class("toast")
    .innerHTML(text)
    .build();

  document.body.appendChild(toast);
  setTimeout(() => {
    toast.setAttribute("class", "toast hidden");
    setTimeout(() => {
      document.body.removeChild(toast);
    }, 500 /*must be at least the same time as the fadeOut animation in toast.css*/);
  }, 5000);
}
