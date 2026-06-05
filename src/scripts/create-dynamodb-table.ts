import {
  CreateTableCommand,
  DescribeTableCommand,
  ResourceNotFoundException,
} from '@aws-sdk/client-dynamodb';
import { dynamoDbClient } from '../config/aws';
import { env } from '../config/env';

const tableName = env.AWS_DYNAMODB_NOTIFICATION_EVENTS_TABLE;

const tableExists = async (): Promise<boolean> => {
  try {
    console.log(`Checking DynamoDB table: ${tableName}`);

    await dynamoDbClient.send(
      new DescribeTableCommand({
        TableName: tableName,
      }),
    );

    return true;
  } catch (error) {
    if (error instanceof ResourceNotFoundException) {
      return false;
    }

    throw error;
  }
};

const createTable = async (): Promise<void> => {
  console.log('DynamoDB endpoint:', env.AWS_DYNAMODB_ENDPOINT);
  console.log('DynamoDB table:', tableName);

  const exists = await tableExists();

  if (exists) {
    console.log(`DynamoDB table already exists: ${tableName}`);
    return;
  }

  console.log(`Creating DynamoDB table: ${tableName}`);

  await dynamoDbClient.send(
    new CreateTableCommand({
      TableName: tableName,
      AttributeDefinitions: [
        {
          AttributeName: 'pk',
          AttributeType: 'S',
        },
        {
          AttributeName: 'sk',
          AttributeType: 'S',
        },
      ],
      KeySchema: [
        {
          AttributeName: 'pk',
          KeyType: 'HASH',
        },
        {
          AttributeName: 'sk',
          KeyType: 'RANGE',
        },
      ],
      BillingMode: 'PAY_PER_REQUEST',
    }),
  );

  console.log(`DynamoDB table created successfully: ${tableName}`);
};

createTable()
  .then(() => {
    process.exit(0);
  })
  .catch((error: unknown) => {
    console.error('Failed to create DynamoDB table:', error);
    process.exit(1);
  });
