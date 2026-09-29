let display = document.getElementById("display");
let historyDisplay = document.getElementById("historyDisplay");
let historyPanel = document.getElementById("historyPanel");
let historyList = document.getElementById("historyList");

let memory = Number(localStorage.getItem("calculatorMemory")) || 0;
let history = JSON.parse(localStorage.getItem("calculatorHistory")) || [];

function appendValue(value) {

    if (display.value === "0" && value !== ".") {
        display.value = value;
    } else if (display.value === "Error") {
        display.value = value;
    } else {
        display.value += value;
    }
}

function clearDisplay() {
    display.value = "0";
    historyDisplay.textContent = "";
}

function deleteLast() {

    if (display.value === "Error") {
        clearDisplay();
        return;
    }

    display.value = display.value.slice(0, -1);

    if (display.value === "") {
        display.value = "0";
    }
}

function calculate() {

    try {

        let expression = display.value;

        if (!expression) {
            return;
        }

        let result = evaluateExpression(expression);

        if (!Number.isFinite(result)) {
            throw new Error();
        }

        result = formatNumber(result);

        historyDisplay.textContent = expression + " =";
        display.value = result;

        addHistory(expression, result);

    } catch (error) {

        historyDisplay.textContent = "Invalid expression";
        display.value = "Error";

    }
}

function evaluateExpression(expression) {

    expression = expression
        .replace(/π/g, Math.PI)
        .replace(/×/g, "*")
        .replace(/÷/g, "/")
        .replace(/−/g, "-");

    expression = expression.replace(/\^/g, "**");

    if (!/^[0-9+\-*/().\s*]+$/.test(expression)) {
        throw new Error();
    }

    return Function('"use strict"; return (' + expression + ')')();
}

function formatNumber(number) {

    if (Number.isInteger(number)) {
        return number.toString();
    }

    return parseFloat(number.toFixed(10)).toString();
}

function percentage() {

    try {

        let value = Number(display.value);

        if (isNaN(value)) {
            throw new Error();
        }

        display.value = formatNumber(value / 100);

    } catch {
        display.value = "Error";
    }
}

function squareRoot() {

    try {

        let value = Number(display.value);

        if (value < 0 || isNaN(value)) {
            throw new Error();
        }

        let result = Math.sqrt(value);

        historyDisplay.textContent = "√" + value + " =";
        display.value = formatNumber(result);

    } catch {
        display.value = "Error";
    }
}

function square() {

    try {

        let value = Number(display.value);

        if (isNaN(value)) {
            throw new Error();
        }

        let result = value * value;

        historyDisplay.textContent = value + "² =";
        display.value = formatNumber(result);

    } catch {
        display.value = "Error";
    }
}

function reciprocal() {

    try {

        let value = Number(display.value);

        if (value === 0 || isNaN(value)) {
            throw new Error();
        }

        let result = 1 / value;

        historyDisplay.textContent = "1/" + value + " =";
        display.value = formatNumber(result);

    } catch {
        display.value = "Error";
    }
}

function toggleSign() {

    try {

        let value = Number(display.value);

        if (isNaN(value)) {
            throw new Error();
        }

        display.value = formatNumber(value * -1);

    } catch {
        display.value = "Error";
    }
}

function factorial() {

    try {

        let value = Number(display.value);

        if (!Number.isInteger(value) || value < 0 || value > 170) {
            throw new Error();
        }

        let result = 1;

        for (let i = 2; i <= value; i++) {
            result *= i;
        }

        historyDisplay.textContent = value + "! =";
        display.value = formatNumber(result);

    } catch {
        display.value = "Error";
    }
}

function scientificFunction(type) {

    try {

        let value = Number(display.value);

        if (isNaN(value)) {
            throw new Error();
        }

        let result;

        if (type === "sin") {
            result = Math.sin(value * Math.PI / 180);
        }

        if (type === "cos") {
            result = Math.cos(value * Math.PI / 180);
        }

        if (type === "tan") {
            result = Math.tan(value * Math.PI / 180);
        }

        if (type === "log") {
            if (value <= 0) throw new Error();
            result = Math.log10(value);
        }

        if (type === "ln") {
            if (value <= 0) throw new Error();
            result = Math.log(value);
        }

        historyDisplay.textContent = type + "(" + value + ") =";
        display.value = formatNumber(result);

    } catch {
        display.value = "Error";
    }
}

function addHistory(expression, result) {

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

    history.forEach((item) => {

        let div = document.createElement("div");

        div.className = "history-item";

        div.innerHTML =
            '<div class="expression">' +
            item.expression +
            '</div>' +
            '<div class="result">= ' +
            item.result +
            '</div>';

        div.onclick = function () {
            display.value = item.result;
        };

        historyList.appendChild(div);
    });
}

function showHistory() {

    historyPanel.classList.toggle("show");
    renderHistory();
}

function clearHistory() {

    history = [];

    localStorage.removeItem("calculatorHistory");

    renderHistory();
}

function copyResult() {

    if (
        display.value === "Error" ||
        display.value === ""
    ) {
        return;
    }

    navigator.clipboard.writeText(display.value);

    historyDisplay.textContent = "Copied!";
}

function memoryClear() {

    memory = 0;

    localStorage.setItem(
        "calculatorMemory",
        memory
    );

    historyDisplay.textContent = "Memory Cleared";
}

function memoryRecall() {

    display.value = formatNumber(memory);

    historyDisplay.textContent = "Memory Recall";
}

function memoryAdd() {

    let value = Number(display.value);

    if (!isNaN(value)) {

        memory += value;

        localStorage.setItem(
            "calculatorMemory",
            memory
        );

        historyDisplay.textContent = "Added to Memory";
    }
}

function memorySubtract() {

    let value = Number(display.value);

    if (!isNaN(value)) {

        memory -= value;

        localStorage.setItem(
            "calculatorMemory",
            memory
        );

        historyDisplay.textContent = "Subtracted from Memory";
    }
}

function toggleTheme() {

    document.body.classList.toggle("dark");

    let isDark =
        document.body.classList.contains("dark");

    localStorage.setItem(
        "calculatorTheme",
        isDark ? "dark" : "light"
    );

    document.getElementById("themeBtn").textContent =
        isDark ? "☀️" : "🌙";
}

function loadTheme() {

    let theme =
        localStorage.getItem("calculatorTheme");

    if (theme === "dark") {

        document.body.classList.add("dark");

        document.getElementById("themeBtn").textContent =
            "☀️";
    }
}

document.addEventListener("keydown", function(event) {

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

    else if (key === "Enter" || key === "=") {

        event.preventDefault();
        calculate();
    }

    else if (key === "Backspace") {

        deleteLast();
    }

    else if (key === "Escape") {

        clearDisplay();
    }

    else if (key === "%") {

        percentage();
    }

});

loadTheme();
renderHistory();