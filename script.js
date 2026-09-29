let display = document.getElementById("display");
let historyDisplay = document.getElementById("historyDisplay");
let historyPanel = document.getElementById("historyPanel");
let historyList = document.getElementById("historyList");

let memory = Number(localStorage.getItem("calculatorMemory")) || 0;
let history = JSON.parse(localStorage.getItem("calculatorHistory")) || [];

let pendingFunction = null;
let functionMode = false;


/* =========================
   DISPLAY INPUT
========================= */

function appendValue(value) {

    if (display.value === "Error") {
        display.value = "0";
    }

    if (functionMode) {

        if (value === ".") {
            display.value = "0.";
        } else {
            display.value = value;
        }

        functionMode = false;

        if (pendingFunction !== null) {
            autoScientificCalculation();
        }

        return;
    }

    /*
       If a result is already displayed and
       user presses an operator, continue calculation.
    */
    if (
        isResultDisplayed() &&
        isOperator(value)
    ) {
        display.value += value;
        return;
    }

    /*
       If a result is displayed and user enters
       a number, start a new calculation.
    */
    if (
        isResultDisplayed() &&
        !isOperator(value) &&
        value !== "(" &&
        value !== ")"
    ) {
        display.value = value;
        historyDisplay.textContent = "";
        return;
    }

    if (display.value === "0" && value !== ".") {
        display.value = value;
    } else {
        display.value += value;
    }

    autoExpressionCalculation();
}


/* =========================
   CHECK RESULT
========================= */

function isResultDisplayed() {

    if (display.value === "Error") {
        return false;
    }

    return (
        historyDisplay.textContent.includes("=") &&
        pendingFunction === null
    );
}


/* =========================
   OPERATORS
========================= */

function isOperator(value) {

    return (
        value === "+" ||
        value === "-" ||
        value === "*" ||
        value === "/" ||
        value === "^"
    );
}


/* =========================
   CLEAR
========================= */

function clearDisplay() {

    display.value = "0";
    historyDisplay.textContent = "";

    pendingFunction = null;
    functionMode = false;
}


/* =========================
   DELETE
========================= */

function deleteLast() {

    if (display.value === "Error") {
        clearDisplay();
        return;
    }

    display.value =
        display.value.slice(0, -1);

    if (display.value === "") {
        display.value = "0";
    }

    historyDisplay.textContent = "";

    autoExpressionCalculation();
}


/* =========================
   NORMAL CALCULATION
========================= */

function calculate() {

    try {

        if (pendingFunction !== null) {

            autoScientificCalculation();
            return;
        }

        let expression = display.value;

        if (!expression) {
            return;
        }

        let result =
            evaluateExpression(expression);

        if (!Number.isFinite(result)) {
            throw new Error();
        }

        result = formatNumber(result);

        historyDisplay.textContent =
            expression + " =";

        display.value = result;

        addHistory(
            expression,
            result
        );

    } catch {

        historyDisplay.textContent =
            "Invalid expression";

        display.value = "Error";

        pendingFunction = null;
        functionMode = false;
    }
}


/* =========================
   AUTO NORMAL CALCULATION
========================= */

function autoExpressionCalculation() {

    let expression = display.value;

    if (!expression) {
        return;
    }

    /*
       Don't calculate incomplete expressions.
    */

    if (
        expression.endsWith("+") ||
        expression.endsWith("-") ||
        expression.endsWith("*") ||
        expression.endsWith("/") ||
        expression.endsWith("^") ||
        expression.endsWith("(")
    ) {
        return;
    }

    /*
       Don't calculate if expression has
       unbalanced brackets.
    */

    let open =
        (expression.match(/\(/g) || []).length;

    let close =
        (expression.match(/\)/g) || []).length;

    if (open !== close) {
        return;
    }

    /*
       Only auto calculate expressions
       containing an operator.
    */

    if (
        !expression.includes("+") &&
        !expression.includes("-") &&
        !expression.includes("*") &&
        !expression.includes("/") &&
        !expression.includes("^")
    ) {
        return;
    }

    try {

        let result =
            evaluateExpression(expression);

        if (!Number.isFinite(result)) {
            return;
        }

        result = formatNumber(result);

        historyDisplay.textContent =
            expression + " =";

        display.value = result;

    } catch {

        /*
           Do nothing while user is typing
           an incomplete/invalid expression.
        */
    }
}


