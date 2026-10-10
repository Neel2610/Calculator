// Calculator display elements
const display = document.querySelector("#display");
const previousDisplay = document.querySelector("#previous-display");
const message = document.querySelector("#message");
const buttons = document.querySelectorAll("button");

// Calculator operation variables
let firstNumber = null;
let operator = null;
let secondNumber = null;

// Input and calculation state
let shouldResetDisplay = false;
let hasResult = false;
let lastOperator = null;
let lastOperand = null;

// Basic math functions
function add(a, b) {
    return a + b;
}

function subtract(a, b) {
    return a - b;
}

function multiply(a, b) {
    return a * b;
}

function divide(a, b) {
    if (b === 0) {
        throw new Error("Nice try! You can't divide by zero.");
    }

    return a / b;
}

// Perform the selected operation
function operate(operator, a, b) {
    switch (operator) {
        case "+":
            return add(a, b);

        case "-":
            return subtract(a, b);

        case "*":
            return multiply(a, b);

        case "/":
            return divide(a, b);

        default:
            return null;
    }
}

// Convert long floating-point results into readable numbers
function formatNumber(number) {
    if (!Number.isFinite(number)) {
        return "Error";
    }

    // Avoid displaying -0
    if (Object.is(number, -0) || Math.abs(number) < 1e-12) {
        return "0";
    }

    // Round to a maximum of 10 significant digits
    const rounded = Number(number.toPrecision(10));

    return String(rounded);
}

// Update the main display
function updateDisplay(value = display.textContent) {
    display.textContent = value;

    // Scale long numbers to fit the display
    let fontSize = "2.8rem";

    if (value.length > 12) {
        fontSize = "1.6rem";
    } else if (value.length > 9) {
        fontSize = "2rem";
    } else if (value.length > 7) {
        fontSize = "2.4rem";
    }

    display.style.fontSize = fontSize;
}

// Display messages
function showMessage(text = "") {
    message.textContent = text;
}

// Remove the active styling from operators
function clearActiveOperator() {
    document.querySelectorAll("[data-operator]").forEach(button => {
        button.classList.remove("active");
    });
}

// Highlight the currently selected operator
function highlightOperator(selectedOperator) {
    clearActiveOperator();

    document.querySelectorAll("[data-operator]").forEach(button => {
        if (button.dataset.operator === selectedOperator) {
            button.classList.add("active");
        }
    });
}

// Get the current displayed number
function getCurrentNumber() {
    return Number(display.textContent);
}

// Input a digit
function inputDigit(digit) {
    showMessage();

    if (display.textContent === "Error") {
        clearCalculator();
    }

    // A new digit after a result starts a fresh calculation
    if (shouldResetDisplay || hasResult) {
        display.textContent = digit;
        shouldResetDisplay = false;
        hasResult = false;
    } else if (display.textContent === "0") {
        display.textContent = digit;
    } else if (display.textContent === "-0") {
        display.textContent = "-" + digit;
    } else if (display.textContent.length < 16) {
        display.textContent += digit;
    }

    updateDisplay();
}

// Input a decimal point
function inputDecimal() {
    showMessage();

    if (display.textContent === "Error") {
        clearCalculator();
    }

    if (shouldResetDisplay || hasResult) {
        display.textContent = "0.";
        shouldResetDisplay = false;
        hasResult = false;
    } else if (!display.textContent.includes(".")) {
        display.textContent += ".";
    }

    updateDisplay();
}

// Calculate the current pair of numbers
function calculate() {
    if (operator === null || firstNumber === null) {
        return null;
    }

    secondNumber = getCurrentNumber();

    try {
        const result = operate(operator, firstNumber, secondNumber);

        if (result === null || !Number.isFinite(result)) {
            throw new Error("That result is too large to calculate.");
        }

        return result;
    } catch (error) {
        showMessage(error.message);
        updateDisplay("Error");

        firstNumber = null;
        secondNumber = null;
        operator = null;
        lastOperator = null;
        lastOperand = null;
        shouldResetDisplay = true;
        hasResult = false;

        previousDisplay.textContent = "";
        clearActiveOperator();

        return null;
    }
}

// Handle operator button presses
function chooseOperator(nextOperator) {
    showMessage();

    if (display.textContent === "Error") {
        return;
    }

    const currentNumber = getCurrentNumber();

    // If an operator is pressed twice consecutively,
    // keep the number and use the latest operator.
    if (operator !== null && shouldResetDisplay) {
        operator = nextOperator;
        highlightOperator(operator);
        previousDisplay.textContent =
            `${formatNumber(firstNumber)} ${operator}`;
        return;
    }

    // Evaluate the previous pair before accepting
    // another operator: e.g. 12 + 7 - 1.
    if (operator !== null && !hasResult) {
        const result = calculate();

        if (result === null) {
            return;
        }

        firstNumber = result;
        updateDisplay(formatNumber(result));
    } else {
        firstNumber = currentNumber;
    }

    operator = nextOperator;
    secondNumber = null;
    lastOperator = null;
    lastOperand = null;

    hasResult = false;
    shouldResetDisplay = true;

    previousDisplay.textContent =
        `${formatNumber(firstNumber)} ${operator}`;

    highlightOperator(operator);
}

