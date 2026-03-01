import { ref } from 'vue';

export const useExchangeRates = () => {
  // Intentar cargar divisas cacheadas previamente para que sea instantáneo a la vista del usuario
  const storedRates = localStorage.getItem('exchangeRates_v1');
  const initialRates = storedRates ? JSON.parse(storedRates) : {
    usd: { price: 0, change: 0, percent: 0, last_update: '' },
    eur: { price: 0, change: 0, percent: 0, last_update: '' },
    usdt: { price: 0, change: 0, percent: 0, last_update: '' },
  };

  const rates = ref(initialRates);

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
      // Realizar ambas peticiones en paralelo para ahorrar tiempo de carga
      const [bcvResponse, usdtPrice] = await Promise.all([
        fetch('/api/rates').catch(() => null),
        getBinancePrice().catch(() => 0)
      ]);

      if (bcvResponse && bcvResponse.ok) {
        const data = await bcvResponse.json();
        const ratesData = data.rates || data;

        if (Array.isArray(ratesData)) {
          const dolar = ratesData.find(item => item.nombre === 'Dólar');
          const euro = ratesData.find(item => item.nombre === 'Euro');

          if (dolar) {
            rates.value.usd = {
              price: dolar.venta || dolar.promedio,
              change: 0,
              percent: 0,
              last_update: dolar.fechaActualizacion,
            };
          }

          if (euro) {
            rates.value.eur = {
              price: euro.venta || euro.promedio,
              change: 0,
              percent: 0,
              last_update: euro.fechaActualizacion,
            };
          }
        }
      }

      if (usdtPrice > 0) {
        rates.value.usdt = {
          price: usdtPrice,
          change: 0,
          percent: 0,
          last_update: new Date().toISOString(),
        };
      }

      // Guardamos la nueva data en localStorage para próximas visitas rápidas
      localStorage.setItem('exchangeRates_v1', JSON.stringify(rates.value));

    } catch (error) {
      console.error('Error fetching exchange rates:', error);
    }
  };

  return { rates, fetchRates };
};