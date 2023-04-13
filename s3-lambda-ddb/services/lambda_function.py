import json
import boto3
import os

class S3DynamoDBHandler:
    def __init__(self):
        self.s3_client = boto3.client('s3')
        self.dynamodb = boto3.resource('dynamodb')
        self.table_name = os.environ['TABLE_NAME']

    def get_s3_object(self, bucket_name, object_key):
        try:
            response = self.s3_client.get_object(Bucket=bucket_name, Key=object_key)
            return response
        except Exception as e:
            print(f"Error retrieving object from S3: {e}")
            raise

    def process_s3_data(self, response):
        try:
            json_data = response['Body'].read()
            data_string = json_data.decode('UTF-8')
            data_dict = json.loads(data_string)
            return data_dict
        except Exception as e:
            print(f"Error processing S3 data: {e}")
            raise

    def store_data_in_dynamodb(self, data_dict):
        try:
            table = self.dynamodb.Table(self.table_name)
            table.put_item(Item=data_dict)
        except Exception as e:
            print(f"Error storing data in DynamoDB: {e}")
            raise

    def handle_event(self, event):
        # Get bucket and object key from the event
        bucket_name = event['Records'][0]['s3']['bucket']['name']
        object_key = event['Records'][0]['s3']['object']['key']

        # Get the object from the S3 bucket
        response = self.get_s3_object(bucket_name, object_key)

        # Process the S3 object data
        data_dict = self.process_s3_data(response)

        # Store data in the DynamoDB table
        self.store_data_in_dynamodb(data_dict)

        return {
            'statusCode': 200,
            'body': 'Data stored in DynamoDB'
        }

def lambda_handler(event, context):
    handler = S3DynamoDBHandler()
    return handler.handle_event(event)
