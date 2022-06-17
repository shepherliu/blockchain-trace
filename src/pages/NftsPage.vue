<template>
  <div class="file-arae">
    <el-container>
      <el-header style="background-color: #ffffff;">
        <el-tabs v-model="activeName" class="file-tabs" @tab-click="handleClick">
          <el-tab-pane label="Image" name="image"></el-tab-pane>
          <el-tab-pane label="Audio" name="audio"></el-tab-pane>
          <el-tab-pane label="Video" name="video"></el-tab-pane>
          <el-tab-pane label="MyNfts" name="mine"></el-tab-pane>
        </el-tabs>
        <el-popover
          placement="bottom-start"
          title="Introduction"
          :width="400"
          trigger="hover"
        >
          <template #reference>
            <el-link type="primary" @click="javascript:void(0);" style="margin-left: 10px;">Max NFTs: {{baseInfo.maxtotalSupply}}</el-link>
          </template>
          <h4>The max number that this NFT project can be minted.</h4>
        </el-popover>
        <el-popover
          placement="bottom-start"
          title="Introduction"
          :width="400"
          trigger="hover"
        >
          <template #reference>
            <el-link type="success" @click="javascript:void(0);" style="margin-left: 10px;">Minted NFTs: {{baseInfo.currentTotalSupply}}</el-link>
          </template>
          <h4>The current number that this NFT project has already be minted.</h4>
        </el-popover>
        <el-popover
          placement="bottom-start"
          title="Introduction"
          :width="400"
          trigger="hover"
        >
          <template #reference>
            <el-link type="warning" @click="javascript:void(0);" style="margin-left: 10px;">My Limits: {{baseInfo.maxUserSupply}}</el-link>
          </template>
          <h4>The max number that this NFT project can be minted for every single user.</h4>
        </el-popover>
        <el-popover
          placement="bottom-start"
          title="Introduction"
          :width="400"
          trigger="hover"
        >
          <template #reference>
            <el-link type="info" @click="javascript:void(0);" style="margin-left: 10px;">My Mints: {{baseInfo.currentUserBalance}}</el-link> 
          </template>
          <h4>The current number that this NFT project has already be minted for the current user.</h4>
        </el-popover>
        <el-popover
          placement="bottom-start"
          title="Introduction"
          :width="400"
          trigger="hover"
        >
          <template #reference>
            <el-link type="danger" @click="javascript:void(0);" style="margin-left: 10px;">User Banned: {{baseInfo.currentUserBanned}}</el-link>   
          </template>
          <h4>The current user has be banned or not. For users who get more than {{baseInfo.maxUserHates}} unlikes will be banned from this NFT project until they burn their low quility NFTs.</h4>
        </el-popover>
        <el-popover
          placement="bottom-start"
          title="Introduction"
          :width="400"
          trigger="hover"
        >
          <template #reference>
            <el-link type="primary" @click="onClaimRewards()" style="float: right;">Claim : {{baseInfo.currentUserRewards}}</el-link>
          </template>
          <h4>Claim the rewards that the current user earned from the NFTs.</h4>
        </el-popover>        
  
      </el-header>
      <el-main
        style="height: 450px;" 
        v-loading="loadStatus" 
        element-loading-text="Loading..."
        :element-loading-spinner="svg"
        element-loading-svg-view-box="-10, -10, 50, 50"
        element-loading-background="#ffffff"
      >
        <el-row :gutter="20">
          <template v-for="nft in nftList" :key="nft.tokenUri">
              <el-col :span="8">
                <el-card class="box-card">
                  <template #header>
                    <div class="card-header">
                      <span>NFT ID: <el-link type="success" target="_blank" :href="tokenExplorerUrl(nft.tokenId, nft.tokenUri)">{{nft.tokenId}}</el-link></span>
                      <el-button-group>
                        <el-button v-if="activeName==='mine' && nft.tokenPrices === 0" size="small" type="warning" @click="onSellNft(nft.tokenId)">
                          Sell<el-icon><sell /></el-icon>
                        </el-button>
                        <el-button v-if="activeName!='mine' && nft.tokenPrices > 0 && !nft.tokenOwner" size="small" type="warning" @click="onBuyNft(nft.tokenId, nft.tokenPrices)">
                          Buy Price: {{nft.tokenPrices.toFixed(3)}}<el-icon><sell /></el-icon>
                        </el-button>                                                         
                        <el-button v-if="activeName==='mine'" size="small" type="danger" @click="onSendNft(nft.tokenId)">
                          Send<el-icon><Position /></el-icon>
                        </el-button>
                      </el-button-group>
                    </div>
                  </template>
                  <img v-if="nft.tokenType==='image'" :src="nft.tokenUri" style="width: 200px;height: 200px;" />
                  <audio v-if="nft.tokenType==='audio'" :src="nft.tokenUri" controls preload style="width: 200px;height: 200px;" />
                  <video v-if="nft.tokenType==='video'" :src="nft.tokenUri" controls preload style="width: 200px;height: 200px;" />
                  <div>
                    <el-link type="primary" @click="onLikeNft(nft.tokenId)">Likes : {{nft.tokenLikes}}</el-link>
                    <el-link type="warning" @click="onHateNft(nft.tokenId)">Hates : {{nft.tokenHates}}</el-link>
                    <el-link type="success" v-if="nft.tokenPrices === 0 || !nft.tokenOwner" @click="onRewardNft(nft.tokenId)">Rewards : {{nft.tokenRewards.toFixed(3)}}</el-link>
                    <el-link type="success" v-if="nft.tokenOwner && nft.tokenPrices > 0" @click="onSellNft(nft.tokenId, nft.tokenPrices)">Sell Price : {{nft.tokenPrices.toFixed(3)}}</el-link>
                  </div>
                </el-card>
              </el-col>
          </template>
        </el-row>
      </el-main>
      <el-footer>
        <div>
          <el-pagination
            background
            layout="total, prev, pager, next"
            v-model:currentPage="currentPage"
            :total="nftTotal"
            :page-size="pageSize"
            style="float: right;"
             @current-change="handleClick"
          />
      </div>
      </el-footer>
    </el-container>
  </div> 

