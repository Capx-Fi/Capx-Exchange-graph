import { BigInt, Address, Bytes, BigDecimal } from "@graphprotocol/graph-ts"
import {
  Exchange,
  AdminFee,
  AdminChanged,
  BeaconUpgraded,
  DepositTokens,
  OrderCancel,
  OrderCreate,
  OrderFulfill,
  OwnershipTransferred,
  Upgraded,
  WithdrawTokens
} from "../generated/Exchange/Exchange"
import { Order, FullFiller, TradeData, Position, User, LockedBalance, TotalBalance, Asset } from "../generated/schema"

function generateTradePair(_tokenX: string, _tokenY: string): string {
  return _tokenX.concat("/").concat(_tokenY);
}

function fullFillerID(_tradeID: string, _fullFiller: string): string {
  return _tradeID.concat("-").concat(_fullFiller);
}

function positionID(_tradingPairID: string, _timestamp: string): string {
  return _tradingPairID.concat("-").concat(_timestamp);
}

function createLockID(_user: string, _assetID: string): string{
  return _user.concat("-lock-").concat(_assetID)
}

function createTotalID(_user: string, _assetID: string): string{
  return _user.concat("-total-").concat(_assetID)
}

export function handleOrderCreate(event: OrderCreate): void {

  let contract = Exchange.bind(event.address);

  let _initiator = event.params.initiator;
  let _tokenGet = event.params.tokenGet;
  let _tokenGive = event.params.tokenGive;
  let _tokenGetAmount = event.params.amountGet;
  let _tokenGiveAmount = event.params.amountGive;
  let _expiryTime = event.params.expiryTime;
  let _tradeID = event.params.tradeID.toString();
  let _direction = event.params.direction;
  let _tokenGiveTicker = event.params.tokenGiveTicker.toString();
  let _tokenGetTicker = event.params.tokenGetTicker.toString();
  let _tokenGiveDecimal = BigInt.fromI32(event.params.tokenGiveDecimal);
  let _tokenGetDecimal = BigInt.fromI32(event.params.tokenGetDecimal);

  let order = Order.load(_tradeID);
  if(order == null) {
    order = new Order(_tradeID);
    order.initiator = _initiator;
    order.tokenGive = _tokenGive;
    order.tokenGet = _tokenGet;
    order.amountGive = _tokenGiveAmount;
    order.amountGet = _tokenGetAmount;
    order.expiryTime = _expiryTime;
    order.direction = _direction;
    order.cancelled = false;
    order.amountReceived = BigInt.fromI32(0);
    order.amountSent = BigInt.fromI32(0);
    order.tokenGiveTicker = _tokenGiveTicker;
    order.tokenGetTicker = _tokenGetTicker;
    order.tokenGiveDecimal = _tokenGiveDecimal;
    order.tokenGetDecimal = _tokenGetDecimal;
    order.fulfillOrderTimestamp = BigInt.fromI32(0);
    order.price = (_tokenGetAmount.toBigDecimal()).div(_tokenGiveAmount.toBigDecimal());

    // Updating the locked balance of the user.
    let user = User.load(_initiator.toHexString());
    if(user != null) {
      let userTotalID = createTotalID(user.id, _tokenGive.toHexString());
      let userTotalBalance = TotalBalance.load(userTotalID);
      if(userTotalBalance == null){
        userTotalBalance = new TotalBalance(userTotalID);
        userTotalBalance.assetID = _tokenGive;
        userTotalBalance.totalValue = BigInt.fromI32(0);
        userTotalBalance.user = user.id;
      }
      userTotalBalance.totalValue = contract.lockBalance(Address.fromString(order.tokenGive.toHexString()),Address.fromString(order.initiator.toHexString())).plus(contract.unlockBalance(Address.fromString(order.tokenGive.toHexString()), Address.fromString(order.initiator.toHexString())));
      userTotalBalance.save();

      let userLockedID = createLockID(user.id, _tokenGive.toHexString());
      let userLockedBalance = LockedBalance.load(userLockedID);
      if(userLockedBalance == null){
        userLockedBalance = new LockedBalance(userLockedID);
        userLockedBalance.assetID = _tokenGive;
        userLockedBalance.lockedValue = BigInt.fromI32(0);
        userLockedBalance.user = user.id;
      }
      // let _userLockedAmt = userLockedBalance.lockedValue;
      // userLockedBalance.lockedValue = _userLockedAmt.plus(_tokenGiveAmount);
      userLockedBalance.lockedValue = contract.lockBalance(Address.fromString(order.tokenGive.toHexString()), Address.fromString(order.initiator.toHexString()));
      userLockedBalance.save();
      user.save();
    }
  }

  // Register the Asset
  let assetGive = Asset.load(_tokenGive.toHexString());
  if(assetGive == null){
    assetGive = new Asset(_tokenGive.toHexString());
    assetGive.tokenTicker = _tokenGiveTicker;
    assetGive.tokenDecimal = _tokenGiveDecimal;
  }
  assetGive.save();

  let assetGet = Asset.load(_tokenGet.toHexString());
  if(assetGet == null){
    assetGet = new Asset(_tokenGet.toHexString());
    assetGet.tokenTicker = _tokenGetTicker;
    assetGet.tokenDecimal = _tokenGetDecimal;
  }
  assetGet.save();

  order.save();
}

