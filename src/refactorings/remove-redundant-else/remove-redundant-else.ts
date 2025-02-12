import { Editor, ErrorReason } from "../../editor/editor";
import { Selection } from "../../editor/selection";
import { last } from "../../array";
import * as t from "../../ast";

export { removeRedundantElse, createVisitor as hasRedundantElse };

async function removeRedundantElse(editor: Editor) {
  const { code, selection } = editor;
  const updatedCode = updateCode(t.parse(code), selection);

  if (!updatedCode.hasCodeChanged) {
    editor.showError(ErrorReason.DidNotFindRedundantElse);
    return;
  }

  await editor.write(updatedCode.code);
}

function updateCode(ast: t.AST, selection: Selection): t.Transformed {
  return t.transformAST(
    ast,
    createVisitor(selection, (path: t.NodePath<t.IfStatement>) => {
      const { node } = path;

      const elseBranch = node.alternate;
      if (!elseBranch) return;

      node.alternate = null;
      path.replaceWithMultiple([node, ...t.getStatements(elseBranch)]);
      path.stop();
    })
  );
}

function createVisitor(
  selection: Selection,
  onMatch: (path: t.NodePath<t.IfStatement>) => void
): t.Visitor {
  return {
    IfStatement(path) {
      const { node } = path;
      if (!selection.isInsideNode(node)) return;

      if (!hasExitStatement(node.consequent)) return;

      const elseBranch = node.alternate;
      if (!elseBranch) return;

      // Since we visit nodes from parent to children, first check
      // if a child would match the selection closer.
      if (hasChildWhichMatchesSelection(path, selection)) return;

      onMatch(path);
    }
  };
}

function hasChildWhichMatchesSelection(
  path: t.NodePath,
  selection: Selection
): boolean {
  let result = false;

  path.traverse({
    IfStatement(childPath) {
      const { node } = childPath;
      if (!selection.isInsidePath(childPath)) return;

      const ifBranch = node.consequent;
      if (!t.isBlockStatement(ifBranch)) return;
      if (!hasExitStatement(ifBranch)) return;

      const elseBranch = node.alternate;
      if (!elseBranch) return;

      result = true;
      childPath.stop();
    }
  });

  return result;
}

function hasExitStatement(node: t.IfStatement["consequent"]): boolean {
  const lastStatement = last(t.getStatements(node));

  return (
    t.isReturnStatement(lastStatement) || t.isThrowStatement(lastStatement)
  );
}
