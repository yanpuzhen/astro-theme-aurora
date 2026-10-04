<script setup lang="ts">
import { onMounted, ref } from 'vue'
import type { CdnMode, CommentProvider } from '../lib/comment-adapters'
import { fetchRecentComments, type RecentComment } from '../lib/recent-comments'

interface Settings { twikoo: { envId: string; region: string }; waline: { serverUrl: string; language: string } }
const props = defineProps<{
  provider: Extract<CommentProvider, 'twikoo' | 'waline'>
  settings: Settings
  count: number
  base: string
  siteOrigin: string
  locale: 'en' | 'zh-CN'
  cdnMode?: CdnMode
  emptyText: string
  loadingText: string
  errorText: string
}>()
const comments = ref<RecentComment[]>([])
const status = ref<'loading' | 'ready' | 'error'>('loading')

onMounted(async () => {
  try {
    comments.value = await fetchRecentComments(props.provider, props.settings, props.count, props.base, props.siteOrigin, props.cdnMode)
    status.value = 'ready'
  } catch {
    status.value = 'error'
  }
})
</script>

<template>
  <p v-if="status === 'loading'" class="empty-state" role="status">{{ loadingText }}</p>
  <p v-else-if="status === 'error'" class="empty-state" role="status">{{ errorText }}</p>
  <p v-else-if="comments.length === 0" class="empty-state">{{ emptyText }}</p>
  <ul v-else class="recent-comment-list">
    <li v-for="comment in comments" :key="comment.id">
      <img v-if="comment.avatar" :src="comment.avatar" alt="" loading="lazy" referrerpolicy="no-referrer" />
      <div>
        <a :href="comment.href">{{ comment.author }}</a>
        <p>{{ comment.content }}</p>
        <time v-if="comment.createdAt" :datetime="comment.createdAt">{{ new Date(comment.createdAt).toLocaleDateString(locale) }}</time>
      </div>
    </li>
  </ul>
</template>