/* =========================
   EXPRESSION EVALUATION
========================= */

function evaluateExpression(expression) {

    expression = expression
        .replace(/π/g, Math.PI)
        .replace(/×/g, "*")
        .replace(/÷/g, "/")
        .replace(/−/g, "-");

    expression =
        expression.replace(/\^/g, "**");

    if (
        !/^[0-9+\-*/().\s*]+$/.test(expression)
    ) {
        throw new Error();
    }

    return Function(
        '"use strict"; return (' +
        expression +
        ')'
    )();
}


/* =========================
   FORMAT NUMBER
========================= */

function formatNumber(number) {

    if (Number.isInteger(number)) {
        return number.toString();
    }

    return parseFloat(
        number.toFixed(10)
    ).toString();
}


/* =========================
   PERCENTAGE
========================= */

function percentage() {

    try {

        let value =
            Number(display.value);

        if (isNaN(value)) {
            throw new Error();
        }

        let result =
            value / 100;

        historyDisplay.textContent =
            value + "% =";

        display.value =
            formatNumber(result);

        addHistory(
            value + "%",
            formatNumber(result)
        );

    } catch {

        display.value = "Error";
    }
}


/* =========================
   SQUARE ROOT
========================= */

function squareRoot() {

    if (
        display.value !== "0" &&
        display.value !== ""
    ) {

        let value =
            Number(display.value);

        if (!isNaN(value)) {

            try {

                if (value < 0) {
                    throw new Error();
                }

                let result =
                    Math.sqrt(value);

                historyDisplay.textContent =
                    "√" + value + " =";

                display.value =
                    formatNumber(result);

                addHistory(
                    "√" + value,
                    formatNumber(result)
                );

                return;

            } catch {

                display.value = "Error";
                return;
            }
        }
    }

    pendingFunction = "sqrt";
    functionMode = true;

    historyDisplay.textContent =
        "√";
}


/* =========================
   SQUARE
========================= */

function square() {

    if (
        display.value !== "0" &&
        display.value !== ""
    ) {

        let value =
            Number(display.value);

        if (!isNaN(value)) {

            let result =
                value * value;

            historyDisplay.textContent =
                value + "² =";

            display.value =
                formatNumber(result);

            addHistory(
                value + "²",
                formatNumber(result)
            );

            return;
        }
    }

    pendingFunction = "square";
    functionMode = true;

    historyDisplay.textContent =
        "x²";
}


/* =========================
   RECIPROCAL
========================= */

function reciprocal() {

    if (
        display.value !== "0" &&
        display.value !== ""
    ) {

        let value =
            Number(display.value);

        if (!isNaN(value)) {

            if (value === 0) {
                display.value = "Error";
                return;
            }

            let result =
                1 / value;

            historyDisplay.textContent =
                "1/" + value + " =";

            display.value =
                formatNumber(result);

            addHistory(
                "1/" + value,
                formatNumber(result)
            );

            return;
        }
    }

    pendingFunction = "reciprocal";
    functionMode = true;

    historyDisplay.textContent =
        "1/x";
}


/* =========================
   FACTORIAL
========================= */

function factorial() {

    if (
        display.value !== "0" &&
        display.value !== ""
    ) {

        let value =
            Number(display.value);

        if (!isNaN(value)) {

            try {

                let result =
                    calculateFactorial(value);

                historyDisplay.textContent =
                    value + "! =";

                display.value =
                    formatNumber(result);

                addHistory(
                    value + "!",
                    formatNumber(result)
                );

                return;

            } catch {

                display.value = "Error";
                return;
            }
        }
    }

    pendingFunction = "factorial";
    functionMode = true;

    historyDisplay.textContent =
        "n!";
}


