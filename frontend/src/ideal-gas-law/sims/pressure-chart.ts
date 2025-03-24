import { Chart } from "chart.js";
import { initializeChart } from "../chart.ts";
import { MovingAverage } from "../moving-average.ts";



export class PressureChart {
    private liveAverage: MovingAverage;
    private smoothAverage: MovingAverage;
    private chartData: number[][] = [[], []];
    private chartLabels: number[] = [];
    private chart: Chart;
    private start: number;

    constructor(
        ctx: CanvasRenderingContext2D,
        period: number) {
        this.liveAverage = new MovingAverage(1 / period);
        this.smoothAverage = new MovingAverage(10 / period);
        this.start = Date.now();

        this.chart = initializeChart(ctx, this.chartLabels, this.chartData, ['Live Data', 'Moving Average'], "Pressure ()", "Pressure vs. Time");
    }

    runIter(pressure: number) {
        this.liveAverage.addItem(pressure);
        this.smoothAverage.addItem(pressure);
    }

    update() {
        const timePassed = Date.now() - this.start;
        this.chartLabels.push(Math.round(timePassed / 1000));
        this.chartData[0].push(this.liveAverage.getAverage());
        this.chartData[1].push(this.smoothAverage.getAverage());
        this.chart.update();
    }
}