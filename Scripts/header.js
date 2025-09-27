// Load the shared header partial
fetch("partials/header.html")
  .then(res => res.text())
  .then(html => {
    document.getElementById("site-header").innerHTML = html;

    // Highlight the current page in nav
    const path = window.location.pathname.split("/").pop();
    document.querySelectorAll("nav a").forEach(a => {
      if (a.getAttribute("href") === path) {
        a.classList.add("active");
      }
    });
  });

