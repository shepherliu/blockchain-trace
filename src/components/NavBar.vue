<template>
  <el-row>
    <!-- project logo -->
    <el-col :span="2">
      <div style="float: right;">
        <el-image style="width: 35px;height: 33px; float: right;margin-right: 10px;margin-top: 10px;" :src="logo"/>
      </div>        
    </el-col> 

    <!-- project menus -->
    <el-col :span="10">
      <el-menu
        :default-active="activeIndex"
        class="el-menu-demo"
        mode="horizontal"
        :ellipsis="false"
        :unique-opened="true"
        background-color="#606266"
        style="float: left;width: 100%;"
        text-color="#fff"
        active-text-color="#ffd04b"
        @select="handleSelect"
      >
        <el-menu-item index="1">Tokens</el-menu-item>
        <el-menu-item index="2">Holders</el-menu-item>
        <el-menu-item index="3">Transactions</el-menu-item>
        <el-menu-item index="4">LogEvents</el-menu-item>
        <el-menu-item index="5">Identitys</el-menu-item>
      </el-menu>
    </el-col>

    <!-- search component -->
    <el-col :span="3">
      <el-input size="large" v-model="searchContent" placeholder="Search" style="margin-top: 10px;">
      </el-input>
    </el-col>
    
    <el-col :span="1">
      <el-button circle color="#606266" size="large" style="margin-top: 10px;" @click="onSearchContent">
        <el-icon :size="20"><search /></el-icon>
      </el-button>
    </el-col>  
    
    <!-- notify component -->
    <el-col :span="4">
      <el-popover
        placement="bottom-start"
        title="Transactions"
        :width="200"
        trigger="click"
      >
        <template #reference>
          <el-button 
            circle 
            color="#606266" 
            size="large" 
            style="margin-top: 10px;
            float: right;"
            @click="onClickNotify"
          >
            <el-badge 
              :isDot="transactionCount>0" 
              :max="99" 
              class="item" 
              style="margin-top: 15px;"
              type="primary"
            >
              <el-icon :size="20"><bell /></el-icon>
            </el-badge>
          </el-button>
        </template>
        <el-row :gutter="20">
          <template v-for="tx in transactions" :key="tx">
            <el-col :span="20">
              <el-link type="primary" :href="transactionExplorerUrl(tx)" target="_blank">{{tools.shortString(tx)}}</el-link>
              <el-icon @click="onClickToCopy(tx)" style="margin-left: 10px;"><document-copy /></el-icon>
            </el-col>
          </template>
        </el-row>
        <el-button size="small" type="primary" style="float: right;" @click="onClearTransactions">Clear</el-button>
      </el-popover> 
    </el-col>       
    
    <!-- user addr -->
    <el-col :span="3">
      <el-popover
        placement="bottom-start"
        :title="networkName"
        :width="200"
        trigger="hover"
      >
        <template #reference>
          <a v-if="userName != ''" @click="onClickToCopy(userName)" style="margin-top: 17px;padding-right: 10px;float: right;">{{shortName}}</a>
          <a v-if="userName === ''" @click="onClickToCopy(userAddr)" style="margin-top: 17px;padding-right: 10px;float: right;">{{shortAddr}}</a>
        </template>
        <el-row :gutter="20" v-if="userName != ''">
          <a @click="onClickToCopy(userName)" style="margin-top: 17px">{{userName}}</a><br/>
        </el-row>
        <el-row :gutter="20">
          <a @click="onClickToCopy(userAddr)" style="margin-top: 17px">{{userAddr}}</a>
        </el-row>
      </el-popover>      
    </el-col>

    <!-- connect component -->
    <el-col :span="1">
      <div style="float: right;">
          <el-dropdown button trigger="click" style="width: 35px;height: 33px; float: right;margin-right: 20px;margin-top: 10px;">
            <el-image :src="metamask" />
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item @click="onConnect" :innerText="connectStatus"></el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
      </div>  
    </el-col>

  </el-row>

</template>

<script lang="ts">  
export default {
  name: 'NavBar',
  props: {
  },
}
</script>

<script setup lang="ts">
import { ref } from "vue"

// import { Resolution } from '@unstoppabledomains/resolution';

import * as tools from "../libs/tools"
import * as connect from "../libs/connect"
import * as network from "../libs/network"
import * as element from "../libs/element"

import * as constant from "../constant"

