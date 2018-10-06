import createElement from "./htmlBuilder";

export default function getCommentListLoadingIndicator(){
  var indicator = createElement("div")
    .innerHTML("Comments are being loaded")
    .build();
  return {
    show: () => {
      indicator.style.display = "block";
    },
    hide: () => {
      indicator.style.display = "none";
    },
    indicator: indicator
  }
}
