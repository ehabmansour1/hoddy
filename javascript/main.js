import { frontImage } from "./frontImage.js";
import { backImage } from "./backImage.js";

export default class DesignTool {
  constructor() {
    this.canvas = document.getElementById("designCanvas");
    this.hoddyBaseImage = document.getElementById("hoddyBaseImage");
    this.textInput = document.getElementById("textInput");
    this.fontSelector = document.getElementById("fontSelector");
    this.textColorPicker = document.getElementById("textColorPicker");
    this.addTextBtn = document.getElementById("addTextBtn");
    this.imageUpload = document.getElementById("imageUpload");
    this.downloadBtn = document.getElementById("downloadBtn");
    this.frontViewBtn = document.getElementById("frontViewBtn");
    this.backViewBtn = document.getElementById("backViewBtn");
    this.textSizeSlider = document.getElementById("textSizeSlider");
    this.textSizeDisplay = document.getElementById("textSizeDisplay");
    this.selectedElement = null;
    this.currentView = "front";
    this.frontDesignDownloaded = false;
    this.setupEventListeners();
  }

  setupEventListeners() {
    this.addTextBtn.addEventListener("click", () => this.addText());
    this.imageUpload.addEventListener("change", (e) => this.uploadImage(e));
    this.downloadBtn.addEventListener("click", () => this.downloadDesign());
    this.textSizeSlider.addEventListener("input", (e) =>
      this.updateTextSize(e)
    );
    this.fontSelector.addEventListener("change", (e) => this.updateFont(e));
    this.textColorPicker.addEventListener("input", (e) =>
      this.updateTextColor(e)
    );

    document.addEventListener("click", (e) => {
      // If we click outside the canvas or on any non-draggable element, remove the selection
      if (!this.canvas.contains(e.target)) {
        this.removeSelection();
      } else {
        const clickedElement = e.target.closest(".draggable");
        if (clickedElement && this.canvas.contains(clickedElement)) {
          this.selectedElement = clickedElement;
          this.selectedElement.classList.add("selected");

          if (clickedElement.classList.contains("text-element")) {
            const currentSize = parseInt(
              window.getComputedStyle(clickedElement).fontSize
            );
            this.textSizeSlider.value = currentSize;
            this.textSizeDisplay.textContent = currentSize;

            const currentFont =
              window.getComputedStyle(clickedElement).fontFamily;
            this.fontSelector.value = currentFont.replace(/['"]+/g, "");

            const currentColor = window.getComputedStyle(clickedElement).color;
            this.textColorPicker.value = this.rgbToHex(currentColor);

            this.makeEditable(clickedElement);
          }
        }
      }
    });

    this.frontViewBtn.addEventListener("click", () => this.switchView("front"));
    this.backViewBtn.addEventListener("click", () => this.switchView("back"));
  }

  rgbToHex(rgb) {
    const result = rgb.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)/);
    return result
      ? "#" +
          (
            (1 << 24) |
            (parseInt(result[1]) << 16) |
            (parseInt(result[2]) << 8) |
            parseInt(result[3])
          )
            .toString(16)
            .slice(1)
            .toUpperCase()
      : rgb;
  }

  updateTextSize(e) {
    if (
      this.selectedElement &&
      this.selectedElement.classList.contains("text-element")
    ) {
      this.selectedElement.style.fontSize = `${e.target.value}px`;
    }
  }

  updateFont(e) {
    if (
      this.selectedElement &&
      this.selectedElement.classList.contains("text-element")
    ) {
      this.selectedElement.style.fontFamily = e.target.value;
    }
  }

  updateTextColor(e) {
    if (
      this.selectedElement &&
      this.selectedElement.classList.contains("text-element")
    ) {
      this.selectedElement.style.color = e.target.value;
    }
  }

