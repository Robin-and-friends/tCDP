pragma solidity ^0.5.12;


library SafeMath {

    function mul(uint256 a, uint256 b) internal pure returns (uint256) {
        if (a == 0) 
            return 0;
        uint256 c = a * b;
        require(c / a == b);
        return c;
    }

    function div(uint256 a, uint256 b) internal pure returns (uint256) {
        require(b > 0);
        uint256 c = a / b;
        return c;
    }

    function sub(uint256 a, uint256 b) internal pure returns (uint256) {
        require(b <= a);
        uint256 c = a - b;
        return c;
    }

    function add(uint256 a, uint256 b) internal pure returns (uint256) {
        uint256 c = a + b;
        require(c >= a);
        return c;
    }

    function mod(uint256 a, uint256 b) internal pure returns (uint256) {
        require(b != 0);
        return a % b;
    }
}


contract ERC20 {
    using SafeMath for uint256;

    mapping (address => uint256) internal _balances;
    mapping (address => mapping (address => uint256)) internal _allowed;
    
    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);

    uint256 internal _totalSupply;

    /**
    * @dev Total number of tokens in existence
    */
    function totalSupply() public view returns (uint256) {
        return _totalSupply;
    }

    /**
    * @dev Gets the balance of the specified address.
    * @param owner The address to query the balance of.
    * @return A uint256 representing the amount owned by the passed address.
    */
    function balanceOf(address owner) public view returns (uint256) {
        return _balances[owner];
    }

    /**
    * @dev Function to check the amount of tokens that an owner allowed to a spender.
    * @param owner address The address which owns the funds.
    * @param spender address The address which will spend the funds.
    * @return A uint256 specifying the amount of tokens still available for the spender.
    */
    function allowance(address owner, address spender) public view returns (uint256) {
        return _allowed[owner][spender];
    }

    /**
    * @dev Transfer token to a specified address
    * @param to The address to transfer to.
    * @param value The amount to be transferred.
    */
    function transfer(address to, uint256 value) public returns (bool) {
        _transfer(msg.sender, to, value);
        return true;
    }

    /**
    * @dev Approve the passed address to spend the specified amount of tokens on behalf of msg.sender.
    * Beware that changing an allowance with this method brings the risk that someone may use both the old
    * and the new allowance by unfortunate transaction ordering. One possible solution to mitigate this
    * race condition is to first reduce the spender's allowance to 0 and set the desired value afterwards:
    * https://github.com/ethereum/EIPs/issues/20#issuecomment-263524729
    * @param spender The address which will spend the funds.
    * @param value The amount of tokens to be spent.
    */
    function approve(address spender, uint256 value) public returns (bool) {
        _allowed[msg.sender][spender] = value;
        emit Approval(msg.sender, spender, value);
        return true;
    }

    /**
    * @dev Transfer tokens from one address to another.
    * Note that while this function emits an Approval event, this is not required as per the specification,
    * and other compliant implementations may not emit the event.
    * @param from address The address which you want to send tokens from
    * @param to address The address which you want to transfer to
    * @param value uint256 the amount of tokens to be transferred
    */
    function transferFrom(address from, address to, uint256 value) public returns (bool) {
        _transfer(from, to, value);
        _allowed[msg.sender][to] = _allowed[msg.sender][to].sub(value);
        return true;
    }

    function _transfer(address from, address to, uint256 value) internal {
        require(to != address(0));
        _balances[from] = _balances[from].sub(value);
        _balances[to] = _balances[to].add(value);
        emit Transfer(from, to, value);
    }

}

contract ERC20Mintable is ERC20 {
    string public name;
    string public symbol;
    uint8 public decimals;

    function _mint(address to, uint256 amount) internal {
        _balances[to] = _balances[to].add(amount);
        _totalSupply = _totalSupply.add(amount);
        emit Transfer(address(0), to, amount);
    }

    function _burn(address from, uint256 amount) internal {
        _balances[from] = _balances[from].sub(amount);
        _totalSupply = _totalSupply.sub(amount);
        emit Transfer(from, address(0), amount);
    }
}

