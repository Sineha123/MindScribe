let barChartInstance = null;
let pieChartInstance = null;

function destroyCharts() {
  if (barChartInstance) {
    barChartInstance.destroy();
    barChartInstance = null;
  }

  if (pieChartInstance) {
    pieChartInstance.destroy();
    pieChartInstance = null;
  }
}

export function renderKeywordCharts(keywords) {
  const barCanvas = document.getElementById("barChart");
  const pieCanvas = document.getElementById("pieChart");

  if (!barCanvas || !pieCanvas || !window.Chart) {
    return;
  }

  destroyCharts();

  const labels = Object.keys(keywords || {});
  const values = Object.values(keywords || {});

  if (labels.length === 0 || values.length === 0) {
    return;
  }

  const palette = [
    "#c4672d",
    "#2d7b57",
    "#7a5cfa",
    "#e0a33a",
    "#d85d74",
    "#4f88c6",
    "#8e4318",
    "#5f7f2b"
  ];

  barChartInstance = new window.Chart(barCanvas, {
    type: "bar",
    data: {
      labels,
      datasets: [
        {
          label: "Keyword Frequency",
          data: values,
          backgroundColor: "rgba(196, 103, 45, 0.75)",
          borderColor: "#8e4318",
          borderWidth: 1,
          borderRadius: 8
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: {
          display: true,
          text: "Keyword Frequency"
        },
        tooltip: {
          enabled: true
        }
      },
      scales: {
        x: {
          title: {
            display: true,
            text: "Keywords"
          }
        },
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: "Count"
          }
        }
      }
    }
  });

  pieChartInstance = new window.Chart(pieCanvas, {
    type: "pie",
    data: {
      labels,
      datasets: [
        {
          data: values,
          backgroundColor: labels.map((_, index) => palette[index % palette.length]),
          borderColor: "#fffaf1",
          borderWidth: 2
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: {
          display: true,
          text: "Keyword Distribution"
        },
        tooltip: {
          enabled: true
        }
      }
    }
  });
}
