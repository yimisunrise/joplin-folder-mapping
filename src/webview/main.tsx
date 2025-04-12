import React, { Fragment } from "react";
import { createRoot } from "react-dom/client";
import { WebViewID } from "../webViewType";

import FolderTreeCompare from "./folderTreeCompare";
import SystemFileList from "./systemFileList";

const systemFilePanelElement = document.getElementById(WebViewID.SYSTEM_FILE_PANEL);
if (!systemFilePanelElement) {
  console.log(WebViewID.SYSTEM_FILE_PANEL + "element not found");
} else {
  createRoot(systemFilePanelElement).render(
    <Fragment>
      <SystemFileList />
    </Fragment>
  );
}

const compareDialogElement = document.getElementById(WebViewID.COMPARE_DIALOG);
if (!compareDialogElement) {
  console.log(WebViewID.COMPARE_DIALOG + "element not found");
} else {
  createRoot(compareDialogElement).render(
    <Fragment>
      <FolderTreeCompare />
    </Fragment>
  );
}