</template>

<script lang="ts">
export default {
  name: 'NftsPage',
  props: {
  }
}
</script>

<script setup lang="ts">
import { h,ref } from "vue"
import { utils } from "ethers"

import Resolution from "@unstoppabledomains/resolution";

import * as web3nft from "../libs/web3nft"
import { connected, connectState } from "../libs/connect"
import * as element from "../libs/element"
import * as constant from "../constant"
import * as tools from "../libs/tools"

const resolution = new Resolution();
const activeName = connectState.activeName;
const loadStatus = ref(false);
const pageSize = ref(3);
const currentPage = ref(0);
const nftTotal = ref(0);
const nftList = ref(new Array());
const baseInfo = ref({
  maxtotalSupply: 15000, 
  maxUserSupply: 10,
  maxUserHates: 0, 
  maxUserVotes: 0, 
  minVoteAggrees: 5000,
  currentTotalSupply: 0,
  currentUserBalance: 0,
  currentUserVoteCreated: 0,
  currentUserRewards: 0,
  currentUserBanned: false,
} as any);  

const svg = `
        <path class="path" d="
          M 30 15
          L 28 17
          M 25.61 25.61
          A 15 15, 0, 0, 1, 15 30
          A 15 15, 0, 1, 1, 27.99 7.5
          L 15 15
        " style="stroke-width: 4px; fill: rgba(0, 0, 0, 0)"/>
      `;

//nft token explore url
const tokenExplorerUrl = (tokenId:number, tokenURI:string) => {
  for(const i in constant.chainList){
    if(connectState.chainId === constant.chainList[i].chainId){
      const blockExplorerUrls = constant.chainList[i].blockExplorerUrls;
      const nftContractAddress = (constant.nftContractAddress as any)[connectState.chainId]
      return blockExplorerUrls + '/token/' + nftContractAddress + '?a=' + tokenId + '#inventory';
    }
  }

  return tokenURI;
}

//transaction explore url
const transactionExplorerUrl = (transaction:string) => {
  for(const i in constant.chainList){
    if(connectState.chainId === constant.chainList[i].chainId){
      const blockExplorerUrls = constant.chainList[i].blockExplorerUrls;
      return blockExplorerUrls + '/tx/' + transaction;
    }
  }

  return transaction;
}

