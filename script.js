const navToggle = document.querySelector(".nav-toggle");
const navLinks = document.querySelector(".nav-links");

if (navToggle && navLinks) {
  navToggle.addEventListener("click", () => {
    const isOpen = navLinks.classList.toggle("open");
    navToggle.classList.toggle("open", isOpen);
    navToggle.setAttribute("aria-expanded", String(isOpen));
    navToggle.setAttribute("aria-label", isOpen ? "Close menu" : "Open menu");
  });

  navLinks.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      navLinks.classList.remove("open");
      navToggle.classList.remove("open");
      navToggle.setAttribute("aria-expanded", "false");
      navToggle.setAttribute("aria-label", "Open menu");
    });
  });
}

document.querySelectorAll("[data-custom-select]").forEach((select) => {
  const trigger = select.querySelector(".select-trigger");
  const triggerText = trigger.querySelector("span");
  const input = select.querySelector("input[type='hidden']");
  const options = select.querySelectorAll("[role='option']");

  const close = () => {
    select.classList.remove("open");
    trigger.setAttribute("aria-expanded", "false");
  };

  const open = () => {
    select.classList.add("open");
    trigger.setAttribute("aria-expanded", "true");
  };

  trigger.addEventListener("click", () => {
    select.classList.contains("open") ? close() : open();
  });

  options.forEach((option) => {
    option.addEventListener("click", () => {
      options.forEach((item) => item.removeAttribute("aria-selected"));
      option.setAttribute("aria-selected", "true");
      input.value = option.dataset.value;
      triggerText.textContent = option.textContent;
      close();
      trigger.focus();
    });
  });

  select.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      close();
      trigger.focus();
    }
  });

  document.addEventListener("click", (event) => {
    if (!select.contains(event.target)) close();
  });
});

document.querySelectorAll("[data-photo-upload]").forEach((upload) => {
  const input = upload.querySelector("input[type='file']");
  const dropzone = upload.querySelector(".photo-dropzone");
  const countText = upload.querySelector("[data-photo-count]");
  const sizeText = upload.querySelector("[data-photo-size]");
  const errorText = upload.querySelector("[data-photo-error]");
  const list = upload.querySelector("[data-photo-list]");
  const maxFiles = 10;
  const maxBytes = 25 * 1024 * 1024;
  let selectedFiles = [];

  const formatSize = (bytes) => {
    if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
    return `${Math.ceil(bytes / 1024)}KB`;
  };

  const syncInput = () => {
    const transfer = new DataTransfer();
    selectedFiles.forEach((file) => transfer.items.add(file));
    input.files = transfer.files;
  };

  const render = () => {
    const usedBytes = selectedFiles.reduce((total, file) => total + file.size, 0);
    const remainingBytes = Math.max(0, maxBytes - usedBytes);

    countText.textContent = `${selectedFiles.length}/${maxFiles} photos selected`;
    sizeText.textContent = `${formatSize(remainingBytes)} remaining`;
    list.innerHTML = "";

    selectedFiles.forEach((file, index) => {
      const item = document.createElement("div");
      item.className = "photo-item";
      const fileText = document.createElement("span");
      const fileSize = document.createElement("small");
      const preview = document.createElement("img");
      const removeButton = document.createElement("button");

      fileText.textContent = file.name;
      fileSize.textContent = formatSize(file.size);
      fileText.appendChild(fileSize);

      preview.className = "photo-thumb";
      preview.src = URL.createObjectURL(file);
      preview.alt = "";
      preview.addEventListener("load", () => URL.revokeObjectURL(preview.src), { once: true });

      removeButton.className = "photo-remove";
      removeButton.type = "button";
      removeButton.setAttribute("aria-label", `Remove ${file.name}`);
      removeButton.textContent = "x";
      removeButton.addEventListener("click", () => {
        selectedFiles.splice(index, 1);
        errorText.textContent = "";
        syncInput();
        render();
      });

      item.append(fileText, preview, removeButton);
      list.appendChild(item);
    });
  };

  const addFiles = (files) => {
    errorText.textContent = "";
    const incoming = Array.from(files).filter((file) => file.type.startsWith("image/"));
    const rejected = Array.from(files).length - incoming.length;

    if (rejected) {
      errorText.textContent = "Only image files can be uploaded.";
    }

    for (const file of incoming) {
      const usedBytes = selectedFiles.reduce((total, item) => total + item.size, 0);

      if (selectedFiles.length >= maxFiles) {
        errorText.textContent = "Maximum 10 photos per submission.";
        break;
      }

      if (usedBytes + file.size > maxBytes) {
        errorText.textContent = "Combined photo size must stay under 25MB.";
        break;
      }

      selectedFiles.push(file);
    }

    syncInput();
    render();
  };

  input.addEventListener("change", () => addFiles(input.files));

  ["dragenter", "dragover"].forEach((eventName) => {
    dropzone.addEventListener(eventName, (event) => {
      event.preventDefault();
      upload.classList.add("dragging");
    });
  });

  ["dragleave", "drop"].forEach((eventName) => {
    dropzone.addEventListener(eventName, (event) => {
      event.preventDefault();
      upload.classList.remove("dragging");
    });
  });

  dropzone.addEventListener("drop", (event) => {
    addFiles(event.dataTransfer.files);
  });

  render();
});

const revealItems = document.querySelectorAll(".reveal");

if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.14 }
  );

  revealItems.forEach((item) => observer.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add("visible"));
}
