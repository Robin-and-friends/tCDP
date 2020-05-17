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

// ----------- Aave ----------------

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

interface ILendingPool {
	function addressesProvider() external view returns(address);
	function deposit(address _reserve, uint256 _amount, uint16 _referralCode) external payable;
	function redeemUnderlying(address _reserve, address _user, uint256 _amount) external;
	function borrow(address _reserve, uint256 _amount, uint256 _interestRateMode, uint16 _referralCode) external;
	function repay(address _reserve, uint256 _amount, address _onBehalfOf) external payable;
	function swapBorrowRateMode(address _reserve) external;
	function rebalanceFixedBorrowRate(address _reserve, address _user) external;
	function setUserUseReserveAsCollateral(address _reserve, bool _useAsCollateral) external;
	function liquidationCall(address _collateral, address _reserve, address _user, uint256 _purchaseAmount, bool _receiveAToken) external payable;
	function flashLoan(address _receiver, address _reserve, uint256 _amount, bytes calldata _params) external;
	function getReserveConfigurationData(address _reserve) external view returns(uint256 ltv, uint256 liquidationThreshold, uint256 liquidationDiscount, address interestRateStrategyAddress, bool usageAsCollateralEnabled, bool borrowingEnabled, bool fixedBorrowRateEnabled, bool isActive);
	function getReserveData(address _reserve) external view returns(uint256 totalLiquidity, uint256 availableLiquidity, uint256 totalBorrowsFixed, uint256 totalBorrowsVariable, uint256 liquidityRate, uint256 variableBorrowRate, uint256 fixedBorrowRate, uint256 averageFixedBorrowRate, uint256 utilizationRate, uint256 liquidityIndex, uint256 variableBorrowIndex, address aTokenAddress, uint40 lastUpdateTimestamp);
	function getUserAccountData(address _user) external view returns(uint256 totalLiquidityETH, uint256 totalCollateralETH, uint256 totalBorrowsETH, uint256 availableBorrowsETH, uint256 currentLiquidationThreshold, uint256 ltv, uint256 healthFactor);
	function getUserReserveData(address _reserve, address _user) external view returns(uint256 currentATokenBalance, uint256 currentBorrowBalance, uint256 principalBorrowBalance, uint256 borrowRateMode, uint256 borrowRate, uint256 liquidityRate, uint256 originationFee, uint256 variableBorrowIndex, uint256 lastUpdateTimestamp, bool usageAsCollateralEnabled);
	function getReserves() external view;
}

interface ILendingPoolCore {
	function getReserveATokenAddress(address _reserve) external view returns (address);
}

interface IAToken {
    function redirectInterestStream(address _to) external;
    function redirectInterestStreamOf(address _from, address _to) external;
    function allowInterestRedirectionTo(address _to) external;
    function redeem(uint256 _amount) external;
    function principalBalanceOf(address _user) external view returns(uint256);
    function isTransferAllowed(address _user, uint256 _amount) external view returns (bool);
    function getUserIndex(address _user) external view returns(uint256);
    function getInterestRedirectionAddress(address _user) external view returns(address);
    function getRedirectedBalance(address _user) external view returns(uint256);

    function totalSupply() external view returns (uint256 supply);
    function balanceOf(address _owner) external view returns (uint256 balance);
    function transfer(address _to, uint256 _value) external returns (bool success);
    function transferFrom(address _from, address _to, uint256 _value) external returns (bool success);
    function approve(address _spender, uint256 _value) external returns (bool success);
    function allowance(address _owner, address _spender) external view returns (uint256 remaining);

    function name() external view returns (string memory);
    function symbol() external view returns (string memory);
    function decimals() external view returns (uint8);
}

library EthAddressLib {

    function ethAddress() internal pure returns(address) {
        return 0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE;
    }
}


contract tCDPAave is ERC20Mintable {
    using SafeMath for *;

    uint256 constant dust = 1e6;
    address constant AAVE_ETH = 0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE;
    ERC20 constant Dai = ERC20(0x6B175474E89094C44Da98b954EedeAC495271d0F);
    uint16 constant REFERRAL = 0; // TODO: apply new referral code

    ILendingPoolAddressesProvider public addressesProvider;

    constructor(ILendingPoolAddressesProvider _provider) public {
        symbol = "tCDP";
        name = "tokenized CDP";
        decimals = 18;

        addressesProvider = _provider;
        address lendingPoolCoreAddress = addressesProvider.getLendingPoolCore();
        Dai.approve(lendingPoolCoreAddress, uint256(-1));
    }

    function initiate(uint256 amount) external payable {
        require(_totalSupply < dust, "initiated");
        require(msg.value > dust, "value too small");

        ILendingPool lendingPool = ILendingPool(addressesProvider.getLendingPool());
        lendingPool.deposit.value(msg.value)(AAVE_ETH, msg.value, REFERRAL);

        _mint(msg.sender, msg.value);

        lendingPool.borrow(address(Dai), amount, 2, REFERRAL);
        Dai.transfer(msg.sender, amount);
    }

    function collateral() public view returns(uint256) {
        address lendingPoolCore = addressesProvider.getLendingPoolCore();
        address aETH = ILendingPoolCore(lendingPoolCore).getReserveATokenAddress(AAVE_ETH);
        return IAToken(aETH).balanceOf(address(this));
    }

    function debt() public view returns(uint256) {
        ILendingPool lendingPool = ILendingPool(addressesProvider.getLendingPool());
        (, uint256 borrowBalance,,,,,,,,) = lendingPool.getUserReserveData(address(Dai), address(this));
        return borrowBalance;
    }

    function mint() external payable returns(uint256) {
        require(_totalSupply >= dust, "not initiated");
        uint256 amount = msg.value;
        uint256 tokenToMint = _totalSupply.mul(amount).div(collateral());
        uint256 tokenToBorrow = debt().mul(amount).div(collateral());

        _mint(msg.sender, tokenToMint);

        // deposit
        ILendingPool lendingPool = ILendingPool(addressesProvider.getLendingPool());
        lendingPool.deposit.value(amount)(AAVE_ETH, amount, REFERRAL);
        // borrow
        lendingPool.borrow(address(Dai), tokenToBorrow, 2, REFERRAL);
        // transfer
        Dai.transfer(msg.sender, tokenToBorrow);
    }

    function burn(uint256 amount) external {
        uint256 tokenToRepay = amount.mul(debt()).div(_totalSupply);
        uint256 tokenToDraw = amount.mul(collateral()).div(_totalSupply);

        _burn(msg.sender, amount);

        Dai.transferFrom(msg.sender, address(this), tokenToRepay);

        // repay
        ILendingPool lendingPool = ILendingPool(addressesProvider.getLendingPool());
        address lendingPoolCoreAddress = addressesProvider.getLendingPoolCore();
        Dai.approve(lendingPoolCoreAddress, tokenToRepay);
        lendingPool.repay(address(Dai), tokenToRepay, address(this));

        // redeem
        IAToken aETH = IAToken(ILendingPoolCore(lendingPoolCoreAddress).getReserveATokenAddress(AAVE_ETH));
        aETH.redeem(tokenToDraw);

        // transfer
        (bool success, ) = msg.sender.call.value(tokenToDraw)("");
        require(success, "Failed to transfer ether to msg.sender");
    }

    function() external payable{}
}

