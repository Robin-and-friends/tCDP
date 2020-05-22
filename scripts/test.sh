# Exit script as soon as a command fails.
set -o errexit

# Executes cleanup function at script exit.
trap cleanup EXIT


ganache_running() {
  nc -z localhost $1
}

# Kills ganache process with its PID in $ganache_pid.
cleanup() {
  echo "cleaning up"
  # Kill the ganache instance that we started (if we started one).
  if [ -n "$ganache_pid" ]; then
    kill -9 $ganache_pid
  fi
}

# Executes cleanup function at script exit.
trap cleanup EXIT

if ganache_running 8545; then
  echo "Using existing ganache instance"
else
  echo "Starting our own ganache instance"

  npx ganache-cli -p 8545 -f https://mainnet.infura.io/v3/$INFURA_API_KEY -m "$TEST_MNEMONIC_PHRASE" -u "0x742d35Cc6634C0532925a3b844Bc454e4438f44e" -u "0x2a1530C4C41db0B0b2bB646CB5Eb1A67b7158667" -u "0x742d35Cc6634C0532925a3b844Bc454e4438f44e"> ganache.log & ganache_pid=$!
fi

# Run the truffle test or the solidity-coverage suite.
node --max-old-space-size=4096 ./node_modules/.bin/truffle test "$@" --debug