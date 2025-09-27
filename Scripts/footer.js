// Load footer partial into pages
fetch("partials/footer.html")
  .then(res => res.text())
  .then(html => {
    document.getElementById("site-footer").innerHTML = html;
  })
  .catch(err => console.error("Error loading footer:", err));
