<script setup>
import { ref, computed, onMounted } from 'vue';
import { SYSTEM_STORED_TOPICS } from '../services/quizService.js';

const props = defineProps({
  errorMessage: {
    type: String,
    default: ''
  },
  initialUser: {
    type: Object,
    default: () => ({ name: '', email: '' })
  }
});

const emit = defineEmits(['start-quiz']);

// User Profile Fields
const userName = ref(props.initialUser?.name || localStorage.getItem('user_quiz_name') || '');
const userEmail = ref(props.initialUser?.email || localStorage.getItem('user_quiz_email') || '');

// Quiz Configuration Fields
const topic = ref('');
const questionCount = ref(10);
const customCountActive = ref(false);
const difficulty = ref('mixed');

// Previously entered topics stored in system / localStorage
const previousTopics = ref([]);

onMounted(() => {
  try {
    const saved = localStorage.getItem('quiz_recent_topics');
    if (saved) {
      previousTopics.value = JSON.parse(saved);
    }
  } catch (e) {
    previousTopics.value = [];
  }
});

// System stored topics
const systemTopicsList = computed(() => {
  return Object.values(SYSTEM_STORED_TOPICS).map((t) => t.title);
});

// Form Validation States
const touched = ref({
  name: false,
  email: false,
  topic: false
});

const nameError = computed(() => {
  if (!touched.value.name) return '';
  if (!userName.value.trim()) return 'Name is required to calculate your score.';
  if (userName.value.trim().length < 2) return 'Please enter at least 2 characters.';
  return '';
});

const emailError = computed(() => {
  if (!touched.value.email) return '';
  if (!userEmail.value.trim()) return 'Gmail is required.';
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(userEmail.value.trim())) {
    return 'Please enter a valid Gmail / Email address (e.g., name@gmail.com).';
  }
  return '';
});

const topicError = computed(() => {
  if (!touched.value.topic) return '';
  if (!topic.value.trim()) return 'Please enter a topic to start.';
  return '';
});

const isFormValid = computed(() => {
  return (
    userName.value.trim().length >= 2 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userEmail.value.trim()) &&
    topic.value.trim().length >= 1 &&
    questionCount.value >= 1
  );
});

const selectTopic = (t) => {
  topic.value = t;
  touched.value.topic = true;
};

const setCount = (val) => {
  questionCount.value = val;
  customCountActive.value = false;
};

const handleStart = () => {
  touched.value.name = true;
  touched.value.email = true;
  touched.value.topic = true;

  if (!isFormValid.value) return;

  const cleanTopic = topic.value.trim();

  // Save candidate info and topic to system history
  localStorage.setItem('user_quiz_name', userName.value.trim());
  localStorage.setItem('user_quiz_email', userEmail.value.trim());

  try {
    const existing = JSON.parse(localStorage.getItem('quiz_recent_topics') || '[]');
    const updated = [cleanTopic, ...existing.filter((t) => t.toLowerCase() !== cleanTopic.toLowerCase())].slice(0, 8);
    localStorage.setItem('quiz_recent_topics', JSON.stringify(updated));
    previousTopics.value = updated;
  } catch (e) {
    // Ignore storage errors
  }

  emit('start-quiz', {
    name: userName.value.trim(),
    email: userEmail.value.trim(),
    topic: cleanTopic,
    count: Math.max(1, Math.min(Number(questionCount.value) || 10, 50)),
    difficulty: difficulty.value
  });
};
</script>

