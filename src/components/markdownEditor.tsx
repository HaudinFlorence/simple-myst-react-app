import { MarkdownRenderer } from "./markdownRenderer";
import { defaultOptions, mystParse } from "myst-parser";
import { defaultDirectives } from "myst-directives";
import { helloDirective } from "../directives/helloDirective";
import { pullRequestDirective } from "../directives/PRDirective";
import { VFile } from "vfile";
import { GenericNode, GenericParent } from "myst-common";
import { useState } from "react";

import {
  captionParagraphTransform,
  liftMystDirectivesAndRolesTransform,
  mathTransform,
  mystTargetsTransform,
} from "myst-transforms";

const allDirectives = defaultDirectives.concat(
  helloDirective,
  pullRequestDirective
);

const customOptions = {
  ...defaultOptions,
  directives: allDirectives,
};

function transformTree(tree: GenericParent) {
  const vfile = new VFile(); // used for logging error messages
  tree.children.forEach((node) => {
    if (node.name === "figure") {
      liftMystDirectivesAndRolesTransform(tree);
      mystTargetsTransform(tree);
    }
    if (node.name === "math" || node.type === "math") {
      mathTransform(tree, vfile, { macros: {} });
    }
    if (node.name === "code") {
      captionParagraphTransform(tree);
    }
    if (node.type === "paragraph") {
      if (node.children) {
        node.children.forEach((child) => {
          if (child.type === "inlineMath")
            mathTransform(tree, vfile, { macros: {} });
        });
      }
    }
  });
}

export function MarkdownEditor() {
  const initial = "test";
  const [postContent, setPostContent] = useState(initial);
  let tree: GenericParent;
  if (postContent.length === 0) {
    const emptyNode: GenericNode = { type: "paragraph", value: "" };
    tree = { type: "paragraph", children: [emptyNode] };
  }
  tree = mystParse(postContent, customOptions);
  transformTree(tree);
  return (
    <>
      <label>
        <h1 className="app-title"> Myst react app</h1>
        <p className="text-instruction-class">Enter some markdown:</p>
        <textarea
          className="textarea-class"
          value={postContent}
          onChange={(e) => {
            setPostContent(e.target.value);
          }}
        />
      </label>
      <MarkdownRenderer tree={tree}></MarkdownRenderer>
    </>
  );
}
