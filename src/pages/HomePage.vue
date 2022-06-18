<template>
  <TokensPage v-if="activeIndex==='1'" />
<!--   <FoldersPage v-if="activeIndex==='2'"/>
  <WebsitesPage v-if="activeIndex==='3'"/> -->
</template>

<script lang="ts">
import TokensPage from './TokensPage.vue';
// import FoldersPage from './FoldersPage.vue';
// import WebsitesPage from './WebsitesPage.vue';

export default {
  name: 'HomePage',
  props: {
    msg: String
  }
}
</script>

<script setup lang="ts">
import { connectState } from "../libs/connect"

const activeIndex = connectState.activeIndex;
</script>