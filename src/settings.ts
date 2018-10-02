export default function getSettings() {
  var azureUrl = "https://adw1blogcomments.azurewebsites.net/api";
  //var azureUrl = "http://localhost:7071/api";
  return {
    getCommentsUrl: (postUrl: string) =>
      `${azureUrl}/GetComments?postUrl=${encodeURIComponent(postUrl)}`,
    newCommentUrl: () => `${azureUrl}/NewComment`,
    recaptchaSiteKey: () => "6Lc6rXIUAAAAAN16xUNrM3ONA6Gva8hvLku7LEfx"
  };
}
