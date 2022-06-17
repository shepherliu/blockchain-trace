<template>
  <div class="file-arae">
    <el-container>
      <el-header style="background-color: #ffffff;">
        <el-tabs v-model="activeName" class="file-tabs" @tab-click="handleClick">
          <el-tab-pane label="Living" name="living"></el-tab-pane>
          <el-tab-pane label="Finished" name="finished"></el-tab-pane>
          <el-tab-pane label="MyVotes" name="mine"></el-tab-pane>
        </el-tabs>
        <el-popover
          placement="bottom-start"
          title="Introduction"
          :width="400"
          trigger="hover"
        >
          <template #reference>
            <el-link type="danger" @click="javascript:void(0);" style="margin-left: 10px;">Vote Rights: {{!baseInfo.currentUserBanned && baseInfo.currentUserBalance >= 1}}</el-link>
          </template>
          <h4>Users who own the NFTs of this project and not in the blacklist that can create votes or vote for the exist events.</h4>
          <h4>The max votes the one user can create is {{baseInfo.maxUserVotes}}.</h4>
          <h4>The min votes that one event can be adopted is {{baseInfo.minVoteAggrees}}</h4>
        </el-popover>
        <el-popover 
          placement="bottom-start"
          title="Add new vote"
          :width="400"
          trigger="click"
          v-model:visible="addVoteVisiable"
        >
          <template #reference>
            <el-link type="primary" @click="addVoteVisiable = true;" style="float: right;">Add Vote<el-icon><document-add /></el-icon></el-link>
          </template>
          <table>
            <tr>
              <td><span>Vote Title:</span></td>
              <td>
                <el-select 
                  v-model="voteSelected.voteTitle" 
                  class="m-3" 
                  placeholder="Title"
                  :teleported="false"
                  filterable 
                  autocomplete
                  allow-create
                  size="small"
                  style="width: 200px;"
                  @change="onTitleChange"
                >
                <el-option
                  v-for="title in voteOptions.voteTitle"
                  :key="title"
                  :label="title"
                  :value="title"
                />
                </el-select>
              </td>              
            </tr>
            <tr>
              <td><span>Vote Content:</span></td>
              <td>
                  <el-input
                    v-model="voteSelected.voteContent"
                    style="width: 200px;padding-left: 10px;"
                    :maxlength="100"
                    :rows="10"
                    type="textarea"
                    :placeholder="voteSelected.voteTitle"
                  />
              </td>
            </tr>
            <tr>
              <td><span>Vote Value:</span></td>
              <td>
                <el-select 
                  v-model="voteSelected.voteValue" 
                  class="m-3" 
                  placeholder="Value"
                  :teleported="false"
                  filterable 
                  size="small"
                  autocomplete
                  style="width: 200px;"
                >
                <el-option
                  v-for="value in voteOptions.voteValue[voteSelected.voteTitle]"
                  :key="value"
                  :label="value"
                  :value="value"
                />
                </el-select>
              </td>              
            </tr>
            <tr>
              <td><span>Vote Deadline:</span></td>
              <td>
                <el-select 
                  v-model="voteSelected.voteDeadline" 
                  class="m-3" 
                  placeholder="Deadline"
                  :teleported="false"
                  filterable 
                  size="small"
                  autocomplete
                  style="width: 200px;"
                >
                <el-option
                  v-for="deadline in voteOptions.voteDeadline"
                  :key="deadline"
                  :label="deadline + ' days'"
                  :value="deadline"
                />
                </el-select>
              </td>
            </tr>
          </table>
          <div style="text-align: right; margin: 0">
            <el-button size="small" type="warning" @click="addVoteVisiable = false"
              >cancel</el-button
            >
            <el-button size="small" type="primary" @click="addVoteVisiable = false; onAddVote();"
              >confirm</el-button
            >
          </div>          
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
          <template v-for="vote in voteList" :key="vote.voteId">
              <el-col :span="8">
                <el-card class="box-card">
                  <template #header>
                    <div class="card-header">
                      <span>Id: <el-link type="success" @click="javascript:void(0);">{{vote.voteId}}</el-link>    Votes: <el-link type="success" @click="javascript:void(0);">{{vote.voteAggrees}}</el-link></span>
                      <el-button-group>                                       
                        <el-button v-if="activeName==='mine'" size="small" type="danger" @click="onDelVote(vote.voteId)">
                          Delete<el-icon><delete /></el-icon>
                        </el-button>
                      </el-button-group>
                    </div>
                  </template>
                  <table>
                    <tr>
                      <td style="float:left;">
                        <el-link type="primary" @click="javascript:void(0);">Vote:</el-link>
                      </td>
                      <td style="float:right;">
                      <el-popover
                        placement="bottom-start"
                        :title="vote.voteTitle"
                        :width="300"
                        trigger="hover"
                      >
                        <template #reference>
                          <el-link type="danger" @click="javascript:void(0);" style="margin-left: 10px;">{{vote.voteTitle}}</el-link>
                        </template>
                        <h5>{{vote.voteContent}}.</h5>
                      </el-popover>
                      </td>
                    </tr>  
                    <tr>
                      <td style="float:left;">
                        <el-link type="primary" @click="javascript:void(0);">Value:</el-link>
                      </td>
                      <td style="float:right;">
                        <el-link type="danger" @click="javascript:void(0);">{{vote.voteValue}}</el-link>
                      </td>
                    </tr>                                        
                    <tr>
                      <td style="float:left;">
                        <el-link type="primary" @click="javascript:void(0);">Endtime:</el-link>
                      </td>
                      <td style="float:right;">
                        <el-link type="danger" @click="javascript:void(0);">{{(new Date(vote.voteDeadline*1000)).toLocaleString()}}</el-link>
                      </td>
                    </tr>
                    <tr>
                      <td style="float:left;">
                        <el-link type="primary" @click="javascript:void(0);">Adopted:</el-link>
                      </td>
                      <td style="float:right;">
                        <el-link type="danger" @click="javascript:void(0);">{{vote.voteSuccess}}</el-link>
                      </td>
                    </tr>    
                    <tr>
                      <td style="float:left;">
                        <el-button type="primary" @click="onVote(vote.voteId, true)">Aggree</el-button>
                      </td>
                      <td style="float:right;">
                         <el-button type="danger" @click="onVote(vote.voteId, false)">Giveup</el-button> 
                      </td>
                    </tr>                                     
                  </table>
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
            :total="voteTotal"
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
  name: 'DaosPage',
  props: {
  }
}
</script>

