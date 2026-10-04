<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { commentIdentity, commentIdentityAliases, type CommentProvider } from '../lib/comments'
import { loadProviderClient, type CdnMode } from '../lib/comment-adapters'
import GiscusComment from './GiscusComment.vue'

interface ProviderSettings { [key: string]: string | number | boolean | readonly string[] | undefined }
interface Labels { loading: string; setupMissing: string; loadError: string }
interface Props {
  provider: Exclude<CommentProvider, 'none'>
  legacyUid: string
  canonicalPath: string
  legacyPath: string
  title: string
  locale: 'en' | 'zh-CN'
  cdnMode?: CdnMode
  settings: ProviderSettings
  labels: Labels
  noScriptText: string
}
const props = defineProps<Props>()
const host = ref<HTMLElement>()
const status = ref('')
let valineThemeObserver: MutationObserver | undefined
const identity = computed(() => commentIdentity(props.provider, {
  legacyUid: props.legacyUid, canonicalPath: props.canonicalPath, legacyPath: props.legacyPath,
}))
const aliases = computed(() => commentIdentityAliases(props.provider, {
  legacyUid: props.legacyUid, canonicalPath: props.canonicalPath, legacyPath: props.legacyPath,
}))
const providerLanguage = computed(() => props.settings.language === 'auto' || !props.settings.language
  ? props.locale : props.settings.language)

function hasRequiredSettings(): boolean {
  switch (props.provider) {
    case 'giscus': return true // Required settings are validated at build time.
    case 'valine': return Boolean(props.settings.appId && props.settings.appKey)
    case 'twikoo': return Boolean(props.settings.envId)
    case 'waline': return Boolean(props.settings.serverUrl)
  }
}

onMounted(async () => {
  if (props.provider === 'giscus') return
  if (!host.value) return
  status.value = props.labels.loading
  if (!hasRequiredSettings()) {
    status.value = props.labels.setupMissing
    return
  }
  if (props.provider === 'valine') {
    const syncValineTheme = () => host.value?.classList.toggle('night', document.documentElement.dataset.theme === 'dark')
    syncValineTheme()
    valineThemeObserver = new MutationObserver(syncValineTheme)
    valineThemeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
  }
  try {
    const client = await loadProviderClient(props.provider, {
      twikooEnvId: props.provider === 'twikoo' ? String(props.settings.envId || '') : undefined,
      cdnMode: props.cdnMode,
    })
    if (props.provider === 'valine') {
      const Valine = client as unknown as new (options: Record<string, unknown>) => unknown
      new Valine({
        el: host.value, appId: props.settings.appId, appKey: props.settings.appKey, path: identity.value,
        avatar: props.settings.avatar, placeholder: props.settings.placeholder, visitor: props.settings.visitor,
        avatarForce: props.settings.avatarForce, lang: providerLanguage.value,
        meta: props.settings.meta, requiredFields: props.settings.requiredFields,
      })
    } else if (props.provider === 'twikoo') {
      const twikoo = client as unknown as { init(options: Record<string, unknown>): Promise<void> }
      await twikoo.init({
        envId: props.settings.envId, region: props.settings.region || undefined,
        el: host.value, path: identity.value, lang: providerLanguage.value,
      })
    } else {
      const Waline = client as unknown as { init(options: Record<string, unknown>): unknown }
      await Waline.init({
        el: host.value, serverURL: props.settings.serverUrl, path: identity.value, lang: providerLanguage.value,
        reaction: props.settings.reaction, login: props.settings.login, meta: props.settings.meta,
        requiredMeta: props.settings.requiredMeta, commentSorting: props.settings.commentSorting,
        wordLimit: props.settings.wordLimit, pageSize: props.settings.pageSize,
        dark: "html[data-theme='dark']",
      })
    }
    status.value = ''
  } catch {
    status.value = props.labels.loadError
  }
})

onBeforeUnmount(() => valineThemeObserver?.disconnect())
</script>

<template>
  <div class="comment-island" :data-provider="provider" :data-comment-id="identity" :data-comment-aliases="aliases.join('|')">
    <p v-if="status" class="comment-status" role="status">{{ status }}</p>
    <p class="comment-page-title">{{ title }}</p>
    <!-- With scripting enabled, noscript contents parse as text, not child elements. -->
    <noscript class="comment-status">{{ noScriptText }}</noscript>
    <GiscusComment v-if="provider === 'giscus'" :settings="settings" :legacy-uid="legacyUid" :locale="locale" :loading-text="labels.loading" :error-text="labels.loadError" />
    <div v-else ref="host" class="comment-provider-host"></div>
  </div>
</template>
