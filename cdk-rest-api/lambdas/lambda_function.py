import json
import requests

CHUCK_NORRIS_API_BASE_URL = 'https://api.chucknorris.io'

class FactFetcher:
    def __init__(self, base_url):
        self.base_url = base_url

    def _fetch_random_fact(self):
        url = f'{self.base_url}/jokes/random'
        try:
            response = requests.get(url)
            response.raise_for_status()
        except requests.exceptions.RequestException as e:
            raise Exception("Error fetching fact: " + str(e))
        return response.json()

    def _extract_fact(self, fact_data):
        return fact_data['value']

    def get_fact(self):
        fact_data = self._fetch_random_fact()
        fact = self._extract_fact(fact_data)
        return fact


def lambda_handler(event, context):
    fact_fetcher = FactFetcher(CHUCK_NORRIS_API_BASE_URL)

    try:
        fact = fact_fetcher.get_fact()
    except Exception as e:
        return {
            "statusCode": 500,
            "headers": {
                "Content-Type": "application/json"
            },
            "body": json.dumps({"error": str(e)})
        }

    response = {
        "statusCode": 200,
        "headers": {
            "Content-Type": "application/json"
        },
        "body": json.dumps({"fact": fact})
    }

    return response
