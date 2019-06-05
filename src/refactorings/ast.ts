import { parse } from "@babel/parser";
import traverse, { TraverseOptions } from "@babel/traverse";
import * as t from "@babel/types";

import { Code } from "./i-write-updates";

export { NodePath } from "@babel/traverse";
export * from "@babel/types";
export { traverseAST, isUndefinedLiteral };
export { ASTSelection, ASTPosition };

interface ASTSelection {
  start: ASTPosition;
  end: ASTPosition;
}

interface ASTPosition {
  line: number;
  column: number;
}

function traverseAST(code: Code, opts: TraverseOptions): void {
  const ast = parse(code, {
    // Parse in strict mode and allow module declarations
    sourceType: "module",

    plugins: [
      "classProperties",
      "classPrivateProperties",
      "classPrivateMethods",
      "jsx",
      "typescript"
    ]
  });

  traverse(ast, opts);
}

function isUndefinedLiteral(
  node: object | null | undefined,
  opts?: object | null
): node is t.Identifier {
  return t.isIdentifier(node, opts) && node.name === "undefined";
}