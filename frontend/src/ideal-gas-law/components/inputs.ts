class LabeledInput extends HTMLElement {
    constructor() {
        super();
        this.innerHTML = `
        <div class="input-row">
            <label for="${this.getAttribute("name")}">${this.getAttribute("label")}</label>
            <input type="${this.getAttribute("type") || "number"}" id="${this.getAttribute("name")}" name="${this.getAttribute("name")}">
        </div>`;
    }
}

customElements.define("labeled-input", LabeledInput);