  makeEditable(element) {
    element.setAttribute("contenteditable", "true");
    element.focus();

    const saveChanges = () => {
      element.removeAttribute("contenteditable");
    };

    element.addEventListener("blur", saveChanges);
    element.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        saveChanges();
      }
    });
  }

  removeSelection() {
    if (this.selectedElement) {
      this.selectedElement.classList.remove("selected");
      this.selectedElement = null;
    }
  }

  switchView(view) {
    if (view === "back" && !this.frontDesignDownloaded) {
      Swal.fire({
        icon: "warning",
        title: "Wait!",
        text: "Please download your front design first!",
        confirmButtonText: "OK",
        confirmButtonColor: "#3085d6",
      });

      return;
    }
    this.currentView = view;
    this.frontViewBtn.classList.toggle("active", view === "front");
    this.backViewBtn.classList.toggle("active", view === "back");
    if (view === "front") {
      this.hoddyBaseImage.src = frontImage;
    } else {
      this.hoddyBaseImage.src = backImage;
    }
    const designElements = this.canvas.querySelectorAll(".draggable");
    designElements.forEach((el) => this.canvas.removeChild(el));
  }

  addText() {
    const text = this.textInput.value;
    const font = this.fontSelector.value;
    const color = this.textColorPicker.value;
    const size = this.textSizeSlider.value;

    if (text) {
      const textContainer = document.createElement("div");
      textContainer.classList.add("draggable", "text-element");
      textContainer.style.zIndex = "2";

      const textElement = document.createElement("div");
      textElement.textContent = text;
      textElement.style.fontFamily = font;
      textElement.style.color = color;
      textElement.style.fontSize = `${size}px`;
      textContainer.style.position = "absolute";
      textContainer.style.left = "50%";
      textContainer.style.top = "50%";
      textContainer.style.transform = "translate(-50%, -50%)";
      const deleteBtn = this.createDeleteButton(textContainer);
      textContainer.appendChild(deleteBtn);
      textContainer.appendChild(textElement);
      this.makeElementInteractive(textContainer);
      this.canvas.appendChild(textContainer);
      this.textInput.value = "";
    }
  }

  uploadImage(event) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imgContainer = document.createElement("div");
        imgContainer.classList.add("draggable", "image-container");
        imgContainer.style.zIndex = "2";
        const img = document.createElement("img");
        img.src = e.target.result;
        img.style.maxWidth = "100%";
        img.style.maxHeight = "100%";
        img.style.objectFit = "contain";
        const resizeHandle = document.createElement("div");
        resizeHandle.classList.add("resize-handle");
        const deleteBtn = this.createDeleteButton(imgContainer);
        imgContainer.appendChild(deleteBtn);
        imgContainer.appendChild(img);
        imgContainer.appendChild(resizeHandle);
        imgContainer.style.position = "absolute";
        imgContainer.style.left = "50%";
        imgContainer.style.top = "50%";
        imgContainer.style.transform = "translate(-50%, -50%)";
        imgContainer.style.width = "300px";
        imgContainer.style.height = "300px";
        this.makeElementInteractive(imgContainer, resizeHandle);
        this.canvas.appendChild(imgContainer);
      };
      reader.readAsDataURL(file);
    }
  }

  createDeleteButton(element) {
    const deleteBtn = document.createElement("div");
    deleteBtn.classList.add("element-delete-btn");
    deleteBtn.textContent = "✕";

    deleteBtn.addEventListener("click", (e) => {
      e.stopPropagation(); // Prevent selection of parent element
      this.canvas.removeChild(element);
      if (this.selectedElement === element) {
        this.selectedElement = null;
      }
    });

    return deleteBtn;
  }

  makeElementInteractive(element, resizeHandle = null) {
    let isDragging = false;
    let isResizing = false;
    let startX, startY, startWidth, startHeight;

    element.addEventListener("mousedown", (e) => {
      e.stopPropagation();
      if (e.target === resizeHandle) {
        isResizing = true;
        startX = e.clientX;
        startY = e.clientY;
        startWidth = parseInt(
          document.defaultView.getComputedStyle(element).width
        );
        startHeight = parseInt(
          document.defaultView.getComputedStyle(element).height
        );
      } else if (!e.target.classList.contains("element-delete-btn")) {
        isDragging = true;
        startX = e.clientX - element.offsetLeft;
        startY = e.clientY - element.offsetTop;
      }
    });

    document.addEventListener("mousemove", (e) => {
      if (isDragging) {
        element.style.left = `${e.clientX - startX}px`;
        element.style.top = `${e.clientY - startY}px`;
      }
      if (isResizing && resizeHandle) {
        const width = startWidth + (e.clientX - startX);
        const height = startHeight + (e.clientY - startY);
        element.style.width = `${width}px`;
        element.style.height = `${height}px`;
      }
    });

    document.addEventListener("mouseup", () => {
      isDragging = false;
      isResizing = false;
    });
  }

  async downloadDesign() {
    if (this.selectedElement) {
      this.selectedElement.classList.remove("selected");
    }
    const canvas = await html2canvas(this.canvas, {
      useCORS: true,
      allowTaint: true,
      scale: 2,
    });
    const link = document.createElement("a");
    link.download = "hoddy_design.png";
    link.href = canvas.toDataURL();
    link.click();
    if (this.currentView === "front") {
      this.frontDesignDownloaded = true;
    }
  }
}

document.addEventListener("DOMContentLoaded", () => {
  new DesignTool();
  document.querySelector("#hoddyBaseImage").src = frontImage;
});
