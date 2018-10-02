export default function getSettings() {
  var azureUrl = azureUrls[ENVIRONMENT]; // ENVIRONMENT is defined in webpack.dev.js and webpack.prod.js respectively.
  return {
    getCommentsUrl: (postUrl: string) =>
      `${azureUrl}/GetComments?postUrl=${encodeURIComponent(postUrl)}`,
    newCommentUrl: () => `${azureUrl}/NewComment`,
    recaptchaSiteKey: () => "6Lc6rXIUAAAAAN16xUNrM3ONA6Gva8hvLku7LEfx"
  };
}

const azureUrls: { [env: string]: string } = {
  production: "https://adw1blogcomments.azurewebsites.net/api",
  development: "https://adw1blogcomments.azurewebsites.net/api"
  //development: "http://localhost:7071/api"
};
