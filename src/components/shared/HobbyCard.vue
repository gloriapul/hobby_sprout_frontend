<template>
  <div class="hobby-card">
    <div class="hobby-icon">
      {{ getHobbyIcon(hobby) }}
    </div>
    <div class="hobby-content">
      <h4>{{ hobby }}</h4>
      <p>{{ getHobbyDescription(hobby) }}</p>
    </div>
    <div class="hobby-actions">
      <button @click="$emit('remove', hobby)" class="remove-button" title="Remove hobby">×</button>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  hobby: string
}

defineProps<Props>()
defineEmits<{
  remove: [hobby: string]
}>()

const getHobbyIcon = (hobby: string): string => {
  const icons: Record<string, string> = {
    Photography: '📸',
    Cooking: '👨‍🍳',
    Reading: '📚',
    Writing: '✍️',
    Painting: '🎨',
    Music: '🎵',
    Gaming: '🎮',
    Fitness: '💪',
    Gardening: '🌱',
    Travel: '✈️',
    Dance: '💃',
    Singing: '🎤',
    Drawing: '✏️',
    Yoga: '🧘',
    Running: '🏃',
    Swimming: '🏊',
    Cycling: '🚴',
    Hiking: '🥾',
    Chess: '♟️',
    Knitting: '🧶',
    Pottery: '🏺',
    Baking: '🍰',
    Woodworking: '🔨',
    Coding: '💻',
    Learning: '🎓',
  }

  return icons[hobby] || '🎯'
}

const getHobbyDescription = (hobby: string): string => {
  const descriptions: Record<string, string> = {
    Photography: 'Capture beautiful moments',
    Cooking: 'Create delicious meals',
    Reading: 'Explore new worlds through books',
    Writing: 'Express yourself through words',
    Painting: 'Create beautiful artwork',
    Music: 'Make and enjoy music',
    Gaming: 'Play and enjoy video games',
    Fitness: 'Stay healthy and strong',
    Gardening: 'Grow plants and flowers',
    Travel: 'Explore new places',
    Dance: 'Move to the rhythm',
    Singing: 'Express through voice',
    Drawing: 'Create art with pencils',
    Yoga: 'Find inner peace and flexibility',
    Running: 'Stay fit and explore',
    Swimming: 'Enjoy water activities',
    Cycling: 'Ride and explore',
    Hiking: 'Explore nature on foot',
    Chess: 'Strategic thinking game',
    Knitting: 'Create with yarn',
    Pottery: 'Shape clay into art',
    Baking: 'Create sweet treats',
    Woodworking: 'Craft with wood',
    Coding: 'Build digital solutions',
    Learning: 'Acquire new knowledge',
  }

  return descriptions[hobby] || 'A wonderful hobby to explore'
}
</script>

<style scoped>
.hobby-card {
  background: white;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 1rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  transition: all 0.2s;
  position: relative;
}

.hobby-card:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transform: translateY(-1px);
}

.hobby-icon {
  font-size: 2rem;
  flex-shrink: 0;
}

.hobby-content {
  flex: 1;
  min-width: 0;
}

.hobby-content h4 {
  margin: 0 0 0.25rem 0;
  color: #333;
  font-size: 1rem;
  font-weight: 600;
}

.hobby-content p {
  margin: 0;
  color: #666;
  font-size: 0.85rem;
  line-height: 1.3;
}

.hobby-actions {
  flex-shrink: 0;
}

.remove-button {
  background: #dc3545;
  color: white;
  border: none;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 16px;
  line-height: 1;
  opacity: 0.7;
  transition: opacity 0.2s;
}

.remove-button:hover {
  opacity: 1;
}
</style>