<script setup lang="ts">
import { ref } from "vue"
import { utils } from "ethers"

import * as web3nft from "../libs/web3nft"
import { connected, connectState } from "../libs/connect"
import * as element from "../libs/element"
import * as constant from "../constant"
import * as tools from "../libs/tools"

const activeName = connectState.activeName;
const loadStatus = ref(false);
const pageSize = ref(3);
const currentPage = ref(0);
const voteTotal = ref(0);
const voteList = ref(new Array());
const addVoteVisiable = ref(false);
const voteSelected = ref({
  voteTitle: "ChangeMaxTotalSupply",
  voteContent: "",
  voteValue: 15000,
  voteDeadline: 7,
} as any);

const voteOptions = ref({
  voteTitle: [
    "ChangeMaxTotalSupply",
    "ChangeMaxUserSupply",
    "ChangeMaxUserHates",
    "ChangeMinVoteAggrees",
    "ChangeMaxUserVotes",
  ],
  voteContent: [],
  voteValue: {
    "ChangeMaxTotalSupply": [10000,12000,15000,20000],
    "ChangeMaxUserSupply": [1,3,5,10],
    "ChangeMaxUserHates": [1000,2000,3000,5000],
    "ChangeMinVoteAggrees": [5000,6000,8000,10000],
    "ChangeMaxUserVotes": [1,2,3,5],    
  },
  voteDeadline: [1,3,5,7,10,15,20,30],
} as any);
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

const onTitleChange = async () => {
  voteSelected.value.voteContent = voteSelected.value.voteTitle;
  try{
    voteSelected.value.voteValue = voteOptions.value.voteValue[voteSelected.value.voteTitle][0];
  }catch(e){
    voteSelected.value.voteValue = 0;
  }
  
}