<template>
  <section class="container">
    <div class="start-screen-card">
      <div style="display: flex; justify-content: center; margin-bottom: 16px;">
        <span class="header-badge">
          <span class="dot"></span>
          Interactive Quiz Platform
        </span>
      </div>

      <h2 class="hero-heading">Test Your Knowledge on Any Topic</h2>
      <p class="hero-subheading">
        Enter your details, select a stored topic or enter any custom subject, set your desired question count, and view your verified score report.
      </p>

      <!-- Candidate Profile Section -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 18px; margin-bottom: 24px;">
        <!-- Full Name -->
        <div class="form-group">
          <label class="form-label" for="userName">
            Your Name <span class="required">*</span>
          </label>
          <div class="input-wrapper">
            <span class="input-icon">👤</span>
            <input
              id="userName"
              v-model="userName"
              type="text"
              class="form-input"
              :class="{ 'is-invalid': nameError }"
              placeholder="e.g. Bhaskar Sah"
              autocomplete="name"
              @blur="touched.name = true"
            />
          </div>
          <span v-if="nameError" class="form-error">{{ nameError }}</span>
          <span v-else class="form-hint">Displayed on your score report and certificate</span>
        </div>

        <!-- Gmail / Email -->
        <div class="form-group">
          <label class="form-label" for="userEmail">
            Your Gmail <span class="required">*</span>
          </label>
          <div class="input-wrapper">
            <span class="input-icon">✉️</span>
            <input
              id="userEmail"
              v-model="userEmail"
              type="email"
              class="form-input"
              :class="{ 'is-invalid': emailError }"
              placeholder="e.g. bhaskar@gmail.com"
              autocomplete="email"
              @blur="touched.email = true"
            />
          </div>
          <span v-if="emailError" class="form-error">{{ emailError }}</span>
          <span v-else class="form-hint">Your score will be associated with this address</span>
        </div>
      </div>

      <!-- Quiz Subject / Topic Input -->
      <div class="form-group">
        <label class="form-label" for="topicInput">
          Enter Topic <span class="required">*</span>
        </label>
        <div class="input-wrapper">
          <span class="input-icon">🎯</span>
          <input
            id="topicInput"
            v-model="topic"
            type="text"
            class="form-input"
            :class="{ 'is-invalid': topicError }"
            placeholder="Type any topic (e.g. Python, JavaScript, React, World History, Geography, Space)..."
            @blur="touched.topic = true"
            @keydown.enter="handleStart"
          />
        </div>
        <span v-if="topicError" class="form-error">{{ topicError }}</span>

        <!-- Previously Stored Topics in System -->
        <div style="margin-top: 14px;">
          <span style="font-size: 13px; font-weight: 700; color: var(--text-secondary); display: block; margin-bottom: 8px;">
            Topics Stored in System:
          </span>
          <div class="topic-chips">
            <button
              v-for="sysTopic in systemTopicsList"
              :key="sysTopic"
              type="button"
              class="topic-chip"
              :class="{ active: topic.toLowerCase() === sysTopic.toLowerCase() }"
              @click="selectTopic(sysTopic)"
            >
              {{ sysTopic }}
            </button>
          </div>
        </div>

        <!-- Previously Entered Topics by User (if any stored) -->
        <div v-if="previousTopics && previousTopics.length > 0" style="margin-top: 14px;">
          <span style="font-size: 12px; font-weight: 700; color: var(--text-muted); display: block; margin-bottom: 6px;">
            Previously Explored Topics:
          </span>
          <div class="topic-chips">
            <button
              v-for="prevTopic in previousTopics"
              :key="prevTopic"
              type="button"
              class="topic-chip"
              style="border-style: dashed;"
              :class="{ active: topic.toLowerCase() === prevTopic.toLowerCase() }"
              @click="selectTopic(prevTopic)"
            >
              🕒 {{ prevTopic }}
            </button>
          </div>
        </div>
      </div>

      <!-- Question Count and Difficulty Row -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 20px; margin-bottom: 32px;">
        <!-- Question Count Selector -->
        <div class="form-group">
          <label class="form-label">
            How Many Questions: <strong style="color: var(--primary-500);">{{ questionCount }}</strong>
          </label>
          <div class="count-pills">
            <button
              type="button"
              class="count-pill"
              :class="{ active: questionCount === 5 && !customCountActive }"
              @click="setCount(5)"
            >
              5
            </button>
            <button
              type="button"
              class="count-pill"
              :class="{ active: questionCount === 10 && !customCountActive }"
              @click="setCount(10)"
            >
              10
            </button>
            <button
              type="button"
              class="count-pill"
              :class="{ active: questionCount === 15 && !customCountActive }"
              @click="setCount(15)"
            >
              15
            </button>
            <button
              type="button"
              class="count-pill"
              :class="{ active: questionCount === 20 && !customCountActive }"
              @click="setCount(20)"
            >
              20
            </button>
            <button
              type="button"
              class="count-pill"
              :class="{ active: customCountActive }"
              @click="customCountActive = !customCountActive"
            >
              Custom
            </button>
          </div>

          <!-- Custom Number Input if selected -->
          <div v-if="customCountActive" style="margin-top: 10px; display: flex; align-items: center; gap: 10px;">
            <input
              v-model.number="questionCount"
              type="number"
              min="1"
              max="50"
              class="form-input"
              style="padding: 10px 14px; width: 130px;"
            />
            <span style="font-size: 13px; color: var(--text-muted);">(Enter between 1 and 50)</span>
          </div>
        </div>

        <!-- Difficulty Level -->
        <div class="form-group">
          <label class="form-label">Difficulty Level</label>
          <div class="count-pills">
            <button
              type="button"
              class="count-pill"
              :class="{ active: difficulty === 'mixed' }"
              @click="difficulty = 'mixed'"
            >
              Mixed
            </button>
            <button
              type="button"
              class="count-pill"
              :class="{ active: difficulty === 'easy' }"
              @click="difficulty = 'easy'"
            >
              Easy
            </button>
            <button
              type="button"
              class="count-pill"
              :class="{ active: difficulty === 'medium' }"
              @click="difficulty = 'medium'"
            >
              Medium
            </button>
            <button
              type="button"
              class="count-pill"
              :class="{ active: difficulty === 'hard' }"
              @click="difficulty = 'hard'"
            >
              Hard
            </button>
          </div>
        </div>
      </div>

      <!-- Action Button -->
      <div>
        <button
          type="button"
          class="btn btn-primary btn-lg"
          style="width: 100%; max-width: 420px; margin: 0 auto;"
          :disabled="!isFormValid"
          @click="handleStart"
        >
          <span>Start Quiz ({{ questionCount }} Questions)</span>
          <span style="font-size: 18px;">→</span>
        </button>
      </div>

      <!-- Global Error Notice if any -->
      <div v-if="errorMessage" style="margin-top: 20px; padding: 12px; background: var(--color-error-bg); border: 1px solid var(--color-error-border); border-radius: var(--radius-sm); color: var(--color-error); font-size: 14px;">
        ⚠️ {{ errorMessage }}
      </div>
    </div>
  </section>
</template>