FROM node:18-slim AS builder
# node-cosmos/1.19.1 -> 2.10.3 (main)
ENV NODE_ENV=development
WORKDIR /app

# Add build dependencies
ADD ./package.json yarn.lock /app/
RUN apt-get update && apt-get install -y tree
RUN yarn global add typescript tsc ts-node
RUN yarn install --frozen-lockfile

# Copy files & build
COPY . /app
RUN yarn codegen && yarn build

WORKDIR /app/subql-cosmos/packages/node/

RUN yarn install && yarn build

FROM node:18-slim

WORKDIR /app

RUN set -ex \
  && apt-get update -y \
  && apt-get install -y postgresql postgresql-contrib python3 pipenv

ADD https://github.com/mikefarah/yq/releases/download/v4.26.1/yq_linux_amd64 /usr/local/bin/yq
RUN chmod +x /usr/local/bin/yq

COPY --from=builder /app/subql-cosmos/packages/node/package.json /app/node/
COPY --from=builder /app/subql-cosmos/packages/node/dist /app/node/dist
COPY --from=builder /app/dist /app/dist
RUN yarn install

ADD ./proto /app/proto/
ADD ./project.yaml schema.graphql package.json /app/
ADD ./scripts/subql_node_profiler.sh ./scripts/block_retrieval_test_async.py ./scripts/block_retrieval_test_seq.py /app/profiling/
RUN chmod -R +x /app/profiling/

WORKDIR /app/node
RUN yarn install

#ADD ./scripts/block_retrieval_test_seq.py /app/profiling/
#ADD ./scripts/block_retrieval_test_async.py /app/profiling/
#ADD ./scripts/subql_node_profiler.sh /app/profiling/
#RUN chmod +x /app/profiling/block_retrieval_test_seq.py
#RUN chmod +x /app/profiling/block_retrieval_test_async.py
#RUN chmod +x /app/profiling/subql_node_profiler.sh

ADD ./scripts/subql-entrypoint.sh /app/entrypoint.sh
RUN chmod +x /app/entrypoint.sh

ENTRYPOINT ["/app/entrypoint.sh"]
