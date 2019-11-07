import { commandKey } from "./command";
import { findNegatableExpression } from "./negate-expression";

import { Code } from "../../editor/editor";
import { Selection } from "../../editor/selection";
import { RefactoringWithActionProvider } from "../../types";

const config: RefactoringWithActionProvider = {
  commandKey,
  title: "Negate Expression",
  actionProviderMessage: "Negate the expression",

  canPerformRefactoring(code: Code, selection: Selection) {
    const expression = findNegatableExpression(code, selection);

    this.actionProviderMessage = "Negate the expression";
    if (expression && expression.negatedOperator) {
      this.actionProviderMessage += ` (use ${
        expression.negatedOperator
      } instead)`;
    }

    return Boolean(expression);
  }
};

export default config;
