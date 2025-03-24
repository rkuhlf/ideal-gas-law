class SimChart extends HTMLElement {
    constructor() {
        super();
        this.innerHTML = `
        <div class="sim-chart">
          <canvas id="${this.getAttribute("name")}"></canvas>
        </div>`;
    }
}

customElements.define("sim-chart", SimChart);
