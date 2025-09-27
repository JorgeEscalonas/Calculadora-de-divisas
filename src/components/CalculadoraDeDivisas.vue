<template>
  <div class="min-h-screen flex justify-center items-center p-4">
    <div class="w-full max-w-[420px] bg-white/5 backdrop-blur-xl rounded-4xl p-6 md:p-8 border border-white/20 ">
      <div class="flex flex-col gap-2 md:gap-6">
        
        <!-- Header -->
        <div class="flex items-center justify-between">
          <div>
            <div class="flex items-center justify-center m-2">
              <img src="../assets/logo.png" alt="Al Cambio Logo" class="w-[50px] h-[50px]" />
            </div>
          </div>
          <h1 class="text-white text-[1.6rem] md:text-[2rem] font-bold">Calculadora</h1>
          <div class="flex gap-3 md:gap-5">
            <button
              class="bg-white/5 shadow-[0_8px_32px_rgba(255,255,255,0.02)] text-green-500 cursor-pointer p-2 rounded-xl transition-all duration-300 hover:bg-green-500/10 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
              @click="refreshRates"
              :disabled="isLoading"
            >
              <RefreshCwIcon class="h-5 w-5" :class="{ 'animate-spin': isLoading }" />
            </button>
            <button
              class="bg-white/5 shadow-[0_8px_32px_rgba(255,255,255,0.02)] text-green-500 cursor-pointer p-2 rounded-xl transition-all duration-300 hover:bg-green-500/10 hover:-translate-y-0.5"
              @click="shareRates"
            >
              <ShareIcon class="h-5 w-5" />
            </button>
          </div>
        </div>

        <!-- Currency Selector -->
        <div class="flex gap-2 mt-4 mb-4 bg-white/5 p-1.5 rounded-4xl">
          <button 
            v-for="(currency, key) in currencyTypes" 
            :key="key"
            class="flex-1 bg-transparent border-0 py-3 md:py-4 rounded-3xl font-semibold cursor-pointer transition-all duration-300"
            :class="{
              'bg-green-500 text-white shadow-[0_4px_12px_rgba(34,197,94,0.18)]': selectedCurrency === key,
              'text-gray-300': selectedCurrency !== key
            }"
            @click="selectCurrency(key)"
          >
            {{ currency.title }}
          </button>
        </div>

        <!-- Exchange Rates -->
        <div class="flex flex-col gap-2 md:gap-4">
          <!-- Currency Input -->
          <div class="flex items-center bg-white/5 rounded-4xl p-4 md:p-5 gap-4 md:gap-5 transition-all duration-300 focus-within:bg-white/10 focus-within:ring-2 focus-within:ring-green-500/20">
            <span class="text-green-500 text-lg md:text-xl font-semibold">{{ currencySymbol }}</span>
            <input 
              type="number" 
              v-model="currencyAmount"
              placeholder="0.00"
              class="bg-transparent border-0 text-white text-3xl md:text-3xl w-full outline-none appearance-none text-right font-semibold tracking-wide tabular-nums placeholder-white/30 caret-green-400 selection:bg-green-500/30"
              @input="calculateBsAmount"
            />
            <button
              class="bg-transparent border-0 text-gray-400 cursor-pointer p-2 rounded-full transition-all duration-300 hover:text-green-500 hover:scale-110"
              @click="copyToClipboard(currencyAmount)"
            >
              <CopyIcon class="h-4 w-4" />
            </button>
          </div>

          <!-- Bs Input -->
          <div class="flex items-center bg-white/5 rounded-4xl p-4 md:p-5 gap-4 md:gap-5 transition-all duration-300 focus-within:bg-white/10 focus-within:ring-2 focus-within:ring-green-500/20">
            <span class="text-green-500 text-lg md:text-xl font-semibold">Bs</span>
            <input 
              type="number" 
              v-model="bsAmount"
              placeholder="0.00"
              class="bg-transparent border-0 text-white text-3xl md:text-3xl w-full outline-none appearance-none text-right font-semibold tracking-wide tabular-nums placeholder-white/30 caret-green-400 selection:bg-green-500/30"
              @input="calculateCurrencyAmount"
            />
            <button
              class="bg-transparent border-0 text-gray-400 cursor-pointer p-2 rounded-full transition-all duration-300 hover:text-green-500 hover:scale-110"
              @click="copyToClipboard(bsAmount)"
            >
              <CopyIcon class="h-4 w-4" />
            </button>
          </div>

          <!-- Current Rate -->
          <div class="flex justify-between items-center text-gray-400 px-2 md:px-4" v-if="rates && rates[selectedCurrency]">
            <span class="text-sm">Tasa actual</span>
            <span class="text-green-400 font-semibold tracking-wide">{{ currentRate }} Bs/{{ selectedCurrency.toUpperCase() }}</span>
          </div>

          <!-- Change Percentage -->
          <div 
            class="flex items-center justify-center gap-2 text-sm md:text-base p-3 rounded-2xl"
            :class="changePercentage > 0 ? 'text-green-500 bg-green-500/10' : changePercentage < 0 ? 'text-red-500 bg-red-500/10' : 'text-gray-400 bg-gray-500/10'"
            v-if="changePercentage !== undefined"
          >
            <ArrowUpIcon v-if="changePercentage > 0" class="h-4 w-4" />
            <ArrowDownIcon v-else-if="changePercentage < 0" class="h-4 w-4" />
            <span v-else class="h-4 w-4"></span>
            {{ Math.abs(changePercentage).toFixed(2) }}%
          </div>
        </div>

        <!-- Last Update -->
        <div class="text-gray-400 text-[11px] md:text-xs text-center">
          
