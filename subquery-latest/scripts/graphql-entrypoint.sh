#!/bin/bash
if [[ -n "$STARTUP_DELAY" ]]; then
  echo "Sleeping $STARTUP_DELAY"
  sleep "$STARTUP_DELAY"
fi
exec /sbin/tini -- node /usr/local/lib/node_modules/@subql/query/dist/main "$@"
