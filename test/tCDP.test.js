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
    // skip this test for the moment and just run the print state one
    return;
  
    let collateral = 0;
    let debt = 0;
    const range = ether('0.0001');

    before(async function() {
      this.dai = await ERC20.at(addr.DAI.TOKEN_ADDRESS);
    });
    
    describe("Compound", function() {
      before(async function() {
        this.tcdp = await tCDP.new();
      });

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

        expect(Math.abs(collateral.sub(supplyAmt))).to.be.bignumber
          .lt(range);
        expect(debt).to.be.bignumber.eq(borrowAmt);
        expect(tcdpBalance).to.be.bignumber.eq(supplyAmt);
      });

      // it('mint', async function() {
      //   let mintAmt = ether('1');
      //   [collateralBefore, debtBefore] = await getCollateralAndDebt(this.tcdp);
      //   const totalSupply = await this.tcdp.totalSupply.call();
      //   const tcdpBalanceBefore = await this.tcdp.balanceOf.call(user);
      //   const daiBalanceBefore = await this.dai.balanceOf.call(user);

      //   const tokenToMint = mintAmt
      //     .mul(new BN(totalSupply))
      //     .div(collateralBefore);
      //   const tokenToBorrow = mintAmt
      //     .mul(new BN(debtBefore))
      //     .div(collateralBefore);

      //   await this.tcdp.mint({value: mintAmt, from: user});

      //   [collateralAfter, debtAfter] = await getCollateralAndDebt(this.tcdp);
      //   const totalSupplyAfter = await this.tcdp.totalSupply.call();
      //   const tcdpBalanceAfter = await this.tcdp.balanceOf.call(user);
      //   const daiBalanceAfter = await this.dai.balanceOf.call(user);

      //   expect(collateralAfter.sub(supplyAmt.add(mintAmt)))
      //     .within(new BN(0), range, "collateral not match");
      //   expect(debtAfter.sub(borrowAmt.add(new BN(tokenToBorrow))))
      //     .within(new BN(0), range, "debt not match");
      //   expect(tcdpBalanceAfter).to.be.bignumber
      //     .eq(tcdpBalanceBefore.add(tokenToMint), "wrong tCDP amount of user ");
      //   expect(daiBalanceAfter).to.be.bignumber
      //     .eq(daiBalanceBefore.add(tokenToBorrow), "wrong DAI amount of user");
      // });
  
  
    });
  
  });
  
  
async function getCollateralAndDebt(tCDP) {
    let collateral = await tCDP.collateral.call();
    let debt = await tCDP.debt.call();
    log(`Collateral: ${web3.utils.fromWei(collateral.toString())}`);
    log(`Debt: ${web3.utils.fromWei(debt.toString())}`);

    return [collateral, debt];
}

function log(msg) {
  console.log(`> ${msg}`)
}
