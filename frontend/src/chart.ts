// Auto so that all kinds of charts are registered and we don't rely on tree-shaking.
import { Chart } from "chart.js/auto";

export function initializeChart(ctx: CanvasRenderingContext2D, labels: number[], datasets: number[][], legend: string[], yLabel: string, title: string): Chart {
  const colors = [
    [0, 0, 255],
    [200, 50, 50],
    [50, 200, 50],
  ]
  const datasetsWithSettings = datasets.map((data: number[], i: number) => {
    return {
      label: legend[i],
      data: data, // Initial empty data
      borderColor: `rgb(${colors[i][0]}, ${colors[i][1]}, ${colors[i][2]})`,
      backgroundColor: `rgba(${colors[i][0]}, ${colors[i][1]}, ${colors[i][2]}, 0.1)`,
      borderWidth: 2,
    }
  });

  return new Chart(ctx, {
    type: 'line', // Line chart
    data: {
      labels: labels, // X-axis labels (e.g., timestamps)
      datasets: datasetsWithSettings
    },
    options: {
      animation: false,
      plugins: {
        title: {
          display: true, // Show the title
          text: title, // Title text
          font: {
            size: 18 // Font size for the title
          },
          padding: {
            top: 10,
            bottom: 10 // Padding around the title
          },
          color: 'black' // Title color
        },
      },
      scales: {
        x: {
          title: {
            display: true,
            text: 'Time (s)'
          }
        },
        y: {
          title: {
            display: true,
            text: yLabel,
          },
          min: 0,
        }
      },
      responsive: true,
      maintainAspectRatio: false
    }
  });
}