//click to like nft
const onLikeNft = async (tokenId:number) => {

  try{
    const tx = await web3nft.likeNft(tokenId);
    connectState.transactions.value.unshift(tx);
    connectState.transactionCount.value++;

    const msg = '<div><span>Like success! Transaction: </span><a href="' + 
      transactionExplorerUrl(tx) + 
      '" target="_blank">' + tx + '</a></div>';

    element.elMessage('success', msg, true);

    handleClick(); 

  }catch(e){
    element.alertMessage(e);
  }
 
}

//click to hate nft
const onHateNft = async (tokenId:number) => {

  try{

    const tx = await web3nft.hateNft(tokenId);
    connectState.transactions.value.unshift(tx);
    connectState.transactionCount.value++;

    const msg = '<div><span>Hate success! Transaction: </span><a href="' + 
      transactionExplorerUrl(tx) + 
      '" target="_blank">' + tx + '</a></div>';

    element.elMessage('success', msg, true);    

    handleClick();      

  }catch(e){
    element.alertMessage(e);
  }

}

//click to claim rewards
const onClaimRewards = async () => {
  try{

    const rewards = (await web3nft.getAddressPrameters())[3];
  
    if(Number(utils.formatEther(rewards)) > 0){
      const tx = await web3nft.claim();
      connectState.transactions.value.unshift(tx);
      connectState.transactionCount.value++;   

      const msg = '<div><span>Claim success! Transaction: </span><a href="' + 
        transactionExplorerUrl(tx) + 
        '" target="_blank">' + tx + '</a></div>';

      element.elMessage('success', msg, true);         

      handleClick();  
    } else {
      element.elMessage("warning", "You have no rewards to claim now!");
    }

  }catch(e){
    element.alertMessage(e);
  }

}

//click to reward nft
const onRewardNft = async (tokenId:number) => {
  const opts = {
    confirmButtonText: 'Confirm',
    cancelButtonText: 'Cancel',
    inputType: 'number',
    inputValue: '0.01',
    inputErrorMessage: 'Invalid number',
  };

  element.elMessageBox('Please enter the amount to reward the NFT', 'Reward', opts, async (value:number) => {

      try{
        const tx = await web3nft.rewardNft(tokenId, value);
        connectState.transactions.value.unshift(tx);
        connectState.transactionCount.value++;

        const msg = '<div><span>Reward success! Transaction: </span><a href="' + 
          transactionExplorerUrl(tx) + 
          '" target="_blank">' + tx + '</a></div>';

        element.elMessage('success', msg, true);        

        handleClick();

      }catch(e){
        element.alertMessage(e);
      }

    });
}

//click to buy NFT
const onBuyNft = async (tokenId:number, tokenPrices:number) => {
  const opts = {
    confirmButtonText: 'Confirm',
    cancelButtonText: 'Cancel',
    inputType: 'number',
    inputValue: String(tokenPrices),
    inputPattern: new RegExp('^'+ String(tokenPrices) + '.*?'),
    inputErrorMessage: 'buy price must large than sell price',
  };

  element.elMessageBox('Please enter the price to Buy the NFT', 'Buy Price', opts, async (value:number) => {

      try{
        const tx = await web3nft.buyNFT(tokenId, value);
        connectState.transactions.value.unshift(tx);
        connectState.transactionCount.value++;

        const msg = '<div><span>Buy NFT success! Transaction: </span><a href="' + 
          transactionExplorerUrl(tx) + 
          '" target="_blank">' + tx + '</a></div>';

        element.elMessage('success', msg, true);        

        handleClick();

      }catch(e){
        element.alertMessage(e);
      }

    });  
}

//click to sell NFT
const onSellNft = async (tokenId:number, tokenPrices = 0.01) => {
  const opts = {
    confirmButtonText: 'Confirm',
    cancelButtonText: 'Cancel',
    inputType: 'number',
    inputValue: String(tokenPrices),
    inputErrorMessage: 'Invalid number',
  };

  element.elMessageBox('Please enter the price to Sell the NFT', 'Sell Price', opts, async (value:number) => {

    try{
      const tx = await web3nft.sellNFT(tokenId, value);
      
      connectState.transactions.value.unshift(tx);
      connectState.transactionCount.value++;

      const msg = '<div><span>Sell NFT success! Transaction: </span><a href="' + 
        transactionExplorerUrl(tx) + 
        '" target="_blank">' + tx + '</a></div>';

      element.elMessage('success', msg, true);        

      handleClick();

    }catch(e){
      element.alertMessage(e);
    }

  });
}

