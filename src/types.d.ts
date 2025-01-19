import * as _chart from 'chart.js';
export = _chart.Chart;
export as namespace Chart;

declare module 'https://cdn.jsdelivr.net/npm/chart.js' {
    export * from 'chart.js';
}
