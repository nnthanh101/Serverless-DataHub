import json
import boto3
from pathlib import Path

def lambda_handler(event, context):
    message = event['Records'][0]['Sns']['Message']
    y = json.loads(message)
    bucket=y['Records'][0]['s3']['bucket']['name']
    print(bucket)
    object=y['Records'][0]['s3']['object']['key']
    objectname=object.split("/")[-1]
    print(object)
    s3_client = boto3.client('s3')
    local_file = '/mnt/lambda/'+object
    object_dir= '/mnt/lambda/'+object.rstrip(objectname)
    print(object_dir)
    Path(object_dir).mkdir(parents=True, exist_ok=True)
    print(local_file)
    response = s3_client.download_file(bucket, object, local_file)
    print(response)
