<script setup>
import { ref } from 'vue';
import StartScreen from './components/StartScreen.vue';
import Quiz from './components/Quiz.vue';
import Loader from './components/Loader.vue';
import Result from './components/Result.vue';
import { generateQuiz } from './services/quizService.js';

// Application state
const status = ref('start'); // 'start' | 'loading' | 'ready' | 'finished'
const errorMessage = ref('');

// Candidate & Quiz setup parameters
const candidate = ref({
  name: localStorage.getItem('user_quiz_name') || '',
  email: localStorage.getItem('user_quiz_email') || ''
});
const activeTopic = ref('');
const questionCount = ref(10);
const activeDifficulty = ref('mixed');

// Active Quiz Data
const questions = ref([]);
const userAnswers = ref([]);
const timeSpentSeconds = ref(0);

// Handler to generate and start quiz
const startQuiz = async (config) => {
  status.value = 'loading';
  errorMessage.value = '';

  candidate.value = {
    name: config.name,
    email: config.email
  };
  activeTopic.value = config.topic;
  questionCount.value = config.count;
  activeDifficulty.value = config.difficulty;

  try {
    const response = await generateQuiz({
      topic: config.topic,
      count: config.count,
      difficulty: config.difficulty
    });

    if (!response || !response.questions || response.questions.length === 0) {
      throw new Error(`No questions could be loaded for topic: "${config.topic}". Please verify the topic spelling.`);
    }

    questions.value = response.questions;
    userAnswers.value = [];
    status.value = 'ready';
  } catch (err) {
    console.error('Quiz Generation Error:', err);
    errorMessage.value =
      err.message ||
      'Could not generate questions for this topic. Please try another topic or check spelling.';
    status.value = 'start';
  }
};

// Handler when user finishes the quiz
const handleFinishQuiz = (data) => {
  userAnswers.value = data.answers;
  timeSpentSeconds.value = data.timeSpentSeconds;
  status.value = 'finished';
};

// Retake current quiz with the same topic
const retakeQuiz = async () => {
  await startQuiz({
    name: candidate.value.name,
    email: candidate.value.email,
    topic: activeTopic.value,
    count: questionCount.value,
    difficulty: activeDifficulty.value
  });
};

// Return to setup for a new topic
const newQuiz = () => {
  status.value = 'start';
  questions.value = [];
  userAnswers.value = [];
  errorMessage.value = '';
};
</script>

<template>
  <div id="app">
    <!-- Top Navigation Bar -->
    <header class="app-header">
      <div class="container header-content">
        <div class="brand-wrapper" @click="newQuiz">
          <div class="brand-logo-icon">
            🎯
          </div>
          <div>
            <div class="brand-title">BHASKAR SAH</div>
            <div class="brand-tagline">Professional Quiz App</div>
          </div>
        </div>

        <div style="display: flex; align-items: center; gap: 14px;">
          <div v-if="status === 'ready'" class="header-badge" style="background: rgba(16, 185, 129, 0.12); border-color: rgba(16, 185, 129, 0.3); color: #34d399;">
            <span class="dot"></span>
            Quiz In Progress
          </div>
          <div v-else-if="status === 'finished'" class="header-badge" style="background: rgba(99, 102, 241, 0.15); color: #c7d2fe;">
            <span>✓</span> Completed
          </div>
          <div v-else class="header-badge">
            <span class="dot"></span>
            Online
          </div>
        </div>
      </div>
    </header>

    <!-- Main Screens Routing -->
    <main style="flex: 1; padding: 20px 0;">
      <!-- Screen 1: Candidate Entry & Topic Configuration -->
      <StartScreen
        v-if="status === 'start'"
        :errorMessage="errorMessage"
        :initialUser="candidate"
        @start-quiz="startQuiz"
      />

      <!-- Screen 2: Loading State with Topic Details -->
      <Loader
        v-if="status === 'loading'"
        :topic="activeTopic"
        :count="questionCount"
      />

      <!-- Screen 3: Interactive Examination -->
      <Quiz
        v-if="status === 'ready'"
        :questions="questions"
        :candidate="candidate"
        :topic="activeTopic"
        @finish-quiz="handleFinishQuiz"
      />

      <!-- Screen 4: Score Dashboard & Certificate -->
      <Result
        v-if="status === 'finished'"
        :userAnswers="userAnswers"
        :candidate="candidate"
        :topic="activeTopic"
        :timeSpentSeconds="timeSpentSeconds"
        @restart-quiz="retakeQuiz"
        @new-quiz="newQuiz"
      />
    </main>

    <!-- Footer -->
    <footer class="no-print" style="border-top: 1px solid var(--border-subtle); padding: 24px 0; font-size: 13px; color: var(--text-muted); text-align: center;">
      <div class="container" style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
        <div>
          © {{ new Date().getFullYear() }} BHASKAR SAH. All Rights Reserved.
        </div>
        <div style="display: flex; gap: 16px;">
          <span>Topic-Based Assessment</span>
          <span>Instant Score Report</span>
          <span>Verified Certificate</span>
        </div>
      </div>
    </footer>
  </div>
</template>
