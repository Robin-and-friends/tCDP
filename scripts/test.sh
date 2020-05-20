# Exit script as soon as a command fails.
set -o errexit

# Executes cleanup function at script exit.
trap cleanup EXIT


ganache_port=8545

ganache_running() {
  nc -z localhost "$ganache_port"
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

  npx ganache-cli -f https://mainnet.infura.io/v3/$INFURA_API_KEY -m "$TEST_MNEMONIC_PHRASE" > ganache.log & ganache_pid=$!
fi

# Run the truffle test or the solidity-coverage suite.
node --max-old-space-size=4096 ./node_modules/.bin/truffle test "$@" --debug