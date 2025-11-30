/**
 * Form Logic Engine - Handles conditional logic, branching, and lead qualification
 * Provides Typeform-like conditional routing functionality
 */

/**
 * Evaluate a single condition based on operator
 * @param {any} actualValue - The actual response value
 * @param {string} operator - The comparison operator
 * @param {any} expectedValue - The expected value to compare against
 * @returns {boolean} - Whether the condition is met
 */
export function evaluateCondition(actualValue, operator, expectedValue) {
  // Handle null/undefined cases
  if (actualValue === null || actualValue === undefined) {
    return operator === 'is_empty';
  }

  switch (operator) {
    case 'equals':
      return String(actualValue).toLowerCase() === String(expectedValue).toLowerCase();

    case 'not_equals':
      return String(actualValue).toLowerCase() !== String(expectedValue).toLowerCase();

    case 'contains':
      if (Array.isArray(actualValue)) {
        return actualValue.some(v =>
          String(v).toLowerCase().includes(String(expectedValue).toLowerCase())
        );
      }
      return String(actualValue).toLowerCase().includes(String(expectedValue).toLowerCase());

    case 'not_contains':
      if (Array.isArray(actualValue)) {
        return !actualValue.some(v =>
          String(v).toLowerCase().includes(String(expectedValue).toLowerCase())
        );
      }
      return !String(actualValue).toLowerCase().includes(String(expectedValue).toLowerCase());

    case 'greater_than':
      return Number(actualValue) > Number(expectedValue);

    case 'less_than':
      return Number(actualValue) < Number(expectedValue);

    case 'greater_than_or_equal':
      return Number(actualValue) >= Number(expectedValue);

    case 'less_than_or_equal':
      return Number(actualValue) <= Number(expectedValue);

    case 'is_empty':
      if (Array.isArray(actualValue)) return actualValue.length === 0;
      return !actualValue || String(actualValue).trim() === '';

    case 'is_not_empty':
      if (Array.isArray(actualValue)) return actualValue.length > 0;
      return actualValue && String(actualValue).trim() !== '';

    case 'starts_with':
      return String(actualValue).toLowerCase().startsWith(String(expectedValue).toLowerCase());

    case 'ends_with':
      return String(actualValue).toLowerCase().endsWith(String(expectedValue).toLowerCase());

    default:
      console.warn(`Unknown operator: ${operator}`);
      return false;
  }
}

/**
 * Evaluate conditional logic rules for a question
 * @param {Object} question - The question object with conditional_logic
 * @param {Object} responses - All current form responses
 * @param {Array} allQuestions - All questions in the form
 * @returns {Object} - { shouldSkip: boolean, nextQuestionId: string|null, action: string }
 */
export function evaluateQuestionLogic(question, responses, allQuestions) {
  // If no conditional logic, proceed normally
  if (!question.conditional_logic || question.conditional_logic.length === 0) {
    return { shouldSkip: false, nextQuestionId: null, action: 'continue' };
  }

  // Evaluate each rule in order (first match wins)
  for (const rule of question.conditional_logic) {
    const { condition, thenGoTo, action = 'jump' } = rule;

    // Handle different rule types
    if (condition) {
      // New format: {field, operator, value}
      const actualValue = responses[condition.field];
      const conditionMet = evaluateCondition(actualValue, condition.operator, condition.value);

      if (conditionMet) {
        return {
          shouldSkip: false,
          nextQuestionId: thenGoTo,
          action: action // 'jump', 'disqualify', 'thank_you', etc.
        };
      }
    } else if (rule.question && rule.operator && rule.value !== undefined) {
      // Old format: backward compatibility
      const actualValue = responses[rule.question];
      const conditionMet = evaluateCondition(actualValue, rule.operator, rule.value);

      if (conditionMet) {
        return {
          shouldSkip: false,
          nextQuestionId: rule.thenGoTo,
          action: 'jump'
        };
      }
    }
  }

  // No conditions met, proceed normally
  return { shouldSkip: false, nextQuestionId: null, action: 'continue' };
}

/**
 * Get the next question in the form flow
 * @param {number} currentIndex - Current question index
 * @param {Array} questions - All questions
 * @param {Object} responses - Current responses
 * @returns {Object} - { nextIndex: number, action: string, questionId: string }
 */
