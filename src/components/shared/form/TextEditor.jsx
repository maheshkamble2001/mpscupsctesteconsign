// Import Dependencies
import PropTypes from "prop-types";
import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
} from "react";
import clsx from "clsx";
import Quill from "quill";
import Cookies from "js-cookie";
import quillCSS from "quill/dist/quill.snow.css?inline";

// Local Imports
import { InputErrorMsg } from "components/ui";
import { useUncontrolled } from "hooks";
import {
  injectStyles,
  insertStylesToHead,
  makeStyleTag,
} from "utils/dom/injectStylesToHead";

// Inject Quill styles
const styles = `@layer vendor {
  ${quillCSS}
}

/* Custom styles for image resizer handle */
.quill-image-resizer-handle {
  position: absolute;
  width: 12px;
  height: 12px;
  background: white;
  border: 2px solid #666;
  border-radius: 2px;
  box-sizing: border-box;
  cursor: nwse-resize;
  z-index: 10000;
  user-select: none;
}

.quill-image-resizer-outline {
  position: absolute;
  border: 1px dashed #3b82f6;
  z-index: 9999;
  pointer-events: none;
}

/* Slightly highlight selected image */
.ql-editor img.selected-image {
  outline: 2px solid #3b82f6;
}
`;
const sheet = makeStyleTag();
injectStyles(sheet, styles);
insertStylesToHead(sheet);

// Quill Constants
const Delta = Quill.import("delta");
const DEFAULT_PLACEHOLDER = "Type here...";

