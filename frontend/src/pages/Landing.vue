<template>
  <div class="landing">
    <section class="hero">
      <div class="hero-text">
        <h1>Find Your Next Tech Job</h1>
        <p>
          iJob is the best platform to help you find tech jobs, improve your CV
          and apply to relevant job openings.
        </p>
        <button class="cta-button" @click="getStarted">Get Started</button>
      </div>
      <div class="hero-illustration slide-in">
        <img :src="dashboardIllustration" alt="Tech Dashboard" />
      </div>
    </section>
  </div>
  <div class="background">
    <span></span>
    <span></span>
    <span></span>
    <span></span>
    <span></span>
  </div>
  <section class="cv-analysis">
    <div
      class="cv-analysis-illustration"
      ref="cvAnalysisIllustrationRef"
      :class="{ 'slide-in-left': isCvAnalysisVisible }"
    >
      <img :src="cvAnalysisIllustration" alt="CV Analysis Report" />
    </div>
    <div class="cv-analysis-text">
      <h2>Receive Complete Analysis of Your CV</h2>
      <p>
        Get detailed insights into how your CV matches the positions you apply
        for. Identify areas for improvement and stand out to recruiters.
      </p>
    </div>
  </section>
</template>

<script setup>
import router from "../router";
import { ref, onMounted, onUnmounted } from "vue";
import dashboardIllustration from "../assets/dashboard_info_illustration.png";
import cvAnalysisIllustration from "../assets/cv_analysis_illustration.png";

const getStarted = () => {
  router.push({ name: "account-type-selection-route" });
};

const cvAnalysisIllustrationRef = ref(null);
const isCvAnalysisVisible = ref(false);

const handleIntersection = (entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      isCvAnalysisVisible.value = true;
    }
  });
};

let observer = null;

onMounted(() => {
  observer = new IntersectionObserver(handleIntersection, {
    threshold: 0.2,
  });

  if (cvAnalysisIllustrationRef.value) {
    observer.observe(cvAnalysisIllustrationRef.value);
  }
});

onUnmounted(() => {
  if (observer && cvAnalysisIllustrationRef.value) {
    observer.unobserve(cvAnalysisIllustrationRef.value);
  }
});
</script>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600;700&display=swap");

.landing {
  font-family: "Poppins", sans-serif;
  background: white;
  color: black;
  height: 850px;
  padding: 0;
}

.hero {
  margin: 0 auto;
  max-width: 65%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 80px 5%;
}

.hero-text {
  max-width: 50%;
  text-align: left;
}

h1 {
  font-size: 2.8rem;
  font-weight: bold;
}

p {
  font-size: 1.2rem;
  margin: 20px 0;
}

.cta-button {
  font-family: "Poppins", sans-serif;
  background: #00c49a;
  color: white;
  border: none;
  padding: 12px 24px;
  font-size: 18px;
  border-radius: 30px;
  cursor: pointer;
  transition: background 0.3s ease;
}

.cta-button:hover {
  background: #00a880;
}

.hero-illustration img {
  max-width: 500px;
  transform: rotate(-4deg);
}

@keyframes slideInRight {
  0% {
    transform: translateX(100vw) rotate(8deg);
    opacity: 0;
  }
  60% {
    transform: translateX(-10px) rotate(-2deg);
    opacity: 1;
  }
  100% {
    transform: translateX(0) rotate(0deg);
    opacity: 1;
  }
}

.slide-in {
  animation: slideInRight 1.2s ease-out forwards;
}

.background {
  position: absolute;
  width: 100%;
  height: 100%;
  transform: skewY(12deg);
  z-index: 1;
  transform-origin: 100%;
  background: linear-gradient(-150deg, #222222 15%, #373737 70%, #3c4859 94%);
}

.background * {
  box-sizing: border-box;
}

.background span {
  position: absolute;
  height: 190px;
  transition: 0.4s all;
}

.background span:nth-child(1) {
  display: none;
  top: 0;
  width: 33.33333%;
  right: -16.66666%;
  background: #373737;
}

.background span:nth-child(2) {
  width: 33.33333%;
  top: 0;
  right: 16.66666%;
  left: auto;
  bottom: auto;
  background: #2e2e2e;
}

.background span:nth-child(3) {
  width: 33.33333%;
  right: 49.99999%;
  bottom: auto;
  left: auto;
  background: #222222;
}

.background span:nth-child(4) {
  width: 33.33333%;
  top: 380px;
  left: -16.66666%;
  background: #383d44;
}

.background span:nth-child(5) {
  width: 33.33333%;
  right: 0;
  bottom: 0;
  background: #2e2e2e;
}

@keyframes float {
  0%,
  100% {
    transform: translateY(0) scale(1);
  }
  50% {
    transform: translateY(-40px) scale(1.1);
  }
}

.cv-analysis {
  font-family: "Poppins", sans-serif;
  position: relative;
  z-index: 10;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 40px 5%;
  box-sizing: border-box;
  max-width: 75%;
  margin: 0 auto;
  color: white;
  margin-top: -150px;
}

.cv-analysis-text {
  max-width: 45%;
  text-align: right;
}

.cv-analysis h2 {
  font-size: 2.4rem;
  font-weight: bold;
  margin-bottom: 20px;
}

.cv-analysis p {
  font-size: 1.2rem;
  line-height: 1.6;
}

.cv-analysis-illustration {
  max-width: 55%;
}

.cv-analysis-illustration img {
  max-width: 100%;
  transform: rotate(2deg);
}

@keyframes slideInLeft {
  0% {
    transform: translateX(-100vw) rotate(-8deg);
    opacity: 0;
  }
  60% {
    transform: translateX(10px) rotate(2deg);
    opacity: 1;
  }
  100% {
    transform: translateX(0) rotate(0deg);
    opacity: 1;
  }
}

.slide-in-left {
  animation: slideInLeft 1.2s ease-out forwards;
}

@media (max-width: 1300px) {
  .landing {
    height: 650px;
  }

  .hero {
    flex-direction: column;
    text-align: center;
  }

  .hero-text {
    max-width: 100%;
    text-align: center;
  }

  .hero-illustration {
    display: none;
  }

  .cta-button {
    margin-top: 20px;
  }

  .cv-analysis {
    flex-direction: column;
    align-items: center;
    text-align: center;
    margin-top: auto;
  }

  .cv-analysis-text {
    max-width: 100%;
    margin-top: 20px;
    text-align: center;
  }

  .cv-analysis-illustration {
    max-width: 100%;
  }
}
</style>
