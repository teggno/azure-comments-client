import {VoidFn} from "./common";

export default function() {
  var sendCallback: VoidFn;
  var form = document.createElement("form");
  form.addEventListener("submit", e => {
    e.preventDefault();
    if (sendCallback) sendCallback();
  });

  var authorNameTextBox = document.createElement("input");
  authorNameTextBox.setAttribute("required", "");
  authorNameTextBox.setAttribute("name", "name");
  var authorNameLabel = document.createElement("label");
  authorNameLabel.appendChild(document.createTextNode("Your name"));
  authorNameLabel.appendChild(authorNameTextBox);

  var textArea = document.createElement("textarea");
  textArea.setAttribute("required", "");
  textArea.setAttribute("name", "comment");
  var textAreaLabel = document.createElement("label");
  textAreaLabel.appendChild(document.createTextNode("Comment"));
  textAreaLabel.appendChild(textArea);

  var emailTextBox = document.createElement("input");
  emailTextBox.setAttribute("required", "");
  emailTextBox.setAttribute("name", "email");
  emailTextBox.setAttribute("type", "email");
  var emailLabel = document.createElement("label");
  emailLabel.appendChild(document.createTextNode("Your email"));
  emailLabel.appendChild(emailTextBox);

  var sendButton = document.createElement("button");
  sendButton.innerHTML = "Send";

  form.appendChild(textAreaLabel);
  form.appendChild(authorNameLabel);
  form.appendChild(emailLabel);
  form.appendChild(sendButton);

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
    getEnteredData: () => ({
      text: textArea.value,
      authorName: authorNameTextBox.value,
      email: emailTextBox.value
    })
  };
}
