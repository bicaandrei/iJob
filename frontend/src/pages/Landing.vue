<template>
  <div class="landing">
    <section class="hero">
      <div class="hero-text">
        <h1>Find Your Next Tech Job</h1>
        <p>
          iJob helps IT professionals discover new job opportunities and analyze
          CVs effortlessly.
        </p>
        <button class="cta-button" @click="getStarted">Get Started</button>
      </div>
    </section>
  </div>
</template>

<script setup>
const getStarted = () => {
  console.log("Get Started clicked");
};
</script>

<style scoped>
.landing {
  background: linear-gradient(135deg, #1e1e1e, #2a2a2a);
  color: white;
  text-align: center;
  padding: 50px 5%;
}

.hero {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 50px 0;
}

.hero-text {
  max-width: 50%;
  text-align: left;
}

h1 {
  font-size: 2.5rem;
}

p {
  font-size: 1.2rem;
  margin: 15px 0;
}

.cta-button {
  background: #007bff;
  color: white;
  border: none;
  padding: 12px 24px;
  font-size: 18px;
  border-radius: 5px;
  cursor: pointer;
}

.cta-button:hover {
  background: #0894e6;
}

.hero-image {
  max-width: 40%;
}
</style>
