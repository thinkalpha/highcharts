//*
Highcharts.chart('container-1', {
    chart: {
        type: 'column'
    },
    xAxis: {
        categories: ['Apples', 'Pears', 'Bananas', 'Oranges']
    },
    accessibility: {
        enabled: false
    },
    title: {
        text: 'Highcharts with rounded corners'
    },
    plotOptions: {
        series: {
            _borderRadius: {
                radius: '20px',
                scope: 'stack',
                where: 'end'
            },
            borderRadius: '50%',
            borderWidth: 2,
            borderColor: '#666',
            dataLabels: {
                enabled: true
            },
            stacking: 'normal'
        }
    },
    series: [{
        data: [50, -50, 500, -90],
        name: 'Norway'
    }, {
        data: [50, 250, 260, -50],
        name: 'Sweden'
    }, {
        data: [150, 20, 30, -120],
        name: 'Denmark'
    }],
    colors: ['#d7bfff', '#af80ff', '#5920b9', '#48208b']
});

// */

document.querySelectorAll('button.corner-radius').forEach(btn => {
    btn.addEventListener(
        'click',
        () => {
            Highcharts.charts.forEach(chart => {
                chart.update({
                    plotOptions: {
                        series: {
                            borderRadius: btn.dataset.value
                        }
                    }
                });
            });
        }
    );
});

document.querySelectorAll('button.chart-type').forEach(btn => {
    btn.addEventListener(
        'click',
        () => {
            Highcharts.charts[0].update({
                chart: {
                    type: btn.dataset.value
                }
            });
        }
    );
});

document.getElementById('range').addEventListener('input', e => {
    Highcharts.charts.forEach(chart => {
        chart.update({
            plotOptions: {
                series: {
                    borderRadius: `${e.target.value}%`
                }
            }
        }, undefined, undefined, false);
    });
});

//*
Highcharts.chart('container-2', {
    chart: {
        type: 'pie',
        height: 500
    },
    xAxis: {
        categories: ['Apples', 'Pears', 'Bananas', 'Oranges']
    },
    accessibility: {
        enabled: false
    },
    title: {
        text: 'Pie with rounded corners'
    },
    plotOptions: {
        series: {
            borderRadius: document.getElementById('range').value,
            borderWidth: 2,
            borderColor: 'white',
            dataLabels: {
                enabled: false
            },
            size: '80%',
            innerSize: '50%'
        }
    },
    series: [
        /*
        {
            data: [{
                y: 1,
                sliced: true
            }, 3, 2, 4],
            borderRadius: 0,
            colors: ['white'],
            borderColor: 'silver',
            borderWidth: 1,
            name: 'Norway'
        },
        */
        {
            animation: false,
            data: [{
                y: 1,
                sliced: true
            }, 3, 2, 4],
            name: 'Norway'
        }
    ],
    colors: ['#d7bfff', '#af80ff', '#5920b9', '#48208b']
});
// */
/*
const renderer = new Highcharts.Renderer(
    document.getElementById('container-1'),
    400,
    400
);

renderer.arc(200, 200, 200, 0, -Math.PI / 2, 0).attr({
    fill: '#d7bfff',
    stroke: 'black',
    'stroke-width': 1,
    borderRadius: 200
}).add();
*/