  const {
    balance,
    BN,
    constants,
    send,
    ether,
    expectEvent,
    expectRevert,
    time
  } = require('@openzeppelin/test-helpers');
  const { tracker } = balance;
  const { expect } = require('chai');
  const utils = web3.utils;
  
  const addr = require('./utils/addresses');
  
  const tCDP = artifacts.require('MockRebalanceCDP');
  const rebalanceCDP = artifacts.require('MockRebalanceCDP');
  const ERC20 = artifacts.require('ERC20');
  const Comptroller = artifacts.require('Comptroller');
  const CETH = artifacts.require('CEth');
  const CERC20 = artifacts.require('CErc20');
  const ILendingPool = artifacts.require('ILendingPool');
  
  const SCALED_EXCHANGE_RATE = new BN(10).pow(new BN('18'));
  
  contract('tCDP print state', function([_, deployer, user]) {
  
    let collateral = 0;
    let debt = 0;
    let ethWhale = "0x742d35Cc6634C0532925a3b844Bc454e4438f44e";
    let whaleEthValue = ether('3700000');
    let whaleDaiValue = ether('1500000');

    before(async function() {
      this.dai = await ERC20.at(addr.DAI.TOKEN_ADDRESS);
      this.ceth = await CETH.at(addr.ETH.CTOKEN_ADDRESS);
      this.cdai = await CERC20.at(addr.DAI.CTOKEN_ADDRESS);
      this.lendingPool = await ILendingPool.at('0x398eC7346DcD622eDc5ae82352F02bE94C62d119');
      this.comptroller = await Comptroller.at(addr.COMPOUND_COMPTROLLER_ADDRESS);
    });
    
    describe("Compound", function() {
      before(async function() {
        this.tcdp = await tCDP.new();
      });

      // const isCompound = true;
      let supplyAmt = ether('1');
      let borrowAmt = ether('80');

      it('checkIsCompound', async function() {
        // await this.tcdp.setIsCompound(isCompound); 
        log(`IsCompound: ${await this.tcdp.isCompound.call()}`);
      });
  
      it('initiate', async function() {
        await this.tcdp.initiate(borrowAmt, {value: supplyAmt, from: user});
        [collateral, debt] = await getCollateralAndDebt(this.tcdp);
        let tcdpBalance = await this.tcdp.balanceOf.call(user);

        log(`user tCDP Balance: ${fromWei(tcdpBalance)}`);
      });

      it('mint', async function() {
        let mintAmt = ether('1');
        [collateralBefore, debtBefore] = await getCollateralAndDebt(this.tcdp);
        let [totalSupplyBefore, tcdpBalanceBefore, daiBalanceBefore] = await getUserStateAndTotalSupply(this.tcdp, this.dai, user, 'Before');
        
        log(`======================= mint =======================`)
        await this.tcdp.mint({value: mintAmt, from: user});

        [collateralAfter, debtAfter] = await getCollateralAndDebt(this.tcdp);
        let [totalSupplyAfter, tcdpBalanceAfter, daiBalanceAfter] = await getUserStateAndTotalSupply(this.tcdp, this.dai, user, 'After ');
      });

      it('burn', async function() {
        let burnAmt = ether('1');
        [collateralBefore, debtBefore] = await getCollateralAndDebt(this.tcdp);
        let [totalSupplyBefore, tcdpBalanceBefore, daiBalanceBefore] = await getUserStateAndTotalSupply(this.tcdp, this.dai, user, 'Before');

        log(`======================= burn =======================`)
        await this.dai.approve(this.tcdp.address, constants.MAX_UINT256, {from: user})
        await this.dai.allowance(user, this.tcdp.address).then(num => log("DAI Allowance: " + num.toString()))
        await this.tcdp.burn(burnAmt, {from: user});

        [collateralAfter, debtAfter] = await getCollateralAndDebt(this.tcdp);
        let [totalSupplyAfter, tcdpBalanceAfter, daiBalanceAfter] = await getUserStateAndTotalSupply(this.tcdp, this.dai, user, 'After ');
      });

      it('try changing best rate of Compound', async function() {
        await getAPRs(this.tcdp);
        log(`======================= mint cETH =======================`)
        await this.ceth.mint({value: whaleEthValue, from: ethWhale});
        await this.comptroller.enterMarkets([addr.ETH.CTOKEN_ADDRESS], {from: ethWhale});
        await getAPRs(this.tcdp);
        log(`======================= borrow DAI from Compound =======================`)
        await this.cdai.borrow(ether('9000000'), {from: ethWhale});
        await getAPRs(this.tcdp);

        let isCompound = await this.tcdp.findBestRate.call();
        log(`Compound has better rate? ${isCompound}`);
      });

      it('migrate to Aave', async function() {
        [collateralBefore, debtBefore] = await getCollateralAndDebt(this.tcdp);
        log(`======================= migrate to Aave =======================`)
        await this.dai.approve(this.tcdp.address, constants.MAX_UINT256, {from: ethWhale})
        await this.dai.allowance(ethWhale, this.tcdp.address).then(num => log("DAI Allowance: " + num.toString()))
        await this.tcdp.migrate({from: ethWhale});
        [collateralBefore, debtBefore] = await getCollateralAndDebt(this.tcdp);
        let ethData = await this.lendingPool.getUserReserveData(addr.ETH.TOKEN_ADDRESS, this.tcdp.address);
        log(`Aave ETH collateral: ${fromWei(ethData[0].toString())}`);
        let daiData = await this.lendingPool.getUserReserveData(addr.DAI.TOKEN_ADDRESS, this.tcdp.address);
        log(`Aave DAI borrow: ${fromWei(daiData[1].toString())}`);
      });
  
  
    });
  
  });

  // contract('rebalanceCDP print state', function([_, deployer, user]) {
  
  //   let collateral = 0;
  //   let debt = 0;
  //   let ethWhale = "0x742d35Cc6634C0532925a3b844Bc454e4438f44e";
  //   let whaleEthValue = ether('3700000');
  //   let whaleDaiValue = ether('1500000');

  //   before(async function() {
  //     this.dai = await ERC20.at(addr.DAI.TOKEN_ADDRESS);
  //     this.ceth = await CETH.at(addr.ETH.CTOKEN_ADDRESS);
  //     this.cdai = await CERC20.at(addr.DAI.CTOKEN_ADDRESS);
  //     this.lendingPool = await ILendingPool.at('0x398eC7346DcD622eDc5ae82352F02bE94C62d119');
  //     this.comptroller = await Comptroller.at(addr.COMPOUND_COMPTROLLER_ADDRESS);
  //   });
    
  //   describe("rebalanceCDP", function() {
  //     before(async function() {
  //       this.rebalCDP = await rebalanceCDP.new();
  //     });

  //     it('checkIsCompound', async function() {
  //       log(`IsCompound: ${await this.rebalCDP.isCompound.call()}`);
  //     });
  
  //     it('try changing best rate of Compound', async function() {
  //       await getAPRs(this.rebalCDP);
  //       log(`======================= mint cETH =======================`)
  //       await this.ceth.mint({value: whaleEthValue, from: ethWhale});
  //       await this.comptroller.enterMarkets([addr.ETH.CTOKEN_ADDRESS], {from: ethWhale});
  //       await getAPRs(this.rebalCDP);
  //       log(`======================= borrow DAI from Compound =======================`)
  //       await this.cdai.borrow(ether('7000000'), {from: ethWhale});
  //       await getAPRs(this.rebalCDP);

  //       let isCompound = await this.rebalCDP.findBestRate.call();
  //       log(`Compound has better rate? ${isCompound}`);
  //     });

  //     // it('try changing best rate of Aave', async function() {
  //     //   await getAPRs(this.rebalCDP);
  //     //   log(`======================= mint aETH =======================`)
  //     //   await this.lendingPool.deposit(addr.ETH.TOKEN_ADDRESS, whaleEthValue, 0, {value: whaleEthValue, from: ethWhale});
  //     //   await getAPRs(this.rebalCDP);
  //     //   log(`======================= borrow DAI from Aave =======================`)
  //     //   await this.lendingPool.borrow(addr.DAI.TOKEN_ADDRESS, whaleDaiValue, 2, 0, {from: ethWhale});
  //     //   await getAPRs(this.rebalCDP);
        
  //     //   let isCompound = await this.rebalCDP.findBestRate.call();
  //     //   console.log();
  //     //   log(`Compound has better rate? ${isCompound}`);
  //     // });

  //     // it('mint', async function() {
  //     //   let mintAmt = ether('1');
  //     //   [collateralBefore, debtBefore] = await getCollateralAndDebt(this.tcdp);
  //     //   let [totalSupplyBefore, tcdpBalanceBefore, daiBalanceBefore] = await getUserStateAndTotalSupply(this.tcdp, this.dai, user, 'Before');
        
  //     //   log(`======================= mint =======================`)
  //     //   await this.tcdp.mint({value: mintAmt, from: user});

  //     //   [collateralAfter, debtAfter] = await getCollateralAndDebt(this.tcdp);
  //     //   let [totalSupplyAfter, tcdpBalanceAfter, daiBalanceAfter] = await getUserStateAndTotalSupply(this.tcdp, this.dai, user, 'After ');
  //     // });

  //     // it('burn', async function() {
  //     //   let burnAmt = ether('1');
  //     //   [collateralBefore, debtBefore] = await getCollateralAndDebt(this.tcdp);
  //     //   let [totalSupplyBefore, tcdpBalanceBefore, daiBalanceBefore] = await getUserStateAndTotalSupply(this.tcdp, this.dai, user, 'Before');

  //     //   log(`======================= burn =======================`)
  //     //   await this.dai.approve(this.tcdp.address, constants.MAX_UINT256, {from: user})
  //     //   await this.dai.allowance(user, this.tcdp.address).then(num => log("DAI Allowance: " + num.toString()))
  //     //   await this.tcdp.burn(burnAmt, {from: user});

  //     //   [collateralAfter, debtAfter] = await getCollateralAndDebt(this.tcdp);
  //     //   let [totalSupplyAfter, tcdpBalanceAfter, daiBalanceAfter] = await getUserStateAndTotalSupply(this.tcdp, this.dai, user, 'After ');
  //     // });
  
  
  //   });
  
  // });
  
  
