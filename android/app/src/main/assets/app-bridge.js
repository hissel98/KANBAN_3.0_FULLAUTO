(function () {
  var root = document.documentElement;
  var body = document.body;
  var linkId = "app-overlay-css";

  root.classList.add("app-mode");

  if (body) {
    body.classList.add("app-mode");
  } else {
    document.addEventListener("DOMContentLoaded", function () {
      document.body && document.body.classList.add("app-mode");
    }, { once: true });
  }

  if (document.getElementById(linkId)) {
    return;
  }

  var link = document.createElement("link");
  link.id = linkId;
  link.rel = "stylesheet";
  link.href = "file:///android_asset/app-overlay.css";
  link.onerror = function () {
    if (link.href.indexOf("file:///android_asset/") === 0) {
      link.href = "/app-overlay.css";
    }
  };

  (document.head || root).appendChild(link);
})();
