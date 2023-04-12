import json
import boto3


class S3DataFetcher:
    def __init__(self, bucket, key):
        self.bucket = bucket
        self.key = key
        self.s3_client = boto3.client('s3')

    def fetch_data(self):
        response = self.s3_client.get_object(Bucket=self.bucket, Key=self.key)
        data = response['Body'].read().decode('utf-8')
        return json.loads(data)

class LambdaHandler:
    def __init__(self, data_fetcher):
        self.data_fetcher = data_fetcher

    def handle_request(self, event, context):
        data = self.data_fetcher.fetch_data()

        return {
            'statusCode': 200,
            'body': json.dumps(data),
            'headers': {
                'Content-Type': 'application/json',
            }
        }

def lambda_handler(event, context):
    bucket = 'db-041123'
    key = 'accountStatus.json'
    data_fetcher = S3DataFetcher(bucket, key)
    handler = LambdaHandler(data_fetcher)
    return handler.handle_request(event, context)