async function getCollateralAndDebt(tCDP) {
    let collateral = await tCDP.collateral.call();
    let debt = await tCDP.debt.call();
    log(`Collateral: ${web3.utils.fromWei(collateral.toString())}`);
    log(`Debt: ${web3.utils.fromWei(debt.toString())}`);

    return [collateral, debt];
}

async function getUserStateAndTotalSupply(tCDP, dai, user, msg) {
    const totalSupply = await tCDP.totalSupply.call();
    const tcdpBalance = await tCDP.balanceOf.call(user);
    const daiBalance = await dai.balanceOf.call(user);
    log(`${msg} - totalSupply: ${fromWei(totalSupply)}`);
    log(`${msg} - user tCDP Balance: ${fromWei(tcdpBalance)}`);
    log(`${msg} - user DAI Balance: ${fromWei(daiBalance)}`);

    return [totalSupply, tcdpBalance, daiBalance];
}

async function getAPRs(tCDP) {
  const cETH_APR = await tCDP.CompoundEthAPR.call();
  const cDAI_APR = await tCDP.CompoundDaiAPR.call();
  const aETH_APR = await tCDP.AaveEthAPR.call();
  const aDAI_APR = await tCDP.AaveDaiAPR.call();
  log(`cETH APR: ${fromWei(cETH_APR)}`);
  log(`cDAI APR: ${fromWei(cDAI_APR)}`);
  log(`aETH APR: ${fromWei(aETH_APR)}`);
  log(`aDAI APR: ${fromWei(aDAI_APR)}`);
}

function log(msg) {
  console.log(`           > ${msg}`)
}

function fromWei(value) {
  return web3.utils.fromWei(value);
}