// Handle the equals button
function calculateEquals() {
    showMessage();

    if (display.textContent === "Error") {
        return;
    }

    // Do nothing if the user hasn't entered a complete operation.
    if (operator === null || firstNumber === null || shouldResetDisplay) {
        // Repeated equals uses the previous operation again.
        if (hasResult && lastOperator !== null && lastOperand !== null) {
            firstNumber = getCurrentNumber();
            operator = lastOperator;
            secondNumber = lastOperand;

            const result = operate(operator, firstNumber, secondNumber);

            if (!Number.isFinite(result)) {
                showMessage("That result is too large to calculate.");
                return;
            }

            previousDisplay.textContent =
                `${formatNumber(firstNumber)} ${operator} ${formatNumber(secondNumber)} =`;

            updateDisplay(formatNumber(result));
            firstNumber = result;
            operator = null;
            secondNumber = null;
            shouldResetDisplay = true;
            hasResult = true;
            clearActiveOperator();
            return;
        }

        return;
    }

    const operation = operator;
    const operandA = firstNumber;
    const operandB = getCurrentNumber();

    const result = calculate();

    if (result === null) {
        return;
    }

    // Store the operation for repeated equals
    lastOperator = operation;
    lastOperand = operandB;

    previousDisplay.textContent =
        `${formatNumber(operandA)} ${operation} ${formatNumber(operandB)} =`;

    updateDisplay(formatNumber(result));

    firstNumber = result;
    secondNumber = null;
    operator = null;

    shouldResetDisplay = true;
    hasResult = true;

    clearActiveOperator();
}

// Clear all calculator state
function clearCalculator() {
    firstNumber = null;
    secondNumber = null;
    operator = null;

    shouldResetDisplay = false;
    hasResult = false;

    lastOperator = null;
    lastOperand = null;

    display.textContent = "0";
    previousDisplay.textContent = "";

    updateDisplay();
    showMessage();
    clearActiveOperator();
}

// Backspace: remove the last typed character
function backspace() {
    showMessage();

    if (display.textContent === "Error") {
        clearCalculator();
        return;
    }

    // Do not edit a completed result; start fresh instead.
    if (hasResult || shouldResetDisplay) {
        if (hasResult) {
            clearCalculator();
        }
        return;
    }

    let value = display.textContent;

    if (value.length <= 1 || (value.length === 2 && value.startsWith("-"))) {
        value = "0";
    } else {
        value = value.slice(0, -1);
    }

    display.textContent = value;
    updateDisplay();
}

// Change the sign of the displayed number
function changeSign() {
    showMessage();

    if (display.textContent === "Error") {
        return;
    }

    if (shouldResetDisplay || hasResult) {
        shouldResetDisplay = false;
        hasResult = false;
    }

    const current = getCurrentNumber();

    if (current === 0) {
        return;
    }

    display.textContent = formatNumber(-current);
    updateDisplay();
}

// Button click handling
buttons.forEach(button => {
    button.addEventListener("click", () => {
        if (button.dataset.number !== undefined) {
            inputDigit(button.dataset.number);
            return;
        }

        if (button.dataset.operator !== undefined) {
            chooseOperator(button.dataset.operator);
            return;
        }

        switch (button.dataset.action) {
            case "clear":
                clearCalculator();
                break;

            case "backspace":
                backspace();
                break;

            case "decimal":
                inputDecimal();
                break;

            case "equals":
                calculateEquals();
                break;

            case "sign":
                changeSign();
                break;
        }
    });
});

// Keyboard support
document.addEventListener("keydown", event => {
    const key = event.key;

    if (/^[0-9]$/.test(key)) {
        inputDigit(key);
    } else if (key === ".") {
        inputDecimal();
    } else if (key === "+") {
        chooseOperator("+");
    } else if (key === "-") {
        chooseOperator("-");
    } else if (key === "*") {
        chooseOperator("*");
    } else if (key === "/") {
        event.preventDefault();
        chooseOperator("/");
    } else if (key === "Enter" || key === "=") {
        event.preventDefault();
        calculateEquals();
    } else if (key === "Backspace") {
        backspace();
    } else if (key === "Escape" || key === "Delete") {
        clearCalculator();
    }
});

// Initial display
updateDisplay("0");