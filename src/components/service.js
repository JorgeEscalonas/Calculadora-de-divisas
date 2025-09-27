import { ref } from 'vue';

export const useExchangeRates = () => {
  const rates = ref({
    usd: { price: 0, change: 0, percent: 0, last_update: '' },
    eur: { price: 0, change: 0, percent: 0, last_update: '' },
  });

  const fetchRates = async () => {
    try {
      const response = await fetch('https://api.dolarvzla.com/public/exchange-rate');
      const data = await response.json();

      if (!data || !data.current || !data.previous) {
        throw new Error('Datos de la API no válidos');
      }

      const { current, previous, changePercentage } = data;

      // Para USD
      rates.value.usd = {
        price: current.usd,
        change: current.usd - previous.usd,
        percent: changePercentage.usd,
        last_update: current.date,
      };

      // Para EUR
      rates.value.eur = {
        price: current.eur,
        change: current.eur - previous.eur,
        percent: changePercentage.eur,
        last_update: current.date,
      };

    } catch (error) {
      console.error('Error fetching exchange rates:', error);
    }
  };

  return { rates, fetchRates };
};