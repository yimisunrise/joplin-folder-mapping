import React, { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import FolderTreeCompare from "./FolderTreeCompare";

const root = createRoot(document.getElementById("lgapp"));
root.render(
  <StrictMode>
    <FolderTreeCompare />
  </StrictMode>
);