const logo = require('@/assets/logo.png');
const metamask = require('@/assets/metamask.svg');
// const resolution = new Resolution();
const userName = connect.connectState.userName;
const shortName = connect.connectState.shortName;
const userAddr = connect.connectState.userAddr;
const shortAddr = connect.connectState.shortAddr;
const networkName = ref("");
const searchContent = ref("");
const activeIndex = connect.connectState.activeIndex;
const connectStatus = ref("Connect Wallet");
const transactions = connect.connectState.transactions;
const transactionCount = connect.connectState.transactionCount;

//transaction explore url
const transactionExplorerUrl = (transaction:string) => {
  for(const i in constant.chainList){
    if(connect.connectState.chainId === constant.chainList[i].chainId){
      const blockExplorerUrls = constant.chainList[i].blockExplorerUrls;
      return blockExplorerUrls + '/tx/' + transaction;
    }
  }

  return transaction;
}

//connect to metamask
const connectNetwork = async () => {
  await connect.networkConnect().then(async (res) => {
    if(res){
      element.elMessage('success', 'You have connected to the wallet.');
    }else{
      await connect.cancelConnect();
      userAddr.value = "";
      shortName.value = "";
      shortAddr.value = "";
      networkName.value = "";
      connectStatus.value = "Connect Wallet";

      element.elMessage('error', 'Connect to the wallet failed.');  
    }
         
  });
}

//set connect callback function
connect.connectState.connectCallback = async () => {
    userName.value = connect.connectState.userName.value;
    shortName.value = tools.shortString(userName.value);
    userAddr.value = connect.connectState.userAddr.value;
    shortAddr.value = tools.shortString(userAddr.value);

    networkName.value = network.getChainName(connect.connectState.chainId);
    connectStatus.value = "Cancel Connect";  
};

//disconnect from metamask
const disConnectNetwork = async () => {
    await connect.cancelConnect();

    connectStatus.value = "Connect Wallet";
    userName.value = "";
    shortName.value = "";
    userAddr.value = "";
    shortAddr.value = "";
    networkName.value = "";

    element.elMessage('warning', 'You have disconnected to the wallet.');                     
}

//on wallet address changed
const accountsChanged = async (accounts: string[]) => {
  if(accounts.length === 0){
    return await disConnectNetwork();
  }

  if(connectStatus.value === "Cancel Connect"){
    await connectNetwork();
    connect.connectState.searchCallback();
  }
}

connect.connectState.accountsChanged = accountsChanged;

//on wallet network changed
const chainChanged = async () => {
  //clear transactions when network changed
  connect.connectState.transactions.value = new Array();
  connect.connectState.transactionCount.value = 0;

  if(!(await connect.connected())){
    return;
  }

  if(connectStatus.value === "Cancel Connect"){
    await connect.connectState.connectCallback();
    connect.connectState.searchCallback();
  } 
}

connect.connectState.chainChanged = chainChanged;

//on click to clear transtractions
const onClearTransactions = async () => {
  connect.connectState.transactions.value = new Array();
  connect.connectState.transactionCount.value = 0; 
}

//on click to copy address
const onClickToCopy = async (content:string) => {
  tools.clickToCopy(content);
  
  element.elMessage('success', 'Copy ' + content + ' to clipboard success.');     
};

//on click notify
const onClickNotify = async () => {
  transactionCount.value = 0;
}

//on content search
const onSearchContent = async () => {
  connect.connectState.search = searchContent.value.trim();
  await connect.connectState.searchCallback();
  searchContent.value = '';
  connect.connectState.search = '';
}

//on connect clicked
const onConnect = async () => {
  if(connectStatus.value === "Cancel Connect"){      
    return await disConnectNetwork();
  } else {
    return await connectNetwork();
  }
};

//on menus selected
const handleSelect = (key: string, keyPath: string[]) => {
  activeIndex.value = key;

  tools.setUrlParamter('activeIndex', activeIndex.value);
};    

//login to wallet and switch to the target chain.
const login = async () => {
  await connectNetwork();
  connect.connectState.searchCallback();
};

//try get activeIndex from the url paramter
try{
  activeIndex.value = String(tools.getUrlParamter('activeIndex'));
  if(activeIndex.value != '1' && 
    activeIndex.value != '2' && 
    activeIndex.value != '3' && 
    activeIndex.value != '4' &&
    activeIndex.value != '5'){
    activeIndex.value = '1';
  }
}catch(e){
  activeIndex.value = '1';
}

//set activeIndex to connectState and location.href
connect.connectState.activeIndex.value = activeIndex.value;
tools.setUrlParamter('activeIndex', activeIndex.value);

//try connect to metamask
login();
</script>
