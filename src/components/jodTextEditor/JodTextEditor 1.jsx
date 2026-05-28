import React, { useRef } from "react";
import JoditEditor from "jodit-react";
import { decryptData } from "configs/encryption";
 
const JodTextEditor = ({ value = "", onChange }) => {
  const editor = useRef(null);
 
  const config = {
    readonly: false,
    height: 400,
    toolbarButtonSize: "middle",
    allowFullscreen: true,
    fullsize: false,
    useNativeFullscreen: false,
    clipboard: { matchVisual: false },
    askBeforePasteFromWord: false,
    askBeforePasteHTML: false,
    // uploader: {
    //   insertImageAsBase64URI: false,
    //   url: `${process.env.REACT_APP_API_URL}/master/upload/image`,
    //   method: "POST",
    //   filesVariableName: () => "image",
 
    //   isSuccess: (resp) => {
    //     console.log("Uploader: isSuccess called", resp);
    //     const wrappedResp = typeof resp === "string" ? { data: resp } : resp;
    //     const decrypted = decryptData(wrappedResp);
    //     console.log("Uploader: decrypted response in isSuccess", decrypted);
    //     return decrypted?.code === 200 && !!decrypted?.data?.imageUrl;
    //   },
 
    //   process: (resp) => {
    //     console.log("Uploader: process called", resp);
    //     const wrappedResp = typeof resp === "string" ? { data: resp } : resp;
    //     const decrypted = decryptData(wrappedResp);
    //     console.log("Uploader: decrypted response in process", decrypted);
    //     const imageUrl = decrypted?.data?.imageUrl;
    //     return { success: !!imageUrl, data: { files: [imageUrl] } };
    //   },
 
    //   defaultHandlerSuccess: function (resp) {
    //     console.log("Uploader: defaultHandlerSuccess called", resp);
    //     try {
    //       let decrypted;
    //       if (resp && resp.success && resp.data && resp.data.files) {
    //         decrypted = { data: { imageUrl: resp.data.files[0] } };
    //       } else {
    //         const wrapped = typeof resp === "string" ? { data: resp } : resp;
    //         decrypted = decryptData(wrapped);
    //       }
    //       const imageUrl = decrypted?.data?.imageUrl;
    //       console.log("Uploader: final imageUrl", imageUrl);
 
    //       if (!imageUrl) {
    //         console.warn("Uploader: no imageUrl in response");
    //         return;
    //       }
 
    //       const doc = this.ownerDocument || document;
    //       const container = this.container || this.editor || this;
 
    //       const wasFull =
    //         (this.fullsize && typeof this.fullsize.isFullSize === "function" && this.fullsize.isFullSize()) ||
    //         !!doc.fullscreenElement ||
    //         (container && container.classList && container.classList.contains("jodit_fullsize"));
    //       console.log("Uploader: wasFull", wasFull);
 
    //       try {
    //         if (this.selection && typeof this.selection.save === "function") {
    //           console.log("Uploader: saving selection");
    //           this.selection.save();
    //         }
    //       } catch (e) {
    //         console.warn("Uploader: selection.save() failed", e);
    //       }
 
    //       let inserted = false;
    //       try {
    //         const img = (doc || document).createElement("img");
    //         img.src = imageUrl;
    //         img.alt = "uploaded";
 
    //         if (this.selection && typeof this.selection.insertNode === "function") {
    //           this.selection.insertNode(img);
    //           inserted = true;
    //           console.log("Uploader: inserted image via selection.insertNode");
    //         } else if (typeof this.insertNode === "function") {
    //           this.insertNode(img);
    //           inserted = true;
    //           console.log("Uploader: inserted image via this.insertNode");
    //         }
    //       } catch (err) {
    //         console.warn("Uploader: insertNode attempt failed", err);
    //       }
 
    //       if (!inserted) {
    //         try {
    //           if (this.selection && typeof this.selection.restore === "function") {
    //             this.selection.restore();
    //           }
    //           this.selection.insertHTML(`<img src="${imageUrl}" alt="uploaded" />`);
    //           inserted = true;
    //           console.log("Uploader: inserted image via insertHTML fallback");
    //         } catch (err) {
    //           console.error("Uploader: insertHTML fallback failed", err);
    //         }
    //       }
 
    //       try {
    //         if (this.selection && typeof this.selection.restore === "function") {
    //           this.selection.restore();
    //         }
    //         setTimeout(() => {
    //           try {
    //             if (typeof this.focus === "function") this.focus();
    //           } catch (e) { }
    //         }, 120);
    //       } catch (e) {
    //         console.warn("Uploader: selection.restore() failed", e);
    //       }
 
    //       if (wasFull) {
    //         setTimeout(() => {
    //           console.log("Uploader: attempting to restore fullscreen");
    //           try {
    //             if (doc.fullscreenElement) return;
    //             if (this.fullsize && typeof this.fullsize.isFullSize === "function" && typeof this.fullsize.toggle === "function") {
    //               if (!this.fullsize.isFullSize()) {
    //                 this.fullsize.toggle();
    //                 console.log("Uploader: restored fullscreen via this.fullsize.toggle()");
    //                 return;
    //               }
    //             }
    //             if (container && typeof container.requestFullscreen === "function") {
    //               container.requestFullscreen().then(() => console.log("Uploader: restored native fullscreen"));
    //             }
    //             if (container && container.classList) container.classList.add("jodit_fullsize");
    //           } catch (err) {
    //             console.error("Uploader: error while attempting to restore fullscreen", err);
    //           }
    //         }, 160);
    //       }
    //     } catch (err) {
    //       console.error("Uploader defaultHandlerSuccess unexpected error", err);
    //     }
    //   }
    // }
  };
 
  const handleBlur = (html, event) => {
    console.log("Editor: onBlur triggered", event?.relatedTarget);
 
    if (!event?.relatedTarget) {
      console.log("Editor: blur ignored due to window switch / alt-tab");
      return;
    }
 
    const target = event.relatedTarget;
 
 
    if (target) {
      const tag = target.tagName?.toLowerCase();
      const classList = target.classList || [];
 
      const isFileInput =
        tag === "input" && target.type === "file";
 
      const isToolbar =
        classList.contains("jodit-toolbar") ||
        classList.contains("jodit-toolbar-button");
 
      const isUploader =
        classList.contains("jodit-uploader");
      const isDialog =
        classList.contains("jodit-dialog") ||
        classList.contains("jodit-dialog__wrapper") ||
        classList.contains("jodit-dialog__box") ||
        classList.contains("jodit-ui-input__input") ||
        classList.contains("jodit-ui-button") ||
        classList.contains("jodit-ui-group") ||
        classList.contains("jodit-ui-form") ||
        target.closest(".jodit-dialog");  // ✅ NEW — handles Link, Search, ALL dialogs
      // entire form
 
      if (isFileInput || isToolbar || isUploader || isDialog) {
        console.log("Editor: blur ignored due to Jodit modal/toolbar/uploader");
        return;
      }
    }
 
    // NORMAL BLUR HANDLING
    const fixedHtml = html.replace(
      /(<td[^>]*)(style="[^"]*border-color:[^";]+;?[^"]*")([^>]*>)/g,
      (match, start, style, end) => {
        if (!/border:(.*?)solid/i.test(style)) {
          style = style.replace(/style="/, 'style="border:1px solid #000; ');
        }
        return `${start}${style}${end}`;
      }
    );
 
    onChange?.(fixedHtml);
  };
 
 
 
  return (
    <JoditEditor
      ref={editor}
      value={value || ""}
      config={config}
      tabIndex={1}
      onBlur={handleBlur}
      onChange={() => { }}
    />
  );
};
 
export default JodTextEditor;
 
 