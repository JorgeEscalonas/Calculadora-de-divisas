import { ref } from 'vue';

export const useExchangeRates = () => {
  const rates = ref({
    usd: { price: 0, change: 0, percent: 0, last_update: '' },
    eur: { price: 0, change: 0, percent: 0, last_update: '' },
    usdt: { price: 0, change: 0, percent: 0, last_update: '' },
  });

  const getBinancePrice = async () => {
    const payload = {
      fiat: "VES",
      page: 1,
      rows: 10,
      tradeType: "SELL",
      asset: "USDT",
      countries: [],
      proMerchantAds: false,
      publisherType: null,
      merchantCheck: false,
      payTypes: [],
      classifieds: false
    };

    try {
      const response = await fetch("/binance-api/bapi/c2c/v2/friendly/c2c/adv/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (data && data.data && Array.isArray(data.data)) {
        const prices = data.data.map(ad => parseFloat(ad.adv.price));
        if (prices.length === 0) return 0;
        const average = prices.reduce((sum, price) => sum + price, 0) / prices.length;
        return average;
      }
      return 0;
    } catch (error) {
      console.error('Error fetching Binance price:', error);
      return 0;
    }
  };

  const fetchRates = async () => {
    try {
      const response = await fetch('/api/rates');
      const data = await response.json();

      const ratesData = data.rates || data;

      if (!ratesData || !Array.isArray(ratesData)) {
        throw new Error('Datos de la API no válidos');
      }

      const dolar = ratesData.find(item => item.nombre === 'Dólar');
      const euro = ratesData.find(item => item.nombre === 'Euro');

      if (dolar) {
        // Para USD
        rates.value.usd = {
          price: dolar.venta || dolar.promedio,
          change: 0,
          percent: 0,
          last_update: dolar.fechaActualizacion,
        };
      }

      if (euro) {
        // Para EUR
        rates.value.eur = {
          price: euro.venta || euro.promedio,
          change: 0,
          percent: 0,
          last_update: euro.fechaActualizacion,
        };
      }

      // Para USDT
      const usdtPrice = await getBinancePrice();
      if (usdtPrice > 0) {
        rates.value.usdt = {
          price: usdtPrice,
          change: 0,
          percent: 0,
          last_update: new Date().toISOString(),
        };
      }

    } catch (error) {
      console.error('Error fetching exchange rates:', error);
    }
  };

  return { rates, fetchRates };
};