<script setup>
defineProps({
  topic: {
    type: String,
    default: 'Quiz Questions'
  },
  count: {
    type: [Number, String],
    default: 10
  }
});
</script>

<template>
  <div class="container">
    <div class="loader-container">
      <div class="spinner-ring"></div>
      <h3 class="loader-title">Loading Your Quiz</h3>
      <p class="loader-subtext">
        Preparing {{ count }} questions on <strong style="color: #a5b4fc;">"{{ topic }}"</strong>...
      </p>
    </div>
  </div>
</template>