export function handleOrderCancel(event: OrderCancel): void {
  let contract = Exchange.bind(event.address);
  let _tradeID = event.params.tradeID.toString();

  let order = Order.load(_tradeID);
  if(order != null){
    order.cancelled = true;

    // Update the locked Balance of the user.
    let user = User.load(order.initiator.toHexString());
    if(user != null){
      let userLockId = createLockID(user.id, order.tokenGive.toHexString());
      let userLockBal = LockedBalance.load(userLockId);
      if(userLockBal != null){
        // let _lockedValue = userLockBal.lockedValue;
        // let _actualValue = order.amountGive.minus(order.amountSent);
        // userLockBal.lockedValue = _lockedValue.minus(_actualValue);
        userLockBal.lockedValue = contract.lockBalance(Address.fromString(order.tokenGive.toHexString()), Address.fromString(order.initiator.toHexString()));
        userLockBal.save();
      }
      user.save();
    }
    order.save();
  }
}

export function handleDepositTokens(event: DepositTokens): void {
  let contract = Exchange.bind(event.address)
  let _user = event.params.user.toHexString();
  let _tokenAddress = event.params.tokenAddress;
  let _amount = event.params.amount;

  let user = User.load(_user)
  if(user == null) {
    user = new User(_user);
  }
  user.save();

  let _userTotal = createTotalID(_user, _tokenAddress.toHexString());
  let userTotalBalance = TotalBalance.load(_userTotal);
  if(userTotalBalance == null) {
    userTotalBalance = new TotalBalance(_userTotal);
    userTotalBalance.assetID = _tokenAddress;
    userTotalBalance.totalValue = BigInt.fromI32(0);
    userTotalBalance.user = user.id;
  }
  // let _userTotalValue = userTotalBalance.totalValue;
  // userTotalBalance.totalValue = _userTotalValue.plus(_amount);
  userTotalBalance.totalValue = contract.lockBalance(event.params.tokenAddress, event.params.user).plus(contract.unlockBalance(event.params.tokenAddress, event.params.user)) 
  
  userTotalBalance.save();
  user.save();
}

