<template>
  <view class="search-bar" :class="{ 'search-bar--focused': isFocused }">
    <view class="search-bar__icon">
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="14" cy="14" r="8" stroke="#999999" stroke-width="2" />
        <line x1="20" y1="20" x2="26" y2="26" stroke="#999999" stroke-width="2" stroke-linecap="round" />
      </svg>
    </view>
    <input
      class="search-bar__input"
      :placeholder="placeholder"
      :value="modelValue"
      placeholder-class="search-bar__placeholder"
      confirm-type="search"
      @input="onInput"
      @focus="onFocus"
      @blur="onBlur"
      @confirm="onSearch"
    />
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const props = withDefaults(defineProps<{
  placeholder?: string
  modelValue?: string
}>(), {
  placeholder: '搜索商品',
  modelValue: ''
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  search: [value: string]
  focus: []
}>()

const isFocused = ref(false)

const onInput = (e: any) => {
  emit('update:modelValue', e.detail.value)
}

const onFocus = () => {
  isFocused.value = true
  emit('focus')
}

const onBlur = () => {
  isFocused.value = false
}

const onSearch = () => {
  emit('search', props.modelValue)
}
</script>

<style lang="scss" scoped>
.search-bar {
  display: flex;
  align-items: center;
  width: 100%;
  height: 72rpx;
  background: #efefef;
  border-radius: var(--radius-full, 9999rpx);
  padding: 0 32rpx;
  box-sizing: border-box;
  border: 1px solid transparent;
  transition: border-color 0.2s ease;

  &--focused {
    border-color: var(--accent, #c8102e);
  }

  &__icon {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    margin-right: 12rpx;
  }

  &__input {
    flex: 1;
    background: transparent;
    border: none;
    outline: none;
    font-size: 28rpx;
    color: var(--text-primary, #1a1a1a);
    height: 72rpx;
    line-height: 72rpx;
  }

  &__placeholder {
    color: #999999;
    font-size: 28rpx;
  }
}
</style>
