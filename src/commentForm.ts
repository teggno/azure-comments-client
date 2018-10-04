import { VoidFn } from "./common";
import createElement from "./htmlBuilder";

export default function() {
  var sendCallback: VoidFn;
  var cancelCallback: VoidFn;
  var textArea: HTMLTextAreaElement;
  var authorNameTextBox: HTMLInputElement;
  var emailTextBox: HTMLInputElement;
  var form = createElement("form")
    .addEventListener("submit", e => {
      e.preventDefault();
      if (sendCallback) sendCallback();
    })
    .withChildren([
      createElement("label").withChildren([
        () => document.createTextNode("Comment"),
        createElement("textarea", e => (textArea = e))
          .attribute("required", "")
          .attribute("name", "comment")
      ]),

      createElement("label").withChildren([
        () => document.createTextNode("Your name"),
        createElement("input", e => (authorNameTextBox = e))
          .attribute("required", "")
          .attribute("name", "name")
      ]),

      createElement("label").withChildren([
        () => document.createTextNode("Your email"),
        createElement("input", e => (emailTextBox = e))
          .attribute("name", "email")
          .attribute("type", "email")
      ]),

      createElement("button")
        .innerHTML("Send")
        .addEventListener("click", () => {
          if (sendCallback) sendCallback();
        }),
      createElement("button")
        .innerHTML("Cancel")
        .attribute("type", "button")
        .addEventListener("click", () => {
          if (cancelCallback) cancelCallback();
        })
    ])
    .build();

  return {
    form: form,
    focusTextarea: () => {
      textArea.focus();
    },
    show: () => {
      form.style.display = "block";
    },
    hide: () => {
      form.style.display = "none";
    },
    reset: () => {
      form.reset();
    },
    sendClicked: (callback: VoidFn) => {
      sendCallback = callback;
    },
    cancelClicked: (callback: VoidFn) => {
      cancelCallback = callback;
    },
    getEnteredData: () => ({
      text: textArea.value,
      authorName: authorNameTextBox.value,
      email: emailTextBox.value
    })
  };
}
