<template>
  <TokensPage v-if="activeIndex==='1'" />
  <HoldersPage v-if="activeIndex==='2'"/>
  <TransactionsPage v-if="activeIndex==='3'"/>
  <LogeventsPage v-if="activeIndex==='4'"/>
  <IdentitysPage v-if="activeIndex==='5'"/>
</template>

<script lang="ts">
import TokensPage from './TokensPage.vue';
import HoldersPage from './HoldersPage.vue';
import TransactionsPage from './TransactionsPage.vue';
import LogeventsPage from './LogeventsPage.vue';
import IdentitysPage from './IdentitysPage.vue';

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