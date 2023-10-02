#!/usr/bin/python

import time
import requests
import aiohttp
import asyncio
import os

network_endpoint = os.environ.get("NETWORK_ENDPOINT")
runs = os.environ.get("PROFILER_ITERATIONS") or 25

if not network_endpoint:
    print("PROFILER: NETWORK_ENDPOINT empty")
    exit(0)

if requests.get(network_endpoint).status_code != 200:
    print("PROFILER: endpoint not responding")
    exit(0)

print(f'PROFILER: test ASYNCHRONOUS block retrieval time')


def time_ms():
    return time.time_ns() / 1000000


async def get_url(session, url, timeout=10):
    start = time_ms()
    await session.get(url, timeout=timeout)
    end = time_ms()
    times.append(end - start)
    print("|", end="")
    return


async def async_request(async_loop, iterations):
    global latest_height
    async with aiohttp.ClientSession(loop=async_loop, timeout=1) as session:
        func = [get_url(session, f'{block_fetch_url}{latest_height}') for x in range(iterations)]
        latest_height -= 1
        await asyncio.gather(*func)


if __name__ == '__main__':
    times = []

    url_split = network_endpoint.split(":")
    base_url = f'{url_split[0]}:{url_split[1]}/'
    abci_json = requests.get(f'{base_url}abci_info?').json()
    latest_height = int(abci_json['result']['response']['last_block_height'])
    block_fetch_url = f'{base_url}block?height='

    loop = asyncio.get_event_loop()
    loop.run_until_complete(async_request(loop, runs))

    avg = (sum([float(time) for time in times])) / runs
    print(f' Done.\n'
          f'PROFILER: '
          f'Max: {str(max(times))[0:6]}ms, '
          f'Avg: {str(avg)[0:6]}ms, '
          f'Min: {str(min(times))[0:6]}ms', )
