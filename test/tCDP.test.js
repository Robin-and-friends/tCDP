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

    beforeEach(async function() {
      this.tcdp = await tCDP.new();
    });
  
    describe("Compound", function() {
      const isCompound = true;
      let supplyAmt = ether('80');
      let borrowAmt = ether('1');

      it('deploy', async function() {
        await this.tcdp.setIsCompound(isCompound); 
        expect(await this.tcdp.isCompound.call()).to.be.true;
      });

  
      it('initiate', async function() {
        await this.tcdp.initiate(borrowAmt, {value: supplyAmt, from: user});

        [collateral, debt] = await getCollateralAndDebt(this.tcdp);

        console.log(`collateral: ${collateral}`);
        console.log(`debt: ${debt}`);
  
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
