<script setup>
import { ref, computed } from 'vue';

const props = defineProps({
  userAnswers: {
    type: Array,
    required: true
  },
  candidate: {
    type: Object,
    default: () => ({ name: 'Candidate', email: '' })
  },
  topic: {
    type: String,
    default: 'Assessment Topic'
  },
  timeSpentSeconds: {
    type: Number,
    default: 0
  }
});

const emit = defineEmits(['restart-quiz', 'new-quiz']);

// Filter for reviewing questions
const activeFilter = ref('all'); // 'all' | 'correct' | 'incorrect'
const copiedNotice = ref(false);

const totalQuestions = computed(() => props.userAnswers.length);

const correctCount = computed(() => {
  return props.userAnswers.filter((item) => item.isCorrect).length;
});

const incorrectCount = computed(() => {
  return totalQuestions.value - correctCount.value;
});

const percentage = computed(() => {
  if (!totalQuestions.value) return 0;
  return Math.round((correctCount.value / totalQuestions.value) * 100);
});

// Performance Grade Classification
const performanceGrade = computed(() => {
  const p = percentage.value;
  if (p >= 85) {
    return {
      title: 'Distinction / Honors',
      class: 'distinction',
      icon: '🏆',
      message: 'Outstanding performance! Demonstrates comprehensive domain mastery.'
    };
  } else if (p >= 70) {
    return {
      title: 'Merit / High Pass',
      class: 'pass',
      icon: '⭐',
      message: 'Great command of core concepts with strong accuracy.'
    };
  } else if (p >= 50) {
    return {
      title: 'Pass',
      class: 'pass',
      icon: '👍',
      message: 'Satisfactory baseline understanding. Review key areas for further growth.'
    };
  } else {
    return {
      title: 'Needs Review',
      class: 'needs-review',
      icon: '📚',
      message: 'Review the explanations below and try again to improve your score.'
    };
  }
});

// Time formatted
const formattedTotalTime = computed(() => {
  const mins = Math.floor(props.timeSpentSeconds / 60);
  const secs = props.timeSpentSeconds % 60;
  if (mins === 0) return `${secs}s`;
  return `${mins}m ${secs}s`;
});

const avgTimePerQuestion = computed(() => {
  if (!totalQuestions.value) return '0s';
  const avg = Math.round(props.timeSpentSeconds / totalQuestions.value);
  return `${avg}s`;
});

// Candidate Initials for Avatar
const candidateInitials = computed(() => {
  if (!props.candidate?.name) return 'EX';
  const parts = props.candidate.name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
});

// Formatted Date
const currentDateFormatted = computed(() => {
  const now = new Date();
  return now.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
});

// Unique Certificate ID
const certificateId = computed(() => {
  const hash = Math.abs(
    ((props.candidate?.name || 'cand') + (props.topic || 'top') + props.timeSpentSeconds)
      .split('')
      .reduce((acc, char) => (acc << 5) - acc + char.charCodeAt(0), 0)
  ).toString(16).toUpperCase().padStart(8, '0');
  return `BS-${hash.slice(0, 4)}-${hash.slice(4, 8)}`;
});

// Filtered questions for review
const filteredQuestions = computed(() => {
  if (activeFilter.value === 'correct') {
    return props.userAnswers.filter((a) => a.isCorrect);
  }
  if (activeFilter.value === 'incorrect') {
    return props.userAnswers.filter((a) => !a.isCorrect);
  }
  return props.userAnswers;
});

// Copy summary to clipboard
const copySummary = async () => {
  const summaryText = `🎯 Quiz Results by BHASKAR SAH\nCandidate: ${props.candidate.name} (${props.candidate.email})\nTopic: ${props.topic}\nScore: ${correctCount.value}/${totalQuestions.value} (${percentage.value}%)\nGrade: ${performanceGrade.value.title}\nDate: ${currentDateFormatted.value}\nCertificate ID: ${certificateId.value}`;
  try {
    await navigator.clipboard.writeText(summaryText);
    copiedNotice.value = true;
    setTimeout(() => {
      copiedNotice.value = false;
    }, 3000);
  } catch (err) {
    console.error('Failed to copy', err);
  }
};