//click to send or burn nft
const onSendNft = async (tokenId:number) => {

  const opts = {
    confirmButtonText: 'Send',
    cancelButtonText: 'Cancel',
    inputType: 'text',
    inputValue: '',
    inputPlaceholder: '0x0000000000000000000000000000000000000000',
    inputErrorMessage: 'Invalid address',
  };

  element.elMessageBox('Please enter address to send the NFT:', 'Send NFT', opts, async (value:string) => {

    value = value.trim().toLowerCase();

    let address = value;

    if(address === undefined ||
      address === null ||
      address === '' ||
      address === '0' ||
      address === '0x' ||
      address.match('0x0{1,}$') != null || 
      address === '0x000000000000000000000000000000000000dead'){
      
      return burnNFT(tokenId);
    }    

    try{
      address = await resolution.addr(value, "ETH");
    }catch(e){

      try{
        address = await connectState.provider.resolveName(value);
      }catch(e){
        address = null;
      }
    }

    if(address === undefined || address === null || address === ''){
      element.elMessage('error', 'Invalid address input!');
      return;
    } else {
      address = address.trim().toLowerCase();
    }
    
    return sendNFT(value, address, tokenId);

  });

}

const burnNFT = async (tokenId:number) => {
  const opts = {
    confirmButtonText: 'Burn',
    cancelButtonText: 'Cancel',
  };

  element.elMessageConfirm('Are you sure to Burn the NFT of ID ' + tokenId + '?', 'Burn NFT', opts, async () => {
    try{
      const tx = await web3nft.burn(tokenId);
      connectState.transactions.value.unshift(tx);
      connectState.transactionCount.value++;

      const msg = '<div><span>Burn success! Transaction: </span><a href="' + 
        transactionExplorerUrl(tx) + 
        '" target="_blank">' + tx + '</a></div>';

      element.elMessage('success', msg, true);    

      handleClick();      
    }catch(e){
      element.alertMessage(e);
    }
  });  
}

const sendNFT = async (name:string, address:string, tokenId:number) => {
  const opts = {
    message: '',
    confirmButtonText: 'Send',
    cancelButtonText: 'Cancel',
  };

  if(name === address){
    opts.message =  h('p', null, [
      h('p', null, 'Are you sure to send the NFT of ID ' + tokenId + '?'),
      h('p', { style: 'color: teal' }, 'send user: '),
      h('p', { style: 'color: teal' }, address),
    ]);
  }else{
    opts.message =  h('p', null, [
      h('p', null, 'Are you sure to send the NFT of ID ' + tokenId + '?'),
      h('p', { style: 'color: teal' }, 'send user:  ' + name),
      h('p', { style: 'color: teal' }, address),
    ]);
  }

  element.elMessageConfirm('Are you sure to send the NFT of ID ' + tokenId + '?', 'Send NFT', opts, async () => {
    try{
      const tx = await web3nft.safeTransferFrom(connectState.userAddr.value, address, tokenId);
      connectState.transactions.value.unshift(tx);
      connectState.transactionCount.value++;

      const msg = '<div><span>Send success! Transaction: </span><a href="' + 
        transactionExplorerUrl(tx) + 
        '" target="_blank">' + tx + '</a></div>';

      element.elMessage('success', msg, true);    

      handleClick();      
    }catch(e){
      element.alertMessage(e);
    }
  });  
}