export function handleOrderFulfill(event: OrderFulfill): void {
  let contract = Exchange.bind(event.address)
  let _tradeID = event.params.tradeID.toString();
  let _amountReceived = event.params.amountReceived; // The amount of tokenGet.
  let _fullFiller = event.params.fulFillUser;

  let order = Order.load(_tradeID);
  if (order != null) {
    let _fullFillerID = fullFillerID(_tradeID.toString(), _fullFiller.toHexString());
    let fullFiller = FullFiller.load(_fullFillerID);
    if(fullFiller == null) {
      fullFiller = new FullFiller(_fullFillerID);
      fullFiller.address = _fullFiller;
      fullFiller.amount = BigInt.fromI32(0);
      fullFiller.order = order.id;
    }
    fullFiller.amount = fullFiller.amount.plus(_amountReceived);
    fullFiller.save();

    // Generating Trading Pair -> Give/Get
    let _tradingPair = generateTradePair(order.tokenGive.toHexString(),order.tokenGet.toHexString());
    let tradeData = TradeData.load(_tradingPair);
    if (tradeData == null){
      tradeData = new TradeData(_tradingPair);
    }

    let _position = positionID(_tradingPair, event.block.timestamp.toString());
    let position = Position.load(_position);
    if (position == null){
      position = new Position(_position);
      position.timestamp = event.block.timestamp;
      position.tradePrice = BigDecimal.fromString("0");
      position.trade = tradeData.id;
    }
    let _tradeRate = (order.amountGet.toBigDecimal()).div(order.amountGive.toBigDecimal());
    position.tradePrice = _tradeRate;
    position.save();
    tradeData.save(); 

    // Amount of token to give
    let _amountGive = _amountReceived.times(order.amountGive).div(order.amountGet);

    // Once the user has fulfilled the order. 
    // 1. Decrease the totalBalance of the tokenGet.
    // 2. Increase the totalBalance of the tokenGive.
    // 3. Decrease the totalBalance of the tokenGive for the initiator.
    // 4. Increase the totalBalance of the tokenGet for the initiator.
    // 5. Decrease the lockedBalance of the tokenGive for the initiator.
    let fulfiller = User.load(_fullFiller.toHexString());
    if(fulfiller == null){
      fulfiller = new User(_fullFiller.toHexString());
    }

    // 1. Decrease the totalBalance of the tokenGet.
    let _userTotalGet = createTotalID(_fullFiller.toHexString(), order.tokenGet.toHexString());
    let userGet = TotalBalance.load(_userTotalGet);
    if (userGet != null){
      let _userTotalValue = userGet.totalValue;
      // userGet.totalValue = _userTotalValue.minus(_amountReceived);
      userGet.totalValue = contract.lockBalance(Address.fromString(order.tokenGet.toHexString()), event.params.fulFillUser).plus(contract.unlockBalance(Address.fromString(order.tokenGet.toHexString()), event.params.fulFillUser)) 
      userGet.save();
    }

    // 2. Increase the totalBalance of the tokenGive.
    let _userTotalGive = createTotalID(_fullFiller.toHexString(), order.tokenGive.toHexString());
    let userGive = TotalBalance.load(_userTotalGive);
    if (userGive == null){
      userGive = new TotalBalance(_userTotalGive);
      userGive.assetID = order.tokenGive;
      userGive.totalValue = BigInt.fromI32(0);
      userGive.user = fulfiller.id;
    }
    let _userGiveTotalValue = userGive.totalValue;
    userGive.totalValue = _userGiveTotalValue.plus(_amountGive);
    userGive.save();

    fulfiller.save();

    let user = User.load(order.initiator.toHexString());
    if (user == null){
      user = new User(order.initiator.toHexString());
    }
    
    // 3. Decrease the totalBalance of the tokenGive for the initiator.
    let _initiatorTotalGive = createTotalID(order.initiator.toHexString(), order.tokenGive.toHexString());
    let initiatorTotalGive = TotalBalance.load(_initiatorTotalGive);
    if (initiatorTotalGive == null){
      initiatorTotalGive = new TotalBalance(_initiatorTotalGive);
      initiatorTotalGive.assetID = order.tokenGive;
      initiatorTotalGive.totalValue = BigInt.fromI32(0);
      initiatorTotalGive.user = user.id;
    }
    // let _initiatorTotalValue = initiatorTotalGive.totalValue;
    // initiatorTotalGive.totalValue = _initiatorTotalValue.minus(_amountGive);
    initiatorTotalGive.totalValue = contract.lockBalance(Address.fromString(order.tokenGive.toHexString()), Address.fromString(order.initiator.toHexString())).plus(contract.unlockBalance(Address.fromString(order.tokenGive.toHexString()), Address.fromString(order.initiator.toHexString()))) 
    
    initiatorTotalGive.save();

    // 4. Increase the totalBalance of the tokenGet for the initiator.
    let _initiatorTotalGet = createTotalID(order.initiator.toHexString(), order.tokenGet.toHexString());
    let initiatorTotalGet = TotalBalance.load(_initiatorTotalGet);
    if (initiatorTotalGet == null){
      initiatorTotalGet = new TotalBalance(_initiatorTotalGet);
      initiatorTotalGet.assetID = order.tokenGet;
      initiatorTotalGet.totalValue = BigInt.fromI32(0);
      initiatorTotalGet.user = user.id;
    }
    let _initiatorTotalGetValue = initiatorTotalGet.totalValue;
    initiatorTotalGet.totalValue = contract.lockBalance(Address.fromString(order.tokenGet.toHexString()), Address.fromString(order.initiator.toHexString())).plus(contract.unlockBalance(Address.fromString(order.tokenGet.toHexString()), Address.fromString(order.initiator.toHexString()))) 
    initiatorTotalGet.save();

    // 5. Decrease the lockedBalance of the tokenGive for the initiator.
    let _initiatorLockedGive = createLockID(order.initiator.toHexString(), order.tokenGive.toHexString());
    let initiatorLockedGive = LockedBalance.load(_initiatorLockedGive);
    if (initiatorLockedGive == null){
      initiatorLockedGive = new LockedBalance(_initiatorLockedGive);
      initiatorLockedGive.assetID = order.tokenGive;
      initiatorLockedGive.lockedValue = BigInt.fromI32(0);
      initiatorLockedGive.user = user.id;
    }
    // let _initiatorLockedValue = initiatorLockedGive.lockedValue;
    // initiatorLockedGive.lockedValue = _initiatorLockedValue.minus(_amountGive);
    initiatorLockedGive.lockedValue = contract.lockBalance(Address.fromString(order.tokenGive.toHexString()), Address.fromString(order.initiator.toHexString()));
    
    initiatorLockedGive.save();

    user.save();

    let _orderAmtReceived = order.amountReceived;
    order.amountReceived = _orderAmtReceived.plus(_amountReceived);
    let _orderAmtSent = order.amountSent;
    order.amountSent = _orderAmtSent.plus(_amountGive);
    if((_orderAmtSent.plus(_amountGive)).equals(order.amountGive)){
      order.fulfillOrderTimestamp = event.block.timestamp;
    }
    order.save();
  }
}

export function handleWithdrawTokens(event: WithdrawTokens): void {
  let contract = Exchange.bind(event.address)
  let _user = event.params.user;
  let _amount = event.params.amount;
  let _tokenAddress = event.params.tokenAddress;

  let user = User.load(_user.toHexString());
  if (user != null) {
    let _userTotal = createTotalID(_user.toHexString(), _tokenAddress.toHexString());
    let userTotalBalance = TotalBalance.load(_userTotal)
    if (userTotalBalance != null) {
      // let totalBalance = userTotalBalance.totalValue;
      // userTotalBalance.totalValue = totalBalance.minus(_amount);
      userTotalBalance.totalValue = contract.lockBalance(event.params.tokenAddress, event.params.user).plus(contract.unlockBalance(event.params.tokenAddress, event.params.user)) 
      userTotalBalance.save();
    }
    user.save();
  }
}


export function handleAdminChanged(event: AdminChanged): void {}

export function handleBeaconUpgraded(event: BeaconUpgraded): void {}

export function handleOwnershipTransferred(event: OwnershipTransferred): void {}

export function handleUpgraded(event: Upgraded): void {}

export function handleAdminFee(event: AdminFee): void {}