/* =========================
   SCIENTIFIC FUNCTIONS
========================= */

function scientificFunction(type) {

    if (
        display.value !== "0" &&
        display.value !== ""
    ) {

        let value =
            Number(display.value);

        if (!isNaN(value)) {

            try {

                let result =
                    applyFunction(
                        type,
                        value
                    );

                if (!Number.isFinite(result)) {
                    throw new Error();
                }

                let expression =
                    getFunctionText(
                        type,
                        value
                    );

                result =
                    formatNumber(result);

                historyDisplay.textContent =
                    expression + " =";

                display.value =
                    result;

                addHistory(
                    expression,
                    result
                );

                return;

            } catch {

                display.value = "Error";
                return;
            }
        }
    }

    pendingFunction = type;
    functionMode = true;

    historyDisplay.textContent =
        type;
}


/* =========================
   AUTO SCIENTIFIC CALCULATION
========================= */

function autoScientificCalculation() {

    if (pendingFunction === null) {
        return;
    }

    let value =
        Number(display.value);

    if (isNaN(value)) {
        return;
    }

    try {

        let result =
            applyFunction(
                pendingFunction,
                value
            );

        if (!Number.isFinite(result)) {
            throw new Error();
        }

        let expression =
            getFunctionText(
                pendingFunction,
                value
            );

        result =
            formatNumber(result);

        historyDisplay.textContent =
            expression + " =";

        display.value =
            result;

        addHistory(
            expression,
            result
        );

        pendingFunction = null;
        functionMode = false;

    } catch {

        display.value = "Error";

        pendingFunction = null;
        functionMode = false;
    }
}


/* =========================
   APPLY FUNCTION
========================= */

function applyFunction(type, value) {

    if (type === "sqrt") {

        if (value < 0) {
            throw new Error();
        }

        return Math.sqrt(value);
    }

    if (type === "square") {
        return value * value;
    }

    if (type === "reciprocal") {

        if (value === 0) {
            throw new Error();
        }

        return 1 / value;
    }

    if (type === "sin") {

        return Math.sin(
            value * Math.PI / 180
        );
    }

    if (type === "cos") {

        return Math.cos(
            value * Math.PI / 180
        );
    }

    if (type === "tan") {

        return Math.tan(
            value * Math.PI / 180
        );
    }

    if (type === "log") {

        if (value <= 0) {
            throw new Error();
        }

        return Math.log10(value);
    }

    if (type === "ln") {

        if (value <= 0) {
            throw new Error();
        }

        return Math.log(value);
    }

    if (type === "factorial") {
        return calculateFactorial(value);
    }

    throw new Error();
}


/* =========================
   FACTORIAL CALCULATION
========================= */

function calculateFactorial(value) {

    if (
        !Number.isInteger(value) ||
        value < 0 ||
        value > 170
    ) {
        throw new Error();
    }

    let result = 1;

    for (
        let i = 2;
        i <= value;
        i++
    ) {
        result *= i;
    }

    return result;
}


/* =========================
   FUNCTION TEXT
========================= */

function getFunctionText(type, value) {

    if (type === "sqrt") {
        return "√" + value;
    }

    if (type === "square") {
        return value + "²";
    }

    if (type === "reciprocal") {
        return "1/" + value;
    }

    if (type === "sin") {
        return "sin(" + value + ")";
    }

    if (type === "cos") {
        return "cos(" + value + ")";
    }

    if (type === "tan") {
        return "tan(" + value + ")";
    }

    if (type === "log") {
        return "log(" + value + ")";
    }

    if (type === "ln") {
        return "ln(" + value + ")";
    }

    if (type === "factorial") {
        return value + "!";
    }

    return value;
}


/* =========================
   SIGN
========================= */

function toggleSign() {

    try {

        let value =
            Number(display.value);

        if (isNaN(value)) {
            throw new Error();
        }

        display.value =
            formatNumber(
                value * -1
            );

        functionMode = false;

        autoExpressionCalculation();

    } catch {

        display.value = "Error";
    }
}


