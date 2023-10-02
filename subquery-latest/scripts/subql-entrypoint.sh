#!/bin/bash
set -e

if [[ ! -z "${START_BLOCK}" ]]; then
    echo "[Config Update] Start Block: ${START_BLOCK}"
    yq -i '.dataSources[].startBlock = env(START_BLOCK)' /app/project.yaml
fi

if [[ ! -z "${CHAIN_ID}" ]]; then
    echo "[Config Update] Chain ID: ${CHAIN_ID}"
    yq -i '.network.chainId = env(CHAIN_ID)' /app/project.yaml
fi

if [[ ! -z "${NETWORK_ENDPOINT}" ]]; then
    echo "[Config Update] Network Endpoint: ${NETWORK_ENDPOINT}"
    yq -i '.network.endpoint = strenv(NETWORK_ENDPOINT)' /app/project.yaml
fi

# Add btree_gist extension to support historical mode
export PGPASSWORD=$DB_PASS
psql -v ON_ERROR_STOP=1 \
        -h $DB_HOST \
        -U $DB_USER \
        -p $DB_PORT \
        -d $DB_DATABASE <<EOF
CREATE EXTENSION IF NOT EXISTS btree_gist;
EOF

# If subql-node PROFILING is true, run block_retrieval_test and print block retrieval data
if [[ "${PROFILING}" = true ]]; then
  pipenv install requests aiohttp asyncio
  printf "\nBLOCK RETRIEVAL TESTS\n\n"
  pipenv run python /app/profiling/block_retrieval_test_async.py
  pipenv run python /app/profiling/block_retrieval_test_seq.py
fi

# If subql-node profiler is enabled, run nodejs profiler and export data
if [[ "${PROFILING}" = true ]]; then
  printf "\nPROFILER RUNNING\n\n"
  bash /app/profiling/subql_node_profiler.sh "$@" --log-level=error
fi

node /app/node/dist/main.js "$@"