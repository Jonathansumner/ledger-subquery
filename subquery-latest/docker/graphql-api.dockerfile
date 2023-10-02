FROM onfinality/subql-query:latest

COPY /scripts/graphql-entrypoint.sh /entrypoint.sh
RUN ["chmod", "+x", "./entrypoint.sh"]

ENTRYPOINT ["/bin/ash", "entrypoint.sh"]