/* =========================
   HISTORY
========================= */

function addHistory(
    expression,
    result
) {

    history.unshift({
        expression: expression,
        result: result
    });

    if (history.length > 20) {
        history.pop();
    }

    localStorage.setItem(
        "calculatorHistory",
        JSON.stringify(history)
    );

    renderHistory();
}


function renderHistory() {

    if (history.length === 0) {

        historyList.innerHTML =
            '<p class="empty-history">No calculations yet.</p>';

        return;
    }

    historyList.innerHTML = "";

    history.forEach(function(item) {

        let div =
            document.createElement("div");

        div.className =
            "history-item";

        div.innerHTML =
            '<div class="expression">' +
            item.expression +
            '</div>' +
            '<div class="result">= ' +
            item.result +
            '</div>';

        div.onclick = function() {
            display.value =
                item.result;

            historyDisplay.textContent =
                "";
        };

        historyList.appendChild(div);
    });
}


function showHistory() {

    historyPanel.classList.toggle(
        "show"
    );

    renderHistory();
}


function clearHistory() {

    history = [];

    localStorage.removeItem(
        "calculatorHistory"
    );

    renderHistory();
}


/* =========================
   COPY
========================= */

function copyResult() {

    if (
        display.value === "Error" ||
        display.value === ""
    ) {
        return;
    }

    navigator.clipboard.writeText(
        display.value
    );

    historyDisplay.textContent =
        "Copied!";
}


/* =========================
   MEMORY
========================= */

function memoryClear() {

    memory = 0;

    localStorage.setItem(
        "calculatorMemory",
        memory
    );

    historyDisplay.textContent =
        "Memory Cleared";
}


function memoryRecall() {

    display.value =
        formatNumber(memory);

    historyDisplay.textContent =
        "Memory Recall";
}


function memoryAdd() {

    let value =
        Number(display.value);

    if (!isNaN(value)) {

        memory += value;

        localStorage.setItem(
            "calculatorMemory",
            memory
        );

        historyDisplay.textContent =
            "Added to Memory";
    }
}


function memorySubtract() {

    let value =
        Number(display.value);

    if (!isNaN(value)) {

        memory -= value;

        localStorage.setItem(
            "calculatorMemory",
            memory
        );

        historyDisplay.textContent =
            "Subtracted from Memory";
    }
}


/* =========================
   THEME
========================= */

function toggleTheme() {

    document.body.classList.toggle(
        "dark"
    );

    let isDark =
        document.body.classList.contains(
            "dark"
        );

    localStorage.setItem(
        "calculatorTheme",
        isDark ? "dark" : "light"
    );

    document.getElementById(
        "themeBtn"
    ).textContent =
        isDark ? "☀️" : "🌙";
}


function loadTheme() {

    let theme =
        localStorage.getItem(
            "calculatorTheme"
        );

    if (theme === "dark") {

        document.body.classList.add(
            "dark"
        );

        document.getElementById(
            "themeBtn"
        ).textContent = "☀️";

    } else {

        document.body.classList.remove(
            "dark"
        );

        document.getElementById(
            "themeBtn"
        ).textContent = "🌙";
    }
}


/* =========================
   KEYBOARD
========================= */

document.addEventListener(
    "keydown",
    function(event) {

        let key = event.key;

        if (
            (key >= "0" && key <= "9") ||
            key === "." ||
            key === "+" ||
            key === "-" ||
            key === "*" ||
            key === "/" ||
            key === "(" ||
            key === ")" ||
            key === "^"
        ) {

            appendValue(key);
        }

        else if (
            key === "Enter" ||
            key === "="
        ) {

            event.preventDefault();

            calculate();
        }

        else if (
            key === "Backspace"
        ) {

            deleteLast();
        }

        else if (
            key === "Escape"
        ) {

            clearDisplay();
        }

        else if (
            key === "%"
        ) {

            percentage();
        }
    }
);


/* =========================
   START
========================= */

loadTheme();
renderHistory();