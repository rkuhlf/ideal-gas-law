class MathJax extends HTMLElement {
    constructor() {
        super();
        // Wrap the inner html in a span with class math.
        this.innerHTML = `<span class="math">${this.innerHTML}</span>`;
    }
}

class MathBlock extends HTMLElement {
    constructor() {
        super();
        // Wrap the inner html in a div with class math.
        this.innerHTML = `<div class="math">${this.innerHTML}</div>`;
    }
}

customElements.define("math-block", MathBlock);


customElements.define("math-span", MathJax);
