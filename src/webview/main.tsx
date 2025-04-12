import React, { Fragment } from "react";
import { createRoot } from "react-dom/client";

import FolderTreeCompare from "./folderTreeCompare";
import FolderList from "./folderList";

const root = createRoot(document.getElementById("lgapp"));
root.render(
  <Fragment>
    <FolderList />
  </Fragment>
);