<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';

const props = defineProps({
  questions: {
    type: Array,
    required: true
  },
  candidate: {
    type: Object,
    default: () => ({ name: 'Candidate', email: '' })
  },
  topic: {
    type: String,
    default: 'General'
  }
});

const emit = defineEmits(['finish-quiz']);

const currentIndex = ref(0);
// Store answers as a map: questionIndex -> { question, userAnswer, isCorrect }
const answersMap = ref({});

// Timer tracking
const elapsedSeconds = ref(0);
let timerInterval = null;

onMounted(() => {
  timerInterval = setInterval(() => {
    elapsedSeconds.value++;
  }, 1000);
});

onUnmounted(() => {
  if (timerInterval) clearInterval(timerInterval);
});

const formattedTime = computed(() => {
  const mins = Math.floor(elapsedSeconds.value / 60);
  const secs = elapsedSeconds.value % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
});

const currentQuestion = computed(() => {
  return props.questions[currentIndex.value] || null;
});

// Cache shuffled options for each question index so they don't jump around when re-rendering
const optionsCache = ref({});

const currentOptions = computed(() => {
  if (!currentQuestion.value) return [];
  if (optionsCache.value[currentIndex.value]) {
    return optionsCache.value[currentIndex.value];
  }

  const raw = [
    ...(currentQuestion.value.incorrect_answers || []),
    currentQuestion.value.correct_answer
  ];

  // Fisher-Yates shuffle
  const shuffled = [...raw];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  optionsCache.value[currentIndex.value] = shuffled;
  return shuffled;
});

const selectedOption = computed({
  get() {
    return answersMap.value[currentIndex.value]?.userAnswer || null;
  },
  set(val) {
    if (!currentQuestion.value) return;
    answersMap.value[currentIndex.value] = {
      question: currentQuestion.value,
      userAnswer: val,
      isCorrect: val === currentQuestion.value.correct_answer,
      explanation: currentQuestion.value.explanation || ''
    };
  }
});

const selectAnswer = (ans) => {
  selectedOption.value = ans;
};

const nextQuestion = () => {
  if (currentIndex.value < props.questions.length - 1) {
    currentIndex.value++;
  } else {
    completeQuiz();
  }
};

const prevQuestion = () => {
  if (currentIndex.value > 0) {
    currentIndex.value--;
  }
};

const jumpToQuestion = (idx) => {
  currentIndex.value = idx;
};

const completeQuiz = () => {
  // Format answers list in order of questions
  const finalAnswers = props.questions.map((q, idx) => {
    return (
      answersMap.value[idx] || {
        question: q,
        userAnswer: 'Unanswered',
        isCorrect: false,
        explanation: q.explanation || ''
      }
    );
  });

  emit('finish-quiz', {
    answers: finalAnswers,
    timeSpentSeconds: elapsedSeconds.value
  });
};

const answeredCount = computed(() => {
  return Object.keys(answersMap.value).length;
});

const progressPercentage = computed(() => {
  if (!props.questions.length) return 0;
  return Math.round(((currentIndex.value + 1) / props.questions.length) * 100);
});

const optionLetters = ['A', 'B', 'C', 'D', 'E', 'F'];
</script>

<template>
  <div class="container">
    <div class="quiz-card">
      <!-- Top Meta Bar -->
      <div class="quiz-meta-bar">
        <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
          <div class="candidate-mini-pill">
            <span>👤</span>
            <strong>{{ candidate.name }}</strong>
            <span v-if="candidate.email" style="opacity: 0.6;">({{ candidate.email }})</span>
          </div>
          <div class="candidate-mini-pill" style="background: rgba(99, 102, 241, 0.12); border-color: rgba(99, 102, 241, 0.3); color: #c7d2fe;">
            <span>🎯</span>
            <strong>{{ topic }}</strong>
          </div>
        </div>

        <div style="display: flex; align-items: center; gap: 12px;">
          <div class="timer-pill">
            <span>⏱️</span>
            <span>{{ formattedTime }}</span>
          </div>
          <span style="font-size: 14px; font-weight: 600; color: var(--text-secondary);">
            Q {{ currentIndex + 1 }} / {{ questions.length }}
          </span>
        </div>
      </div>

      <!-- Progress Track -->
      <div class="progress-track" :title="`Progress: ${progressPercentage}%`">
        <div class="progress-fill" :style="{ width: progressPercentage + '%' }"></div>
      </div>

      <!-- Quick Question Jump Pills -->
      <div style="display: flex; gap: 6px; overflow-x: auto; padding-bottom: 12px; margin-bottom: 20px;">
        <button
          v-for="(q, idx) in questions"
          :key="idx"
          type="button"
          style="width: 28px; height: 28px; border-radius: 6px; font-size: 11px; font-weight: 700; border: 1px solid var(--border-subtle); display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.2s;"
          :style="{
            background: currentIndex === idx ? 'var(--primary-500)' : (answersMap[idx] ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.05)'),
            color: currentIndex === idx ? '#fff' : (answersMap[idx] ? '#34d399' : 'var(--text-muted)'),
            borderColor: currentIndex === idx ? 'var(--primary-500)' : (answersMap[idx] ? 'rgba(16, 185, 129, 0.4)' : 'var(--border-subtle)')
          }"
          @click="jumpToQuestion(idx)"
        >
          {{ idx + 1 }}
        </button>
      </div>

      <!-- Question Statement Box -->
      <div v-if="currentQuestion" class="question-statement-box">
        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
          <span class="question-badge">
            Question #{{ currentIndex + 1 }}
          </span>
          <span
            v-if="currentQuestion.difficulty"
            style="font-size: 11px; padding: 2px 8px; border-radius: 9999px; text-transform: uppercase; font-weight: 700; letter-spacing: 0.05em;"
            :style="{
              background: currentQuestion.difficulty === 'hard' ? 'rgba(244, 63, 94, 0.15)' : (currentQuestion.difficulty === 'medium' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(16, 185, 129, 0.15)'),
              color: currentQuestion.difficulty === 'hard' ? '#fb7185' : (currentQuestion.difficulty === 'medium' ? '#fbbf24' : '#34d399')
            }"
          >
            {{ currentQuestion.difficulty }}
          </span>
        </div>

        <h3 class="question-text">
          {{ currentQuestion.question }}
        </h3>
      </div>

      <!-- Options Grid -->
      <div class="options-grid">
        <button
          v-for="(option, optIdx) in currentOptions"
          :key="option"
          type="button"
          class="option-btn"
          :class="{ selected: selectedOption === option }"
          @click="selectAnswer(option)"
        >
          <span class="option-letter">{{ optionLetters[optIdx] || optIdx + 1 }}</span>
          <span style="flex: 1;">{{ option }}</span>
          <span v-if="selectedOption === option" style="color: var(--primary-500); font-weight: 700;">✓</span>
        </button>
      </div>

      <!-- Footer Navigation Controls -->
      <div class="quiz-footer-actions">
        <button
          type="button"
          class="btn btn-secondary"
          :disabled="currentIndex === 0"
          @click="prevQuestion"
        >
          ← Previous
        </button>

        <div style="display: flex; align-items: center; gap: 10px;">
          <button
            v-if="currentIndex < questions.length - 1"
            type="button"
            class="btn btn-primary"
            :disabled="!selectedOption"
            @click="nextQuestion"
          >
            Next Question →
          </button>

          <button
            v-else
            type="button"
            class="btn btn-success"
            :disabled="!selectedOption"
            @click="completeQuiz"
          >
            Submit & View Final Score 🎓
          </button>
        </div>
      </div>
    </div>
  </div>
</template>