#!/bin/bash
set -e

# run node in background for 5 minutes
node --prof /usr/local/lib/node_modules/@subql/node-cosmos/bin/run -f=/app --db-schema=app &
PID=$!

echo "PROFILER: subql node running for 5 minutes"
sleep 20m

# end node & profiler to output raw data
kill -INT $PID

# process profiler data to JSON and compress
node --prof-process --preprocess -j isolate*.log > profile.v8log.json
tar -czf /app/profiling/profiling_data.tar.gz isolate*.log profile.v8log.json

# clean up raw data & JSON
rm isolate*.log profile.v8log.json

echo "PROFILER: data saved to: '/app/profiling/profiling_data.tar.gz'"

