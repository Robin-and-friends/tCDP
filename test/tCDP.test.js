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
  
  const tCDP = artifacts.require('MockTCDP');
  const ERC20 = artifacts.require('ERC20');
  const Comptroller = artifacts.require('Comptroller');
  
  const SCALED_EXCHANGE_RATE = new BN(10).pow(new BN('18'));
  
  contract('tCDP', function([_, deployer, user]) {
  
    let collateral = 0;
    let debt = 0;
    const maxPossibleInterest = ether('0.0001');

    before(async function() {
      this.dai = await ERC20.at(addr.DAI.TOKEN_ADDRESS);
    });
    
    beforeEach(async function() {
      this.tcdp = await tCDP.new();
    });
  
    describe("Compound", function() {
      const isCompound = true;
      let supplyAmt = ether('1');
      let borrowAmt = ether('80');

      it('deploy', async function() {
        await this.tcdp.setIsCompound(isCompound); 
        expect(await this.tcdp.isCompound.call()).to.be.true;
      });

  
      it('initiate', async function() {
        await this.tcdp.initiate(borrowAmt, {value: supplyAmt, from: user});
        [collateral, debt] = await getCollateralAndDebt(this.tcdp);
        let tcdpBalance = await this.tcdp.balanceOf.call(user);

        expect(collateral).to.be.bignumber.eq(supplyAmt);
        expect(debt).to.be.bignumber.eq(borrowAmt);
        expect(tcdpBalance).to.be.bignumber.eq(supplyAmt);
      });

      it('mint', async function() {
        let mintAmt = ether('1');
        [collateralBefore, debtBefore] = await getCollateralAndDebt(this.tcdp);
        const totalSupply = await this.tcdp.totalSupply.call();
        const tcdpBalanceBefore = await this.tcdp.balanceOf.call(user);
        const daiBalanceBefore = await this.dai.balanceOf.call(user);

        const tokenToMint = mintAmt
          .mul(new BN(totalSupply))
          .div(new BN(collateralBefore));
        const tokenToBorrow = mintAmt
          .mul(new BN(debtBefore))
          .div(new BN(collateralBefore));

        await this.tcdp.mint({value: mintAmt, from: user});

        [collateralAfter, debtAfter] = await getCollateralAndDebt(this.tcdp);
        const totalSupplyAfter = await this.tcdp.totalSupply.call();
        const tcdpBalanceAfter = await this.tcdp.balanceOf.call(user);
        const daiBalanceAfter = await this.dai.balanceOf.call(user);

        expect(collateralAfter).to.be.bignumber
          .sub(supplyAmt.add(mintAmt))
          .within(new BN(0), maxPossibleInterest);
        expect(debtAfter).to.be.bignumber
          .sub(borrowAmt.add(new BN(tokenToBorrow)))
          .within(new BN(0), maxPossibleInterest);
        expect(tcdpBalanceAfter).to.be.bignumber
          .eq(tcdpBalanceBefore.add(tokenToMint));
        expect(daiBalanceAfter).to.be.bignumber
          .eq(daiBalanceBefore.add(tokenToBorrow));
      });
  
  
    });
  
  });
  
  
async function getCollateralAndDebt(tCDP) {
    let collateral = web3.utils.fromWei((await tCDP.collateral.call()).toString());
    let debt = web3.utils.fromWei((await tCDP.debt.call()).toString());
    log(`Collateral: ${collateral}`);
    log(`Debt: ${debt}`);

    return [collateral, debt];
}

function log(msg) {
  console.log(`> ${msg}`)
}
