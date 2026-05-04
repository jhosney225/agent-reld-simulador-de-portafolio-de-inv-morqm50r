
```javascript
const Anthropic = require("@anthropic-ai/sdk");
const readline = require("readline");

const client = new Anthropic();

// Datos del portafolio
let portfolio = {
  assets: [],
  cash: 10000,
  totalValue: 10000,
};

// Historico de precios simulados
const priceHistory = {
  AAPL: [150, 152, 151, 155, 157],
  GOOGL: [140, 142, 141, 145, 148],
  MSFT: [380, 385, 383, 390, 395],
  TSLA: [240, 245, 242, 250, 255],
  BTC: [45000, 46000, 44000, 48000, 50000],
};

const currentPrices = {
  AAPL: 157,
  GOOGL: 148,
  MSFT: 395,
  TSLA: 255,
  BTC: 50000,
};

// Función para añadir activo al portafolio
function addAsset(symbol, quantity, price) {
  const existing = portfolio.assets.find((a) => a.symbol === symbol);
  const cost = quantity * price;

  if (portfolio.cash < cost) {
    return false; // Dinero insuficiente
  }

  if (existing) {
    existing.quantity += quantity;
    existing.totalCost += cost;
    existing.averagePrice = existing.totalCost / existing.quantity;
  } else {
    portfolio.assets.push({
      symbol,
      quantity,
      purchasePrice: price,
      averagePrice: price,
      totalCost: cost,
    });
  }

  portfolio.cash -= cost;
  return true;
}

// Función para vender activo
function sellAsset(symbol, quantity) {
  const asset = portfolio.assets.find((a) => a.symbol === symbol);
  if (!asset || asset.quantity < quantity) {
    return false;
  }

  const proceeds = quantity * currentPrices[symbol];
  asset.quantity -= quantity;

  if (asset.quantity === 0) {
    portfolio.assets = portfolio.assets.filter((a) => a.symbol !== symbol);
  } else {
    asset.totalCost = asset.quantity * asset.averagePrice;
  }

  portfolio.cash += proceeds;
  return true;
}

// Función para calcular valor total del portafolio
function updatePortfolioValue() {
  let total = portfolio.cash;
  portfolio.assets.forEach((asset) => {
    const currentValue = asset.quantity * currentPrices[asset.symbol];
    total += currentValue;
  });
  portfolio.totalValue = total;
}

// Función para simular cambios de precio
function simulatePriceChange() {
  Object.keys(currentPrices).forEach((symbol) => {
    const change = (Math.random() - 0.5) * 10; // Cambio entre -5 y +5
    const newPrice = Math.max(
      100,
      currentPrices[symbol] + change
    );
    if (!priceHistory[symbol]) {
      priceHistory[symbol] = [];
    }
    priceHistory[symbol].push(newPrice);
    currentPrices[symbol] = newPrice;
  });
  updatePortfolioValue();
}

// Función para crear gráfico ASCII
function createChart(symbol) {
  const prices = priceHistory[symbol] || [];
  if (prices.length === 0) return "Sin datos";

  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const range = max - min || 1;

  let chart = `\n${symbol} - Historial de Precios\n`;
  chart += "─".repeat(50) + "\n";

  prices.forEach((price, i) => {
    const normalized = (price - min) / range;
    const barLength = Math.round(normalized * 30);
    const bar = "█".repeat(barLength);
    chart += `${i + 1}: ${bar} $${price.toFixed(2)}\n`;
  });

  chart += "─".repeat(50) + "\n";
  chart += `Min: $${min.toFixed(2)} | Max: $${max.toFixed(2)}\n`;
  return chart;
}

// Función para obtener estado del portafolio
function getPortfolioStatus() {
  let status = "\n📊 PORTAFOLIO DE INVERSIONES\n";
  status += "═".repeat(50) + "\n";

  status += `Saldo en Efectivo: $${portfolio.cash.toFixed(2)}\n`;
  status += `Valor Total: $${portfolio.totalValue.toFixed(2)}\n\n`;

  if (portfolio.assets.length > 0) {
    status += "ACTIVOS:\n";
    status += "─".repeat(50) + "\n";

    portfolio.assets.forEach((asset) => {
      const currentValue = asset.quantity * currentPrices[asset.symbol];
      const gain = currentValue - asset.totalCost;
      const gainPercent = (gain / asset.totalCost) * 100;
      const gainColor = gain >= 0 ? "📈" : "📉";

      status += `${asset.symbol}:\n`;
      status += `  Cantidad: ${asset.quantity} unidades\n`;
      status += `  Precio Actual: $${currentPrices[asset.symbol].toFixed(2)}\n`;
      status += `  Valor Total: $${currentValue.toFixed(2)}\n`;
      status += `  Ganancia/Pérdida: ${gainColor} $${gain.toFixed(2)} (${gainPercent.toFixed(2)}%)\n\n`;
    });
  }

  return status;
}

// Función para procesar comandos del usuario