//get nft count and pull nft info
const getNftCount = async (nfttype:string) => {
  const newNftList = new Array();

  if(nfttype === 'image' || nfttype === 'audio' || nfttype === 'video'){
    const total = await web3nft.totalSupply();

    for(let i = total.toNumber() - 1; i >= 0; i--){
      const tokenId = (await web3nft.tokenByIndex(i)).toNumber();
      const tokenInfo = await web3nft.getNftInfoByIndex(tokenId);
      
      if(tokenInfo[2] != nfttype){
        continue;
      }
      
      if(connectState.search === '' ||
        (String(tokenId)).indexOf(connectState.search) != -1 ||
        (String(tokenId)).search(connectState.search) != -1){

        newNftList.push({
          tokenId: tokenId,
          tokenOwner: tokenInfo[0].toLowerCase() === connectState.userAddr.value,
          tokenUri: tokenInfo[1],
          tokenType: tokenInfo[2],
          tokenLikes: tokenInfo[3].toNumber(),
          tokenHates: tokenInfo[4].toNumber(),
          tokenRewards: Number(utils.formatEther(tokenInfo[5])),
          tokenPrices: Number(utils.formatEther(tokenInfo[6])),
        });

      }
    }
  }else{
    const total = await web3nft.balanceOf(connectState.userAddr.value);
    
    for(let i = total.toNumber() - 1; i >= 0; i--){
      const tokenId = (await web3nft.tokenOfOwnerByIndex(connectState.userAddr.value, i)).toNumber();
      const tokenInfo = await web3nft.getNftInfoByIndex(tokenId);
      
      if(connectState.search === '' ||
        (String(tokenId)).indexOf(connectState.search) != -1 ||
        (String(tokenId)).search(connectState.search) != -1){

        newNftList.push({
          tokenId: tokenId,
          tokenOwner: tokenInfo[0].toLowerCase() === connectState.userAddr.value,
          tokenUri: tokenInfo[1],
          tokenType: tokenInfo[2],
          tokenLikes: tokenInfo[3].toNumber(),
          tokenHates: tokenInfo[4].toNumber(),
          tokenRewards: Number(utils.formatEther(tokenInfo[5])),
          tokenPrices: Number(utils.formatEther(tokenInfo[6])),
        });

      }
    }    
  }

  nftTotal.value = newNftList.length;
  nftList.value = newNftList;
}

//click to change active item and refresh page
const handleClick = async () => {

  connectState.activeName.value = activeName.value;
  tools.setUrlParamter('activeName', activeName.value);

  try{

    loadStatus.value = true;

    if (!(await connected())){
      nftList.value = new Array();
      return;
    }        

    await getNftCount(activeName.value);

    if(currentPage.value < 1){
      currentPage.value = 1;
    }

    let totalPage = Math.floor(nftTotal.value/pageSize.value);

    if((nftTotal.value%pageSize.value)!=0){
      totalPage += 1;
    }

    if(currentPage.value > totalPage){
      currentPage.value = totalPage;
    }

    let start = (currentPage.value-1) * pageSize.value;
    let end = currentPage.value * pageSize.value;

    if(start < 0){
      start = 0;
    }

    if(end > nftTotal.value){
      end = nftTotal.value;
    }

    nftList.value = nftList.value.slice(start, end);

    const nftPrameters = await web3nft.getNFTPrameters();
    const userPrameters = await web3nft.getAddressPrameters();

    baseInfo.value = {
      maxtotalSupply: nftPrameters[0].toNumber(), 
      maxUserSupply: nftPrameters[1].toNumber(), 
      maxUserHates: nftPrameters[2].toNumber(), 
      maxUserVotes: nftPrameters[3].toNumber(), 
      minVoteAggrees: nftPrameters[4].toNumber(), 
      currentTotalSupply: userPrameters[0].toNumber(), 
      currentUserBalance: userPrameters[1].toNumber(), 
      currentUserVoteCreated: userPrameters[2].toNumber(), 
      currentUserRewards: Number(utils.formatEther(userPrameters[3])).toFixed(3),
      currentUserBanned: userPrameters[4],
    };

  }catch(e){
     nftList.value = new Array();
  }finally{
    loadStatus.value = false;
  }

}

//clean search content and bind search callback function
connectState.search = '';
connectState.searchCallback = handleClick;

//try get activeName from the url paramter
try{
  activeName.value = tools.getUrlParamter('activeName');

  if(activeName.value != 'image' && 
    activeName.value != "audio" && 
    activeName.value != 'video' && 
    activeName.value != 'mine'){

    activeName.value = 'image';
  }
}catch(e){
  activeName.value = 'image';
}

//update page size
handleClick();
</script>