const printCertificate = () => {
  window.print();
};
</script>

<template>
  <div class="container">
    <div class="result-card">
      <!-- Performance Status Banner -->
      <div style="display: flex; justify-content: center;">
        <span class="result-header-badge" :class="performanceGrade.class">
          <span>{{ performanceGrade.icon }}</span>
          <span>Result: {{ performanceGrade.title }}</span>
        </span>
      </div>

      <h1 class="hero-heading" style="font-size: 34px; margin-bottom: 8px;">
        Assessment Score Report
      </h1>
      <p style="color: var(--text-secondary); margin-bottom: 24px; font-size: 15px;">
        {{ performanceGrade.message }}
      </p>

      <!-- Candidate Profile Summary Banner -->
      <div class="candidate-summary-banner">
        <div class="candidate-info-group">
          <div class="candidate-avatar">
            {{ candidateInitials }}
          </div>
          <div>
            <div class="candidate-name">{{ candidate.name }}</div>
            <div class="candidate-email">{{ candidate.email }}</div>
          </div>
        </div>

        <div style="display: flex; gap: 20px; flex-wrap: wrap;">
          <div class="assessment-meta-item">
            Topic: <strong>{{ topic }}</strong>
          </div>
          <div class="assessment-meta-item">
            Date: <strong>{{ currentDateFormatted }}</strong>
          </div>
          <div class="assessment-meta-item">
            Certificate ID: <strong style="font-family: monospace; color: #a5b4fc;">{{ certificateId }}</strong>
          </div>
        </div>
      </div>

      <!-- Radial Circular Score Meter -->
      <div class="score-radial-wrapper">
        <div class="score-circle">
          <svg viewBox="0 0 100 100">
            <defs>
              <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#6366f1" />
                <stop offset="50%" stop-color="#8b5cf6" />
                <stop offset="100%" stop-color="#10b981" />
              </linearGradient>
            </defs>
            <!-- Background track circle -->
            <circle class="score-bg-circle" cx="50" cy="50" r="42" />
            <!-- Progress circle -->
            <circle
              class="score-progress-circle"
              cx="50"
              cy="50"
              r="42"
              stroke-dasharray="264"
              :stroke-dashoffset="264 - (264 * percentage) / 100"
            />
          </svg>
          <div class="score-center-text">
            <div class="score-percent-val">{{ percentage }}%</div>
            <div class="score-sub-label">{{ correctCount }}/{{ totalQuestions }} Correct</div>
          </div>
        </div>
      </div>

      <!-- Core KPI Cards Grid -->
      <div class="kpi-grid">
        <div class="kpi-card">
          <div class="kpi-val" style="color: #34d399;">{{ correctCount }}</div>
          <div class="kpi-label">Correct Answers</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-val" style="color: #fb7185;">{{ incorrectCount }}</div>
          <div class="kpi-label">Incorrect Answers</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-val">{{ formattedTotalTime }}</div>
          <div class="kpi-label">Total Duration</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-val">{{ avgTimePerQuestion }}</div>
          <div class="kpi-label">Avg Pace / Question</div>
        </div>
      </div>

      <!-- Official Certificate of Achievement Frame -->
      <div class="certificate-container">
        <div class="certificate-border-inner">
          <div class="certificate-crest">🏅</div>
          <div class="certificate-title">Certificate of Completion</div>
          <div class="certificate-subtitle">BHASKAR SAH Assessment</div>

          <p class="certificate-presented-to">This certificate is awarded to</p>
          <h2 class="certificate-recipient">{{ candidate.name }}</h2>
          <p class="certificate-recipient-email">{{ candidate.email }}</p>

          <p class="certificate-statement">
            For successfully completing the quiz examination on
            <strong style="text-decoration: underline;">{{ topic }}</strong> with an attained score of
            <strong>{{ correctCount }} out of {{ totalQuestions }} ({{ percentage }}%)</strong>.
          </p>

          <div class="certificate-footer">
            <div style="text-align: left;">
              <div>Issue Date: <strong>{{ currentDateFormatted }}</strong></div>
              <div>Certified By: <strong>BHASKAR SAH</strong></div>
            </div>
            <div style="text-align: right;">
              <div>Certificate ID: <span class="cert-id-tag">{{ certificateId }}</span></div>
              <div style="color: #10b981; font-weight: 700;">✓ Verified Score</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Certificate Action Buttons -->
      <div class="no-print" style="display: flex; justify-content: center; gap: 12px; margin-bottom: 36px; flex-wrap: wrap;">
        <button type="button" class="btn btn-secondary" @click="printCertificate">
          <span>🖨️ Print / Save Certificate PDF</span>
        </button>
        <button type="button" class="btn btn-secondary" @click="copySummary">
          <span>{{ copiedNotice ? '✓ Summary Copied!' : '📋 Copy Results Summary' }}</span>
        </button>
      </div>

      <!-- Detailed Question-by-Question Review -->
      <div class="review-section">
        <div class="review-header">
          <h3 style="font-family: var(--font-display); font-size: 20px; font-weight: 700;">
            Answer Review & Explanations
          </h3>

          <div class="review-filters no-print">
            <button
              type="button"
              class="filter-btn"
              :class="{ active: activeFilter === 'all' }"
              @click="activeFilter = 'all'"
            >
              All ({{ totalQuestions }})
            </button>
            <button
              type="button"
              class="filter-btn"
              :class="{ active: activeFilter === 'correct' }"
              @click="activeFilter = 'correct'"
            >
              Correct ({{ correctCount }})
            </button>
            <button
              type="button"
              class="filter-btn"
              :class="{ active: activeFilter === 'incorrect' }"
              @click="activeFilter = 'incorrect'"
            >
              Incorrect ({{ incorrectCount }})
            </button>
          </div>
        </div>

        <div v-for="(item, idx) in filteredQuestions" :key="idx" class="review-card" :class="item.isCorrect ? 'correct' : 'incorrect'">
          <div class="review-card-header">
            <div class="status-icon-badge">
              {{ item.isCorrect ? '✓' : '✕' }}
            </div>
            <div class="review-question-title">
              {{ item.question.question }}
            </div>
          </div>

          <div class="answer-comparison">
            <div class="ans-row">
              <span class="ans-label">Your Answer:</span>
              <span class="ans-val" :class="item.isCorrect ? 'correct-text' : 'wrong-text'">
                {{ item.userAnswer }}
              </span>
            </div>

            <div v-if="!item.isCorrect" class="ans-row">
              <span class="ans-label">Correct Answer:</span>
              <span class="ans-val correct-text">
                {{ item.question.correct_answer }}
              </span>
            </div>
          </div>

          <!-- Educational Explanation -->
          <div v-if="item.question.explanation || item.explanation" class="explanation-callout">
            <strong style="color: #ffffff;">Explanation:</strong>
            {{ item.question.explanation || item.explanation }}
          </div>
        </div>
      </div>

      <!-- Bottom Navigation Buttons -->
      <div class="no-print" style="display: flex; justify-content: center; gap: 16px; margin-top: 40px; border-top: 1px solid var(--border-subtle); padding-top: 28px; flex-wrap: wrap;">
        <button type="button" class="btn btn-secondary btn-lg" @click="emit('restart-quiz')">
          <span>🔄 Retake This Quiz</span>
        </button>
        <button type="button" class="btn btn-primary btn-lg" @click="emit('new-quiz')">
          <span>✨ Test Another Topic</span>
        </button>
      </div>
    </div>
  </div>
</template>