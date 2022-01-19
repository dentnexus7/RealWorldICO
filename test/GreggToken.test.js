const { assert } = require('chai');

const BigNumber = web3.BigNumber;

const GreggToken = artifacts.require('GreggToken');

require('chai')
  .use(require('chai-bignumber')(BigNumber))
  .should();

contract('GreggToken', accounts => {
  const _name = 'Gregg Token';
  const _symbol = 'GGG';
  const _decimals = 18;

  beforeEach(async function () {
    this.token = await GreggToken.new(_name, _symbol, _decimals);
  });

  describe('token attributes', function() {
    it('has the correct name', async function() {
      const name = await this.token.name();
      name.should.equal(_name);
    });

    it('has the correct symbol', async function() {
      const symbol = await this.token.symbol();
      symbol.should.equal(_symbol);
    });

    it('has the correct decimals', async function() {
      const decimals = await this.token.decimals();
      assert.equal(decimals.toNumber(), _decimals, "decimals is correct");
      //decimals.should.be.bignumber.equal(_decimals);
    });
  });
});