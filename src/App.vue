<script setup lang="ts">
import { RouterView } from 'vue-router'
</script>

<template>
  <div id="app">
    <RouterView />
  </div>
</template>

<style>
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family:
    -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
  line-height: 1.6;
  color: #333;
  background-color: #f8f9fa;
}

.btn-primary {
  background: linear-gradient(135deg, #81c784 0%, #388e3c 100%);
  color: white;
}
.btn-primary:hover {
  background: linear-gradient(135deg, #388e3c 0%, #81c784 100%);
}
.container {
  width: 100%;
  padding: 0 1rem;
}

.btn {
  display: inline-block;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 0.25rem;
  text-decoration: none;
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 500;
  text-align: center;
  transition: all 0.2s;
}

.btn-primary {
  background-color: #81c784;
  color: white;
}

.btn-primary:hover {
  background-color: #388e3c;
}

.btn-secondary {
  background-color: #6c757d;
  color: white;
}

.btn-secondary:hover {
  background-color: #545b62;
}
</style>
