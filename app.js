const socket = new WebSocket('wss://ws-feed.exchange.coinbase.com');

// Chart.js Setup
const ctx = document.getElementById('priceChart').getContext('2d');
const priceData = {
    labels: [], // Timestamps
    datasets: [{
        label: 'DOGE-USD Price',
        data: [],
        borderColor: 'blue',
        backgroundColor: 'rgba(0, 0, 255, 0.2)',
        borderWidth: 1
    }]
};

const priceChart = new Chart(ctx, {
    type: 'line',
    data: priceData,
    options: {
        responsive: true,
        scales: {
            x: { 
                type: 'time', 
                time: { unit: 'second' },
                ticks: { autoSkip: true, maxTicksLimit: 10 }
            },
            y: { beginAtZero: false }
        }
    }
});

// WebSocket Connection
socket.onopen = () => {
    console.log("Connected to Coinbase WebSocket!");
    const subscribeMessage = {
        "type": "subscribe",
        "channels": [{ "name": "ticker", "product_ids": ["DOGE-USD"] }]
    };
    socket.send(JSON.stringify(subscribeMessage));
};

socket.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (data.type === 'ticker' && data.price) {
        const price = parseFloat(data.price);
        const time = new Date(data.time); // Use raw Date object instead of string

        
        priceData.labels.push(time);
        priceData.datasets[0].data.push(price);

        // Update the chart
        priceChart.update();
    }
};

socket.onerror = (error) => {
    console.error(`WebSocket Error: ${error.message}`);
};

socket.onclose = (event) => {
    console.warn(`WebSocket closed: Code ${event.code}, Reason: ${event.reason}`);
    setTimeout(() => {
        location.reload(); // Simple reconnection strategy
    }, 5000);
};