const TextEditor = forwardRef(
  (
    {
      readOnly,
      value,
      defaultValue,
      onTextChange,
      onSelectionChange,
      onChange,
      placeholder,
      modules,
      className,
      error,
      classNames,
      label,
    },
    forwardedRef
  ) => {
    const containerRef = useRef(null);
    const quillRef = useRef(null);
    const lastChangeSourceRef = useRef(null);
    const onTextChangeRef = useRef(onTextChange);
    const onSelectionChangeRef = useRef(onSelectionChange);

    const [_value, handleChange] = useUncontrolled({
      value,
      defaultValue,
      finalValue: new Delta(),
      onChange,
    });

    const onChangeRef = useRef(handleChange);

    useLayoutEffect(() => {
      onTextChangeRef.current = onTextChange;
      onSelectionChangeRef.current = onSelectionChange;
      onChangeRef.current = handleChange;
    }, [handleChange, onSelectionChange, onTextChange]);

    useEffect(() => {
      const container = containerRef.current;

      const editorContainer = container.appendChild(
        container.ownerDocument.createElement("div")
      );

      // Add color/background & align options to toolbar + image button (no external libs)
      const quill = new Quill(editorContainer, {
        theme: "snow",
        placeholder: placeholder || DEFAULT_PLACEHOLDER,
        modules: {
          toolbar: {
            container: [
              [{ header: [1, 2, false] }],
              ["bold", "italic", "underline", "strike"],
              ["blockquote", "code-block"],
              [{ list: "ordered" }, { list: "bullet" }],
              ["link", "image"],
              [{ align: [] }], // alignment options for blocks (left/center/right/justify)
              [{ color: [] }, { background: [] }], // text color and background
              ["clean"],
            ],
            handlers: {
              // Custom image handler: upload with Authorization header using access_token from cookies
              image: () => {
                const input = document.createElement("input");
                input.setAttribute("type", "file");
                input.setAttribute("accept", "image/*");
                input.click();

                input.onchange = async () => {
                  const file = input.files[0];
                  if (!file) return;

                  const formData = new FormData();
                  formData.append("file", file);

                  const token = Cookies.get("access_token");

                  try {
                    const res = await fetch(
                      "https://hollymindsapi.econsignsoft.com/api/v1/admin/upload-image",
                      {
                        method: "POST",
                        headers: token
                          ? {
                              Authorization: `Bearer ${token}`,
                            }
                          : {},
                        body: formData,
                      }
                    );

                    const data = await res.json();
                    // console.log("UPLOAD RESPONSE:", data);

                    // try common response locations
                    const imageUrl =
                      data?.data?.url ||
                      data?.data?.fileUrl ||
                      data?.url ||
                      data?.fileUrl ||
                      (data?.data && typeof data.data === "string" ? data.data : null);

                    if (!imageUrl) {
                      console.error("Image URL not found in response", data);
                      return;
                    }

                    const editor = quillRef.current;
                    const range = editor?.getSelection(true) || { index: 0 };
                    // Insert the uploaded image as HTML so we can style/select it easily
                    editor.clipboard.dangerouslyPasteHTML(
                      range.index,
                      `<img src="${imageUrl}" alt="uploaded image" />`
                    );

                    // After insertion, ensure the image interaction handlers are attached
                    setTimeout(() => {
                      attachImageInteractions(editor);
                    }, 50);
                  } catch (err) {
                    console.error("Image upload failed", err);
                  }
                };
              },
            },
          },
          ...modules,
        },
      });

      quill.enable(!readOnly);

      // Set initial content
      const initialContent =
        typeof _value === "string"
          ? quill.clipboard.convert(_value)
          : _value || new Delta();
      quill.setContents(initialContent);

      quillRef.current = quill;

      quill.on(Quill.events.TEXT_CHANGE, (...args) => {
        const [, , source] = args;
        lastChangeSourceRef.current = source;

        if (source === "user") {
          const html = quill.root.innerHTML; // ✅ Always HTML
          onChangeRef?.current(html, quill);
          onTextChangeRef.current?.(...args);
        }
      });

      quill.on(Quill.events.SELECTION_CHANGE, (...args) => {
        onSelectionChangeRef.current?.(...args);
      });

      // Attach image interactions to existing images and react to future clicks
      attachImageInteractions(quill);

      // If user pastes an image via URL or drops, make sure interactions attach
      quill.root.addEventListener("click", () => attachImageInteractions(quill));

      return () => {
        quill.off(Quill.events.TEXT_CHANGE);
        quill.off(Quill.events.SELECTION_CHANGE);
        quillRef.current = null;
        // cleanup any attached handles/outlines
        removeGlobalResizerElements();
        container.innerHTML = "";
      };
    }, [readOnly, modules, placeholder]);

    useImperativeHandle(forwardedRef, () => ({
      getQuillInstance: () => quillRef.current,
      blur: () => quillRef.current?.blur(),
      focus: () => quillRef.current?.focus(),
      hasFocus: () => quillRef.current?.hasFocus(),
    }));

    useEffect(() => {
      if (!quillRef.current || value === undefined) return;

      // Only update when external value changes
      if (lastChangeSourceRef.current === "user") {
        lastChangeSourceRef.current = null;
        return;
      }

      const quill = quillRef.current;

      if (typeof value === "string") {
        if (quill.root.innerHTML !== value) {
          quill.root.innerHTML = value;
        }
      }
    }, [value]);

    /**
     * --- Helper functions for image interactions (resize & align)
     *
     * We implement a lightweight resizer:
     * - When an <img> inside editor is clicked, we show a dashed outline and a resize handle.
     * - Dragging the handle changes the inline width of the image (px or % preserved as px).
     * - Remove the outline when clicking elsewhere.
     *
     * No external libraries used.
     */

    const globalResizer = {
      handle: null,
      outline: null,
      currentImage: null,
      onMouseMove: null,
      onMouseUp: null,
      startX: 0,
      startWidth: 0,
    };

    function removeGlobalResizerElements() {
      if (globalResizer.handle && globalResizer.handle.parentNode) {
        globalResizer.handle.parentNode.removeChild(globalResizer.handle);
      }
      if (globalResizer.outline && globalResizer.outline.parentNode) {
        globalResizer.outline.parentNode.removeChild(globalResizer.outline);
      }
      globalResizer.handle = null;
      globalResizer.outline = null;
      globalResizer.currentImage = null;
      globalResizer.onMouseMove = null;
      globalResizer.onMouseUp = null;
    }

    function createResizerElements(doc) {
      removeGlobalResizerElements();

      const handle = doc.createElement("div");
      handle.className = "quill-image-resizer-handle";
      handle.style.position = "absolute";
      handle.style.display = "none";

      const outline = doc.createElement("div");
      outline.className = "quill-image-resizer-outline";
      outline.style.position = "absolute";
      outline.style.display = "none";

      (doc.body || document.body).appendChild(outline);
      (doc.body || document.body).appendChild(handle);

      globalResizer.handle = handle;
      globalResizer.outline = outline;
    }

    function attachImageInteractions(quill) {
      if (!quill) return;
      const editor = quill.root;
      const doc = editor.ownerDocument;

      // Create resizer elements if not already present
      if (!globalResizer.handle || !globalResizer.outline) {
        createResizerElements(doc);
      }

      // Click handler: show outline + handle if clicked on image
      const clickHandler = (evt) => {
        const target = evt.target;
        if (target && target.tagName === "IMG" && editor.contains(target)) {
          // mark selected image
          clearSelectedImages(quill);
          target.classList.add("selected-image");
          globalResizer.currentImage = target;
          showOutlineAndHandleForImage(target);
          // stop propagation (so selection change doesn't hide immediately)
          evt.stopPropagation();
        } else {
          // clicked outside image -> remove selection & resizer
          clearSelectedImages(quill);
          removeGlobalResizerElements();
        }
      };

      // Use delegation on editor root
      editor.addEventListener("click", clickHandler);

      // Also clear when clicking anywhere else in document
      const docClickHandler = (e) => {
        if (!editor.contains(e.target)) {
          clearSelectedImages(quill);
          removeGlobalResizerElements();
        }
      };
      doc.addEventListener("click", docClickHandler);

      // Clean-up approach: replace these listeners when component unmounts via return from attach? Not necessary
      // but if attachImageInteractions runs multiple times we don't attach duplicates - so remove older listeners.
      // To keep it simple and safe, we will not reattach if already attached:
      // But since attachImageInteractions may be called multiple times, avoid adding duplicated handlers by setting a flag
      if (!editor._imageInteractionAttached) {
        editor._imageInteractionAttached = true;
      } else {
        // already attached; don't add duplicate
        return;
      }

      // Resize logic handler creation
      function showOutlineAndHandleForImage(img) {
        if (!img) return;
        const rect = img.getBoundingClientRect();
        const docBody = doc.body;
        const outline = globalResizer.outline;
        const handle = globalResizer.handle;

        outline.style.left = `${rect.left + window.scrollX}px`;
        outline.style.top = `${rect.top + window.scrollY}px`;
        outline.style.width = `${rect.width}px`;
        outline.style.height = `${rect.height}px`;
        outline.style.display = "block";

        // place handle at bottom-right of image
        const handleLeft = rect.left + rect.width - 8 + window.scrollX;
        const handleTop = rect.top + rect.height - 8 + window.scrollY;
        handle.style.left = `${handleLeft}px`;
        handle.style.top = `${handleTop}px`;
        handle.style.display = "block";

        // Remove previous handlers if any
        if (globalResizer.onMouseMove) {
          doc.removeEventListener("mousemove", globalResizer.onMouseMove);
        }
        if (globalResizer.onMouseUp) {
          doc.removeEventListener("mouseup", globalResizer.onMouseUp);
        }

        // Prepare start values for dragging
        globalResizer.startWidth = img.width || img.getBoundingClientRect().width;
        globalResizer.startX = 0;

        // mousedown on handle -> start resize
        const onHandleMouseDown = (e) => {
          e.preventDefault();
          e.stopPropagation();
          globalResizer.startX = e.clientX;
          globalResizer.startWidth = img.getBoundingClientRect().width;

          globalResizer.onMouseMove = (moveEvt) => {
            moveEvt.preventDefault();
            const delta = moveEvt.clientX - globalResizer.startX;
            let newWidth = Math.max(20, globalResizer.startWidth + delta);
            // apply size in px (inline style) so Quill saves it inside delta
            img.style.width = `${newWidth}px`;

            // update outline and handle position
            const r = img.getBoundingClientRect();
            outline.style.left = `${r.left + window.scrollX}px`;
            outline.style.top = `${r.top + window.scrollY}px`;
            outline.style.width = `${r.width}px`;
            outline.style.height = `${r.height}px`;

            handle.style.left = `${r.left + r.width - 8 + window.scrollX}px`;
            handle.style.top = `${r.top + r.height - 8 + window.scrollY}px`;
          };

          globalResizer.onMouseUp = (upEvt) => {
            upEvt.preventDefault();
            // remove listeners
            doc.removeEventListener("mousemove", globalResizer.onMouseMove);
            doc.removeEventListener("mouseup", globalResizer.onMouseUp);
            globalResizer.onMouseMove = null;
            globalResizer.onMouseUp = null;
            // After resize complete, update Quill's internal contents to reflect new size
            // We do nothing special; inline style on img will be persisted in editor HTML
          };

          doc.addEventListener("mousemove", globalResizer.onMouseMove);
          doc.addEventListener("mouseup", globalResizer.onMouseUp);
        };

        // attach a one-time listener to handle's mousedown
        handle.onmousedown = onHandleMouseDown;
      }
    }

    function clearSelectedImages(quill) {
      const imgs = quill?.root?.querySelectorAll("img.selected-image") || [];
      imgs.forEach((img) => img.classList.remove("selected-image"));
      // hide resizer elements (we won't remove DOM nodes here)
      if (globalResizer.handle) globalResizer.handle.style.display = "none";
      if (globalResizer.outline) globalResizer.outline.style.display = "none";
      globalResizer.currentImage = null;
    }

    return (
      <div
        className={clsx(
          "flex flex-col",
          className,
          error && "ql-error",
          classNames?.root
        )}
      >
        {label && <label>{label}</label>}

        <div
          className={clsx(
            "ql-container",
            label && "mt-1.5!",
            classNames?.container
          )}
          ref={containerRef}
        ></div>

        <InputErrorMsg
          when={error && typeof error !== "boolean"}
          className={classNames?.error}
        >
          {error}
        </InputErrorMsg>
      </div>
    );
  }
);

TextEditor.displayName = "TextEditor";

TextEditor.propTypes = {
  readOnly: PropTypes.bool,
  defaultValue: PropTypes.any,
  value: PropTypes.any,
  onTextChange: PropTypes.func,
  onSelectionChange: PropTypes.func,
  onChange: PropTypes.func,
  placeholder: PropTypes.string,
  modules: PropTypes.object,
  children: PropTypes.node,
  error: PropTypes.oneOfType([PropTypes.bool, PropTypes.node]),
  className: PropTypes.string,
  classNames: PropTypes.object,
  label: PropTypes.node,
};

export { TextEditor, Delta, Quill };
