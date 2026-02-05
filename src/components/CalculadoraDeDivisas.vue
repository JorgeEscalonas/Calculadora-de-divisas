<template>
  <div class="min-h-screen flex justify-center items-start md:items-center p-0 md:p-4">
    <div class="w-full md:max-w-[420px] bg-white/5 backdrop-blur-xl rounded-none md:rounded-4xl p-6 md:p-8 border-0 md:border md:border-white/20 min-h-screen md:min-h-0 flex flex-col justify-center md:block">
      <div class="flex flex-col gap-2 md:gap-6">
        
        <!-- Header -->
        <div class="grid grid-cols-3 items-center w-full">
          <div class="justify-self-start">
            <div class="flex items-center justify-center m-0 md:m-2">
              <img src="../assets/logo.png" alt="Al Cambio Logo" class="w-[36px] h-[36px] md:w-[50px] md:h-[50px]" />
            </div>
          </div>
          
          <h1 class="text-white text-lg md:text-[2rem] font-bold justify-self-center tracking-tighter md:tracking-normal">Calculadora</h1>
          
          <div class="flex gap-0.5 md:gap-3 justify-self-end">
            <button
              class="bg-white/5 shadow-[0_8px_32px_rgba(255,255,255,0.02)] text-green-500 cursor-pointer p-1.5 md:p-2 rounded-xl transition-all duration-300 hover:bg-green-500/10 hover:-translate-y-0.5"
              @click="resetFields"
              title="Limpiar campos"
            >
              <EraserIcon class="h-4 w-4 md:h-5 md:w-5" />
            </button>
            <button
              class="bg-white/5 shadow-[0_8px_32px_rgba(255,255,255,0.02)] text-green-500 cursor-pointer p-1.5 md:p-2 rounded-xl transition-all duration-300 hover:bg-green-500/10 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
              @click="refreshRates"
              :disabled="isLoading"
            >
              <RefreshCwIcon class="h-4 w-4 md:h-5 md:w-5" :class="{ 'animate-spin': isLoading }" />
            </button>
            <button
              class="bg-white/5 shadow-[0_8px_32px_rgba(255,255,255,0.02)] text-green-500 cursor-pointer p-1.5 md:p-2 rounded-xl transition-all duration-300 hover:bg-green-500/10 hover:-translate-y-0.5"
              @click="shareRates"
            >
              <ShareIcon class="h-4 w-4 md:h-5 md:w-5" />
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
              type="text"
              inputmode="numeric"
              v-model="currencyInput"
              placeholder="0,00"
              class="bg-transparent border-0 text-white text-3xl md:text-3xl w-full outline-none appearance-none text-right font-semibold tracking-wide tabular-nums placeholder-white/30 caret-green-400 selection:bg-green-500/30"
              @keydown="onCurrencyKeydown"
              @paste="onCurrencyPaste"
              @focus="onCurrencyFocus"
              @blur="onCurrencyBlur"
            />
            <button
              class="bg-transparent border-0 text-gray-400 cursor-pointer p-2 rounded-full transition-all duration-300 hover:text-green-500 hover:scale-110"
              @click="copyToClipboard(currencyInput)"
            >
              <CopyIcon class="h-4 w-4" />
            </button>
          </div>

          <!-- Bs Input -->
          <div class="flex items-center bg-white/5 rounded-4xl p-4 md:p-5 gap-4 md:gap-5 transition-all duration-300 focus-within:bg-white/10 focus-within:ring-2 focus-within:ring-green-500/20">
            <span class="text-green-500 text-lg md:text-xl font-semibold">Bs</span>
            <input
              type="text"
              inputmode="numeric"
              v-model="bsInput"
              placeholder="0,00"
              class="bg-transparent border-0 text-white text-3xl md:text-3xl w-full outline-none appearance-none text-right font-semibold tracking-wide tabular-nums placeholder-white/30 caret-green-400 selection:bg-green-500/30"
              @keydown="onBsKeydown"
              @paste="onBsPaste"
              @focus="onBsFocus"
              @blur="onBsBlur"
            />
            <button
              class="bg-transparent border-0 text-gray-400 cursor-pointer p-2 rounded-full transition-all duration-300 hover:text-green-500 hover:scale-110"
              @click="copyToClipboard(bsInput)"
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
import { ref, computed, onMounted, watch, nextTick } from 'vue';
import { useExchangeRates } from './service';
import {
  RefreshCwIcon,
  ShareIcon,
  CopyIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  EraserIcon,
} from 'lucide-vue-next';