const onAddVote = async () => {
  try{
    if(voteSelected.value.voteContent === ''){
      voteSelected.value.voteContent = voteSelected.value.voteTitle;
    }

    const tx = await web3nft.addVote(
      voteSelected.value.voteTitle, 
      voteSelected.value.voteContent,
      voteSelected.value.voteValue, 
      voteSelected.value.voteDeadline,
    );

    connectState.transactions.value.unshift(tx);
    connectState.transactionCount.value++;

    const msg = '<div><span>Add vote success! Transaction: </span><a href="' + 
      transactionExplorerUrl(tx) + 
      '" target="_blank">' + tx + '</a></div>';

    element.elMessage('success', msg, true);

    handleClick(); 

  }catch(e){
    element.alertMessage(e);
  }  
}

const onDelVote = async (voteId:number) => {
  try{
    const tx = await web3nft.delVote(voteId);
    connectState.transactions.value.unshift(tx);
    connectState.transactionCount.value++;

    const msg = '<div><span>Delete vote success! Transaction: </span><a href="' + 
      transactionExplorerUrl(tx) + 
      '" target="_blank">' + tx + '</a></div>';

    element.elMessage('success', msg, true);

    handleClick(); 

  }catch(e){
    element.alertMessage(e);
  }  
}

const onVote = async (voteId:number, voteAggrees:boolean) => {
  try{
    const tx = await web3nft.vote(voteId, voteAggrees);
    connectState.transactions.value.unshift(tx);
    connectState.transactionCount.value++;

    const msg = '<div><span>Vote success! Transaction: </span><a href="' + 
      transactionExplorerUrl(tx) + 
      '" target="_blank">' + tx + '</a></div>';

    element.elMessage('success', msg, true);

    handleClick(); 

  }catch(e){
    element.alertMessage(e);
  }  
}

//get vote count and pull vote info
const getVoteCount = async (votetype:string) => {
  const newVoteList = new Array();

  const total = await web3nft.getVoteTotal();

  for(let i = total.toNumber() - 1; i >= 0; i--){
    const voteInfo = await web3nft.getVoteInfoByIndex(i);

    if(voteInfo[2] === ''){
      continue;
    }

    if(votetype === 'living'){
      const now = (new Date()).valueOf()/1000;
      const deadline = voteInfo[6].toNumber();
      if(now >= deadline){
        continue;
      }
    }else if(votetype === 'finished'){
      const now = (new Date()).valueOf()/1000;
      const deadline = voteInfo[6].toNumber();
      if(now < deadline){
        continue;
      }
    }else if(votetype === 'mine'){
      if(connectState.userAddr.value != voteInfo[1].toLowerCase()){
        continue;
      }
    }
    
    if(connectState.search === '' ||
      (String(voteInfo[2])).indexOf(connectState.search) != -1 ||
      (String(voteInfo[2])).search(connectState.search) != -1 ||
      (String(voteInfo[3])).indexOf(connectState.search) != -1 ||
      (String(voteInfo[3])).search(connectState.search) != -1){

      newVoteList.push({
        voteId: voteInfo[0],
        voteOwner: voteInfo[1].toLowerCase(),
        voteTitle: voteInfo[2],
        voteContent: voteInfo[3],
        voteAggrees: voteInfo[4].toNumber(),
        voteValue: voteInfo[5].toNumber(),
        voteDeadline: voteInfo[6].toNumber(),
        voteSuccess: voteInfo[7],
      });

    }
  }

  voteTotal.value = newVoteList.length;
  voteList.value = newVoteList;
}

//click to change active item and refresh page
const handleClick = async () => {

  connectState.activeName.value = activeName.value;
  tools.setUrlParamter('activeName', activeName.value);

  try{

    loadStatus.value = true;

    if (!(await connected())){
      voteList.value = new Array();
      return;
    }

    await getVoteCount(activeName.value);

    if(currentPage.value < 1){
      currentPage.value = 1;
    }

    let totalPage = Math.floor(voteTotal.value/pageSize.value);

    if((voteTotal.value%pageSize.value)!=0){
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

    if(end > voteTotal.value){
      end = voteTotal.value;
    }

    voteList.value = voteList.value.slice(start, end);

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
     voteList.value = new Array();
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

  if(activeName.value != 'living' && 
    activeName.value != "finished" && 
    activeName.value != 'mine'){

    activeName.value = 'living';
  }
}catch(e){
  activeName.value = 'living';
}

//update page size
handleClick();
</script>