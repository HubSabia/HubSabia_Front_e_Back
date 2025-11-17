<template>
  <div class="history-sidebar">
    <button @click="$emit('newChat')" class="new-chat-button">
      + Nova Conversa
    </button>
    <div class="history-list">
      <div v-if="conversations.length === 0" class="empty-history">
        Nenhuma conversa anterior.
      </div>
      <div
        v-for="convo in conversations"
        :key="convo.id"
        class="history-item"
        :class="{ active: convo.id === activeConversationId }"
        @click="$emit('select', convo.id)"
      >
        <p class="history-title">{{ convo.title }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  conversations: { type: Array, required: true },
  activeConversationId: { type: String, default: null }
});

defineEmits(['newChat', 'select']);
</script>

<style scoped>
.history-sidebar {
  width: 260px;
  background-color: var(--sidebar-bg);
  color: #fff;
  display: flex;
  flex-direction: column;
  padding: 10px;
  height: 100%;
}

.new-chat-button {
  background-color: transparent;
  border: 1px solid #555;
  color: #fff;
  padding: 10px;
  border-radius: 5px;
  cursor: pointer;
  text-align: left;
  margin-bottom: 20px;
  transition: background-color 0.2s;
}

.new-chat-button:hover {
  background-color: #343541;
}

.history-list {
  overflow-y: auto;
  flex-grow: 1;
}

.empty-history {
  color: #8e8ea0;
  padding: 10px;
  font-style: italic;
}

.history-item {
  padding: 12px 10px;
  border-radius: 5px;
  cursor: pointer;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-bottom: 5px;
}

.history-item:hover {
  background-color: #343541;
}

.history-item.active {
  background-color: #40414f;
  font-weight: bold;
}

.history-title {
  margin: 0;
}
</style>