const LOCALE = 'es-VE';

const { rates, fetchRates } = useExchangeRates();
const selectedCurrency = ref('usd');

// Estado numérico
const currencyAmount = ref(1);
const bsAmount = ref(0);

// Estado de inputs (strings formateados o dígitos en edición)
const currencyInput = ref('');
const bsInput = ref('');

const isLoading = ref(false);
const notification = ref({ show: false, message: '', type: '' });

const currencyTypes = {
  usd: { title: 'Dolar', symbol: '$' },
  eur: { title: 'Euro', symbol: '€' },
  usdt: { title: 'USDT', symbol: '₮' },
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
  return new Intl.DateTimeFormat(LOCALE, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
});

// Helpers
const formatNumber = (value) => {
  const num = Number(value) || 0;
  return new Intl.NumberFormat(LOCALE, { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(num);
};

const parseLocaleNumber = (str) => {
  if (str === undefined || str === null) return 0;
  let s = String(str).trim();
  if (!s) return 0;
  s = s.replace(/\s/g, '');
  if (s.includes('.') && s.includes(',')) {
    if (s.lastIndexOf('.') > s.lastIndexOf(',')) s = s.replace(/,/g, '');
    else s = s.replace(/\./g, '').replace(/,/g, '.');
  } else if (s.includes(',')) s = s.replace(/\./g, '').replace(/,/g, '.');
  else s = s.replace(/,/g, '');
  s = s.replace(/[^0-9.-]/g, '');
  const n = parseFloat(s);
  return isNaN(n) ? 0 : n;
};

// Cálculos
const calculateBsAmount = () => {
  const rate = parseFloat(currentRate.value) || 0;
  const amount = parseLocaleNumber(currencyInput.value) || 0;
  const bs = amount * rate;
  bsAmount.value = Number(bs.toFixed(2));
  currencyAmount.value = Number(amount.toFixed(2));
  bsInput.value = formatNumber(bsAmount.value);
};

const calculateCurrencyAmount = () => {
  const rate = parseFloat(currentRate.value) || 0;
  const bs = parseLocaleNumber(bsInput.value) || 0;
  const cur = rate ? bs / rate : 0;
  currencyAmount.value = Number(cur.toFixed(2));
  bsAmount.value = Number(bs.toFixed(2));
  currencyInput.value = formatNumber(currencyAmount.value);
};

// Entrada y control por dígitos (teclado y pegado)
const currencyDigits = ref(String(Math.round((currencyAmount.value || 0) * 100)));
const bsDigits = ref(String(Math.round((bsAmount.value || 0) * 100)));
const currencyEditing = ref(false);
const bsEditing = ref(false);

const toAmountFromDigits = (digits) => {
  if (!digits || String(digits).trim() === '') return 0;
  const cleaned = (String(digits).match(/\d/g) || []).join('');
  if (!cleaned) return 0;
  return Number((parseInt(cleaned, 10) / 100).toFixed(2));
};

// Mapea posición en string formateado a índice en la secuencia de dígitos
const formattedPosToDigitIndex = (formatted, pos) => {
  let cnt = 0;
  for (let i = 0; i < Math.min(pos, formatted.length); i++) {
    if (/\d/.test(formatted[i])) cnt++;
  }
  return cnt; // number of digits to the left of pos
};

// Mapea índice de dígito a posición en string formateado (coloca caret justo después de ese dígito)
const digitIndexToFormattedPos = (formatted, digitIndex) => {
  if (digitIndex <= 0) return 0;
  let cnt = 0;
  for (let i = 0; i < formatted.length; i++) {
    if (/\d/.test(formatted[i])) cnt++;
    if (cnt >= digitIndex) return i + 1;
  }
  return formatted.length;
};

const applyCurrencyDigits = (digits) => {
  currencyDigits.value = digits || '0';
  const amount = toAmountFromDigits(digits);
  currencyAmount.value = amount;
  currencyInput.value = formatNumber(amount);
  const rate = parseFloat(currentRate.value) || 0;
  bsAmount.value = Number((amount * rate).toFixed(2));
  bsDigits.value = String(Math.round(bsAmount.value * 100));
  bsInput.value = formatNumber(bsAmount.value);
};

const applyBsDigits = (digits) => {
  bsDigits.value = digits || '0';
  const amount = toAmountFromDigits(digits);
  bsAmount.value = amount;
  bsInput.value = formatNumber(amount);
  const rate = parseFloat(currentRate.value) || 0;
  currencyAmount.value = rate ? Number((amount / rate).toFixed(2)) : 0;
  currencyDigits.value = String(Math.round(currencyAmount.value * 100));
  currencyInput.value = formatNumber(currencyAmount.value);
};

const onCurrencyKeydown = async (e) => {
  const key = e.key;
  const allowedControlKeys = new Set([
    'ArrowLeft',
    'ArrowRight',
    'ArrowUp',
    'ArrowDown',
    'Home',
    'End',
    'Tab',
    'Enter',
    'Escape',
  ]);

  if (e.ctrlKey || e.metaKey) return;

  const el = e.target;
  // If not in editing mode, fall back to append behavior
  if (!currencyEditing.value) {
    if (/^\d$/.test(key)) {
      e.preventDefault();
      const next = currencyDigits.value === '0' ? key : currencyDigits.value + key;
      applyCurrencyDigits(next);
    }
    if (key === 'Backspace') {
      e.preventDefault();
      const next = currencyDigits.value.slice(0, -1) || '0';
      applyCurrencyDigits(next);
    }
    if (key === 'Delete') {
      e.preventDefault();
      applyCurrencyDigits('0');
    }
    return;
  }

  // Editing mode: operate on the raw digits string using selection
  const value = el.value || '';
  const selStart = el.selectionStart ?? value.length;
  const selEnd = el.selectionEnd ?? value.length;

  if (/^\d$/.test(key)) {
    e.preventDefault();
    const digitIndex = formattedPosToDigitIndex(value, selStart);
    const existing = currencyDigits.value.replace(/\D/g, '') || '0';
    const newDigits = existing.slice(0, digitIndex) + key + existing.slice(digitIndex) || '0';
    applyCurrencyDigits(newDigits);
    await nextTick();
    const newDigitPos = digitIndex + 1;
    const formatted = currencyInput.value;
    const pos = digitIndexToFormattedPos(formatted, newDigitPos);
    el.setSelectionRange(pos, pos);
    return;
  }

  if (key === 'Backspace') {
    e.preventDefault();
    if (selStart !== selEnd) {
      const startIndex = formattedPosToDigitIndex(value, selStart);
      const endIndex = formattedPosToDigitIndex(value, selEnd);
      const existing = currencyDigits.value.replace(/\D/g, '') || '0';
      const newDigits = existing.slice(0, startIndex) + existing.slice(endIndex) || '0';
      applyCurrencyDigits(newDigits);
      await nextTick();
      const formatted = currencyInput.value;
      const pos = digitIndexToFormattedPos(formatted, startIndex);
      el.setSelectionRange(pos, pos);
    } else {
      const delIndex = formattedPosToDigitIndex(value, selStart) - 1;
      const existing = currencyDigits.value.replace(/\D/g, '') || '0';
      const newDigits = existing.slice(0, Math.max(0, delIndex)) + existing.slice(delIndex + 1) || '0';
      applyCurrencyDigits(newDigits);
      await nextTick();
      const formatted = currencyInput.value;
      const pos = digitIndexToFormattedPos(formatted, Math.max(0, delIndex));
      el.setSelectionRange(pos, pos);
    }
    return;
  }

  if (key === 'Delete') {
    e.preventDefault();
    if (selStart !== selEnd) {
      const startIndex = formattedPosToDigitIndex(value, selStart);
      const endIndex = formattedPosToDigitIndex(value, selEnd);
      const existing = currencyDigits.value.replace(/\D/g, '') || '0';
      const newDigits = existing.slice(0, startIndex) + existing.slice(endIndex) || '0';
      applyCurrencyDigits(newDigits);
      await nextTick();
      const formatted = currencyInput.value;
      const pos = digitIndexToFormattedPos(formatted, startIndex);
      el.setSelectionRange(pos, pos);
    } else {
      const delIndex = formattedPosToDigitIndex(value, selStart);
      const existing = currencyDigits.value.replace(/\D/g, '') || '0';
      const newDigits = existing.slice(0, delIndex) + existing.slice(delIndex + 1) || '0';
      applyCurrencyDigits(newDigits);
      await nextTick();
      const formatted = currencyInput.value;
      const pos = digitIndexToFormattedPos(formatted, delIndex);
      el.setSelectionRange(pos, pos);
    }
    return;
  }

  if (allowedControlKeys.has(key)) return;
  if (key.length === 1) e.preventDefault();
};

const onBsKeydown = async (e) => {
  const key = e.key;
  const allowedControlKeys = new Set([
    'ArrowLeft',
    'ArrowRight',
    'ArrowUp',
    'ArrowDown',
    'Home',
    'End',
    'Tab',
    'Enter',
    'Escape',
  ]);

  if (e.ctrlKey || e.metaKey) return;
  const el = e.target;
  if (!bsEditing.value) {
    if (/^\d$/.test(key)) {
      e.preventDefault();
      const next = bsDigits.value === '0' ? key : bsDigits.value + key;
      applyBsDigits(next);
    }
    if (key === 'Backspace') {
      e.preventDefault();
      const next = bsDigits.value.slice(0, -1) || '0';
      applyBsDigits(next);
    }
    if (key === 'Delete') {
      e.preventDefault();
      applyBsDigits('0');
    }
    return;
  }

  const value = el.value || '';
  const selStart = el.selectionStart ?? value.length;
  const selEnd = el.selectionEnd ?? value.length;

  if (/^\d$/.test(key)) {
    e.preventDefault();
    const digitIndex = formattedPosToDigitIndex(value, selStart);
    const existing = bsDigits.value.replace(/\D/g, '') || '0';
    const newDigits = existing.slice(0, digitIndex) + key + existing.slice(digitIndex) || '0';
    applyBsDigits(newDigits);
    await nextTick();
    const newDigitPos = digitIndex + 1;
    const formatted = bsInput.value;
    const pos = digitIndexToFormattedPos(formatted, newDigitPos);
    el.setSelectionRange(pos, pos);
    return;
  }

  if (key === 'Backspace') {
    e.preventDefault();
    if (selStart !== selEnd) {
      const startIndex = formattedPosToDigitIndex(value, selStart);
      const endIndex = formattedPosToDigitIndex(value, selEnd);
      const existing = bsDigits.value.replace(/\D/g, '') || '0';
      const newDigits = existing.slice(0, startIndex) + existing.slice(endIndex) || '0';
      applyBsDigits(newDigits);
      await nextTick();
      const formatted = bsInput.value;
      const pos = digitIndexToFormattedPos(formatted, startIndex);
      el.setSelectionRange(pos, pos);
    } else {
      const delIndex = formattedPosToDigitIndex(value, selStart) - 1;
      const existing = bsDigits.value.replace(/\D/g, '') || '0';
      const newDigits = existing.slice(0, Math.max(0, delIndex)) + existing.slice(delIndex + 1) || '0';
      applyBsDigits(newDigits);
      await nextTick();
      const formatted = bsInput.value;
      const pos = digitIndexToFormattedPos(formatted, Math.max(0, delIndex));
      el.setSelectionRange(pos, pos);
    }
    return;
  }

  if (key === 'Delete') {
    e.preventDefault();
    if (selStart !== selEnd) {
      const startIndex = formattedPosToDigitIndex(value, selStart);
      const endIndex = formattedPosToDigitIndex(value, selEnd);
      const existing = bsDigits.value.replace(/\D/g, '') || '0';
      const newDigits = existing.slice(0, startIndex) + existing.slice(endIndex) || '0';
      applyBsDigits(newDigits);
      await nextTick();
      const formatted = bsInput.value;
      const pos = digitIndexToFormattedPos(formatted, startIndex);
      el.setSelectionRange(pos, pos);
    } else {
      const delIndex = formattedPosToDigitIndex(value, selStart);
      const existing = bsDigits.value.replace(/\D/g, '') || '0';
      const newDigits = existing.slice(0, delIndex) + existing.slice(delIndex + 1) || '0';
      applyBsDigits(newDigits);
      await nextTick();
      const formatted = bsInput.value;
      const pos = digitIndexToFormattedPos(formatted, delIndex);
      el.setSelectionRange(pos, pos);
    }
    return;
  }

  if (allowedControlKeys.has(key)) return;
  if (key.length === 1) e.preventDefault();
};

const onCurrencyPaste = (e) => {
  e.preventDefault();
  const text = e.clipboardData?.getData('text') || '';
  const digits = (text.match(/\d/g) || []).join('') || '0';
  applyCurrencyDigits(digits);
};

const onBsPaste = (e) => {
  e.preventDefault();
  const text = e.clipboardData?.getData('text') || '';
  const digits = (text.match(/\d/g) || []).join('') || '0';
  applyBsDigits(digits);
};

const onCurrencyFocus = () => {
  currencyEditing.value = true;
};

const onCurrencyBlur = () => {
  currencyEditing.value = false;
  currencyInput.value = formatNumber(currencyAmount.value);
};

const onBsFocus = () => {
  bsEditing.value = true;
};

const onBsBlur = () => {
  bsEditing.value = false;
  bsInput.value = formatNumber(bsAmount.value);
};

// Acciones de UI
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
  if (navigator.share) navigator.share({ title: 'Tasas de Cambio', text, url: window.location.href });
  else {
    copyToClipboard(text);
    showNotification('Tasas copiadas al portapapeles', 'success');
  }
};

const resetFields = () => {
  currencyAmount.value = 1;
  currencyInput.value = formatNumber(currencyAmount.value);
  calculateBsAmount();
};

const showNotification = (message, type = 'info') => {
  notification.value = { show: true, message, type };
  setTimeout(() => (notification.value.show = false), 3000);
};

const copyToClipboard = async (value) => {
  try {
    const textToCopy = typeof value === 'string' ? value : value != null ? formatNumber(value) : '';
    await navigator.clipboard.writeText(textToCopy);
    showNotification(`Copiado: ${textToCopy}`, 'success');
  } catch (error) {
    showNotification('Error al copiar al portapapeles', 'error');
  }
};

onMounted(async () => {
  await fetchRates();
  currencyInput.value = formatNumber(currencyAmount.value);
  calculateBsAmount();
});

watch(currencyAmount, (v) => {
  currencyInput.value = formatNumber(v);
});

watch(bsAmount, (v) => {
  bsInput.value = formatNumber(v);
});

watch(currencyAmount, (v) => {
  currencyDigits.value = String(Math.round((v || 0) * 100));
});

watch(bsAmount, (v) => {
  bsDigits.value = String(Math.round((v || 0) * 100));
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