ultima actualizacion: {{ formattedLastUpdate }}
        </div>
      </div>

      <!-- Notification -->
      <div v-if="notification.show" 
           class="fixed bottom-8 left-1/2 -translate-x-1/2 px-4 py-2 rounded-xl text-white text-sm backdrop-blur-md"
           :class="{
             'bg-green-500/90': notification.type === 'success',
             'bg-red-500/90': notification.type === 'error',
             'bg-black/80': !notification.type
           }">
        {{ notification.message }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useExchangeRates } from './service';
import { RefreshCwIcon, ShareIcon, CopyIcon, ArrowUpIcon, ArrowDownIcon } from 'lucide-vue-next';

const { rates, fetchRates } = useExchangeRates();
const selectedCurrency = ref('usd'); 
const currencyAmount = ref(1);
const bsAmount = ref(0);
const isLoading = ref(false);
const notification = ref({ show: false, message: '', type: '' });

const currencyTypes = {
  usd: { title: 'Dolar', symbol: '$' },
  eur: { title: 'Euro', symbol: '' },
};

const currencySymbol = computed(() => currencyTypes[selectedCurrency.value]?.symbol || '$');

const currentRate = computed(() => {
  const rate = rates.value[selectedCurrency.value]?.price || 0;
  return rate.toFixed(2);
});

const changePercentage = computed(() => rates.value[selectedCurrency.value]?.percent || 0);
const lastUpdate = computed(() => rates.value[selectedCurrency.value]?.last_update || '');

const formattedLastUpdate = computed(() => {
  if (!lastUpdate.value) return 'N/A';
  const date = new Date(lastUpdate.value);
  if (isNaN(date.getTime())) return 'N/A';
  return new Intl.DateTimeFormat('es-VE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
});

const calculateBsAmount = () => {
  bsAmount.value = (currencyAmount.value * currentRate.value).toFixed(2);
};

const calculateCurrencyAmount = () => {
  currencyAmount.value = (bsAmount.value / currentRate.value).toFixed(2);
};

const selectCurrency = (currencyId) => {
  selectedCurrency.value = currencyId;
  calculateBsAmount();
};

const refreshRates = async () => {
  isLoading.value = true;
  try {
    await fetchRates();
    calculateBsAmount();
    showNotification('Tasas actualizadas correctamente', 'success');
  } catch (error) {
    showNotification('Error al actualizar las tasas', 'error');
  } finally {
    isLoading.value = false;
  }
};

const shareRates = () => {
  const text = `Tasa de cambio actual: 1 ${selectedCurrency.value.toUpperCase()} = ${currentRate.value} Bs (Al Cambio)`;
  if (navigator.share) {
    navigator.share({
      title: 'Tasas de Cambio',
      text: text,
      url: window.location.href
    });
  } else {
    copyToClipboard(text);
    showNotification('Tasas copiadas al portapapeles', 'success');
  }
};

const showNotification = (message, type = 'info') => {
  notification.value = { show: true, message, type };
  setTimeout(() => {
    notification.value.show = false;
  }, 3000);
};

const copyToClipboard = async (value) => {
  try {
    const textToCopy = value ? value.toString() : '';
    await navigator.clipboard.writeText(textToCopy);
    showNotification(`Copiado: ${textToCopy}`, 'success');
  } catch (error) {
    showNotification('Error al copiar al portapapeles', 'error');
  }
};

onMounted(async () => {
  await fetchRates();
  calculateBsAmount();
});
</script>

<style>
/* Eliminar flechitas (spinners) en inputs tipo number */
input[type="number"]::-webkit-outer-spin-button,
input[type="number"]::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

/* Firefox */
input[type="number"] {
  -moz-appearance: textfield;
  appearance: textfield;
}
</style>

