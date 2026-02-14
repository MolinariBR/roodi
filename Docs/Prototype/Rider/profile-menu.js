(function () {
  const menuToggleEl = document.getElementById("menuToggle");
  const floatingMenuEl = document.getElementById("floatingMenu");

  if (!menuToggleEl || !floatingMenuEl) return;

  let isOpen = false;

  function openMenu() {
    if (isOpen) return;
    isOpen = true;
    floatingMenuEl.classList.remove("hidden");
    menuToggleEl.setAttribute("aria-expanded", "true");
  }

  function closeMenu() {
    if (!isOpen) return;
    isOpen = false;
    floatingMenuEl.classList.add("hidden");
    menuToggleEl.setAttribute("aria-expanded", "false");
  }

  menuToggleEl.setAttribute("aria-haspopup", "true");
  menuToggleEl.setAttribute("aria-expanded", "false");

  menuToggleEl.addEventListener("click", (event) => {
    event.stopPropagation();
    if (isOpen) closeMenu();
    else openMenu();
  });

  floatingMenuEl.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", closeMenu);
  });

  document.addEventListener("click", (event) => {
    if (!isOpen) return;
    if (event.target.closest("#floatingMenu")) return;
    if (event.target.closest("#menuToggle")) return;
    closeMenu();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeMenu();
  });
})();