export function getNextQuestion(currentIndex, questions, responses) {
  if (currentIndex >= questions.length - 1) {
    return { nextIndex: -1, action: 'submit', questionId: null };
  }

  const currentQuestion = questions[currentIndex];
  const logicResult = evaluateQuestionLogic(currentQuestion, responses, questions);

  // Handle different actions
  if (logicResult.action === 'disqualify') {
    return { nextIndex: -2, action: 'disqualify', questionId: null };
  }

  if (logicResult.action === 'thank_you' || logicResult.action === 'submit') {
    return { nextIndex: -1, action: 'submit', questionId: null };
  }

  // Handle jump to specific question
  if (logicResult.nextQuestionId) {
    const targetIndex = questions.findIndex(q => q.id === logicResult.nextQuestionId);
    if (targetIndex !== -1) {
      return { nextIndex: targetIndex, action: 'jump', questionId: logicResult.nextQuestionId };
    }
  }

  // Default: next question in sequence
  return { nextIndex: currentIndex + 1, action: 'continue', questionId: questions[currentIndex + 1]?.id };
}

/**
 * Calculate lead qualification score
 * @param {Array} questions - All questions
 * @param {Object} responses - User responses
 * @returns {Object} - { total: number, breakdown: Object, qualified: boolean }
 */
export function calculateLeadScore(questions, responses) {
  let total = 0;
  const breakdown = {};

  questions.forEach(question => {
    if (!question.lead_scoring_enabled || !question.lead_scoring) {
      return;
    }

    const response = responses[question.id];
    if (response === undefined || response === null) {
      return;
    }

    let questionScore = 0;

    if (Array.isArray(response)) {
      // Multiple selections (checkboxes)
      response.forEach(value => {
        const score = question.lead_scoring[value] || 0;
        questionScore += score;
      });
    } else {
      // Single selection
      const scoreKey = question.type === 'rating' ? `rating-${response}` : response;
      questionScore = question.lead_scoring[scoreKey] || 0;
    }

    if (questionScore !== 0) {
      breakdown[question.id] = {
        title: question.title,
        score: questionScore,
        response: response
      };
    }

    total += questionScore;
  });

  return {
    total,
    breakdown,
    qualified: total > 0 // Can be customized with threshold
  };
}

/**
 * Build a visual map of form flow for debugging/display
 * @param {Array} questions - All questions
 * @returns {Object} - Flow map showing connections
 */
export function buildFormFlowMap(questions) {
  const flowMap = {};

  questions.forEach((question, index) => {
    flowMap[question.id] = {
      index,
      title: question.title,
      type: question.type,
      nextDefault: questions[index + 1]?.id || 'END',
      conditionalPaths: []
    };

    if (question.conditional_logic && question.conditional_logic.length > 0) {
      question.conditional_logic.forEach(rule => {
        const target = rule.thenGoTo || rule.nextQuestionId;
        if (target) {
          flowMap[question.id].conditionalPaths.push({
            condition: rule.condition || {
              field: rule.question,
              operator: rule.operator,
              value: rule.value
            },
            target,
            action: rule.action || 'jump'
          });
        }
      });
    }
  });

  return flowMap;
}

/**
 * Validate form logic configuration
 * @param {Array} questions - All questions
 * @returns {Object} - { valid: boolean, errors: Array }
 */
export function validateFormLogic(questions) {
  const errors = [];
  const questionIds = new Set(questions.map(q => q.id));

  questions.forEach((question, index) => {
    if (!question.conditional_logic || question.conditional_logic.length === 0) {
      return;
    }

    question.conditional_logic.forEach((rule, ruleIndex) => {
      // Check if target question exists
      if (rule.thenGoTo && !questionIds.has(rule.thenGoTo)) {
        errors.push({
          questionId: question.id,
          questionIndex: index,
          ruleIndex,
          error: `Target question "${rule.thenGoTo}" does not exist`
        });
      }

      // Check for circular references (basic check)
      if (rule.thenGoTo === question.id) {
        errors.push({
          questionId: question.id,
          questionIndex: index,
          ruleIndex,
          error: 'Circular reference: Question cannot jump to itself'
        });
      }

      // Check if condition references valid question
      const conditionField = rule.condition?.field || rule.question;
      if (conditionField && !questionIds.has(conditionField)) {
        errors.push({
          questionId: question.id,
          questionIndex: index,
          ruleIndex,
          error: `Condition references non-existent question "${conditionField}"`
        });
      }
    });
  });

  return {
    valid: errors.length === 0,
    errors
  };
}

export default {
  evaluateCondition,
  evaluateQuestionLogic,
  getNextQuestion,
  calculateLeadScore,
  buildFormFlowMap,
  validateFormLogic
};