interface ILendingPoolCore {
	function getReserveATokenAddress(address _reserve) external view returns (address);
    function getReserveCurrentLiquidityRate(address _reserve) external view returns (uint256);
    function getReserveCurrentVariableBorrowRate(address _reserve) external view returns (uint256);
}

contract ILendingPoolAddressesProvider {

    function getLendingPool() public view returns (address);
    function setLendingPoolImpl(address _pool) public;

    function getLendingPoolCore() public view returns (address payable);
    function setLendingPoolCoreImpl(address _lendingPoolCore) public;

    function getLendingPoolConfigurator() public view returns (address);
    function setLendingPoolConfiguratorImpl(address _configurator) public;

    function getLendingPoolDataProvider() public view returns (address);
    function setLendingPoolDataProviderImpl(address _provider) public;

    function getLendingPoolParametersProvider() public view returns (address);
    function setLendingPoolParametersProviderImpl(address _parametersProvider) public;

    function getTokenDistributor() public view returns (address);
    function setTokenDistributor(address _tokenDistributor) public;


    function getFeeProvider() public view returns (address);
    function setFeeProviderImpl(address _feeProvider) public;

    function getLendingPoolLiquidationManager() public view returns (address);
    function setLendingPoolLiquidationManager(address _manager) public;

    function getLendingPoolManager() public view returns (address);
    function setLendingPoolManager(address _lendingPoolManager) public;

    function getPriceOracle() public view returns (address);
    function setPriceOracle(address _priceOracle) public;

    function getLendingRateOracle() public view returns (address);
    function setLendingRateOracle(address _lendingRateOracle) public;
}

interface CTokenInterface {
    function borrowRatePerBlock() external returns (uint);
    function supplyRatePerBlock() external returns (uint);
}

interface CErc20 {

    function borrow(uint256) external returns (uint256);

    function borrowRatePerBlock() external view returns (uint256);

    function borrowBalanceCurrent(address) external returns (uint256);

    function repayBorrow(uint256) external returns (uint256);
}


interface CEth {
    function mint() external payable;

    function redeemUnderlying(uint redeemAmount) external returns (uint256);

    function balanceOfUnderlying(address owner) external returns (uint256);
}


interface Comptroller {
    function markets(address) external returns (bool, uint256);

    function enterMarkets(address[] calldata)
        external
        returns (uint256[] memory);

    function getAccountLiquidity(address)
        external
        view
        returns (uint256, uint256, uint256);

    function oracle() external view returns(address);
}


interface PriceOracle {
    function getUnderlyingPrice(address) external view returns (uint256);
}

contract tCDP is ERC20Mintable {
    using SafeMath for *;

    uint256 constant dust = 1e6;

    Comptroller constant comptroller = Comptroller(0x3d9819210A31b4961b30EF54bE2aeD79B9c9Cd3B);
    //PriceOracle constant priceOracle = PriceOracle(0xDDc46a3B076aec7ab3Fc37420A8eDd2959764Ec4);

    CEth constant cEth = CEth(0x4Ddc2D193948926D02f9B1fE9e1daa0718270ED5);
    CErc20 constant cDai = CErc20(0x5d3a536E4D6DbD6114cc1Ead35777bAB948E3643);
    ERC20 constant Dai = ERC20(0x6B175474E89094C44Da98b954EedeAC495271d0F);

    constructor() public {
        symbol = "tCDP";
        name = "tokenized CDP";
        decimals = 18;
        Dai.approve(address(cDai), uint256(-1));
    }

    function initiate(uint256 amount) external payable {
        require(_totalSupply < dust, "initiated");
        require(msg.value > dust, "value too small");

        cEth.mint.value(msg.value)();

        address[] memory cTokens = new address[](1);
        cTokens[0] = address(cEth);
        uint256[] memory errors = comptroller.enterMarkets(cTokens);
        require(errors[0] == 0, "Comptroller.enterMarkets failed.");

        _mint(msg.sender, msg.value);
        cDai.borrow(amount);
        Dai.transfer(msg.sender, amount);
    }

    function collateral() public returns(uint256) {
        return cEth.balanceOfUnderlying(address(this));
    }

    function debt() public returns(uint256) {
        return cDai.borrowBalanceCurrent(address(this));
    }

    function mint() external payable returns(uint256) {
        require(_totalSupply >= dust, "not initiated");
        uint256 amount = msg.value;
        uint256 tokenToMint = _totalSupply.mul(amount).div(collateral());
        uint256 tokenToBorrow = debt().mul(amount).div(collateral());

        _mint(msg.sender, tokenToMint);

        cEth.mint.value(amount)();
        cDai.borrow(tokenToBorrow);
        Dai.transfer(msg.sender, tokenToBorrow);
    }

    function burn(uint256 amount) external {
        uint256 tokenToRepay = amount.mul(debt()).div(_totalSupply);
        uint256 tokenToDraw = amount.mul(collateral()).div(_totalSupply);

        _burn(msg.sender, amount);

        Dai.transferFrom(msg.sender, address(this), tokenToRepay);
        cDai.repayBorrow(tokenToRepay);
        cEth.redeemUnderlying(tokenToDraw);
        (bool success, ) = msg.sender.call.value(tokenToDraw)("");
        require(success, "Failed to transfer ether to msg.sender");
    }

    function() external payable{}
}

contract Exchange {
    function trade(
        address src,
        uint srcAmount,
        address dest,
        address destAddress,
        uint maxDestAmount,
        uint minConversionRate,
        address walletId )public payable returns(uint);
}

contract rebalanceCDP is tCDP {

    Exchange kyberNetwork = Exchange(0x818E6FECD516Ecc3849DAf6845e3EC868087B755);
    address etherAddr = 0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE;
    address ref = 0xD0533664013a82c31584B7FFDB215139f38Ad77A;

    uint256 public upperBound = 0.45 * 1e18; //45%
    uint256 public lowerBound = 0.35 * 1e18; //35%
    uint256 public bite = 0.025 * 1e18; //2.5%

    constructor() public {
        Dai.approve(address(kyberNetwork), uint256(-1));
    }

    function debtRatio() public returns(uint256) {
        address oracle = comptroller.oracle();
        PriceOracle priceOracle = PriceOracle(oracle);
        uint256 price = priceOracle.getUnderlyingPrice(address(cDai));
        uint256 ratio = debt().mul(price).div(collateral());
        return ratio;
    }

    function deleverage() public {
        require(_totalSupply >= dust, "not initiated");
        require(debtRatio() > upperBound, "debt ratio is good");
        uint256 amount = collateral().mul(bite).div(1e18);
        cEth.redeemUnderlying(amount);
        uint256 income = kyberNetwork.trade.value(amount)(etherAddr, amount, address(Dai), address(this), 1e28, 1, ref);
        cDai.repayBorrow(income);
    }

    function leverage() public {
        require(_totalSupply >= dust, "not initiated");
        require(debtRatio() < lowerBound, "debt ratio is good");
        uint256 amount = debt().mul(bite).div(1e18);
        cDai.borrow(amount);
        uint256 income = kyberNetwork.trade(address(Dai), amount, etherAddr, address(this), 1e28, 1, ref);
        cEth.mint.value(income)();
    }


}



contract iborrow is rebalanceCDP {

    uint256 targetRatio;
    address constant AAVE_ADDRESSES_PROVIDER = 0x24a42fD28C976A61Df5D00D0599C34c4f90748c8;

    function getCompoundBorrowAPR(address token) public returns (uint256) {
        return CTokenInterface(token).borrowRatePerBlock().mul(2102400);
    }

    function getCompoundSupplyAPR(address token) public returns (uint256) {
        return CTokenInterface(token).supplyRatePerBlock().mul(2102400);
    }
    function getAaveBorrowAPR(address token) public view returns (uint256) {
        ILendingPoolCore core = ILendingPoolCore(ILendingPoolAddressesProvider(AAVE_ADDRESSES_PROVIDER).getLendingPoolCore());
        return core.getReserveCurrentVariableBorrowRate(token).div(1e9);
    }

    function getAaveSupplyAPR(address token) public view returns (uint256) {
        ILendingPoolCore core = ILendingPoolCore(ILendingPoolAddressesProvider(AAVE_ADDRESSES_PROVIDER).getLendingPoolCore());
        return core.getReserveCurrentLiquidityRate(token).div(1e9);
    }
}