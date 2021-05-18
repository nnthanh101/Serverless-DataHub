import core = require("@aws-cdk/core");
import { Table, AttributeType } from "@aws-cdk/aws-dynamodb";

export interface DynamoDBStackProps {
  readonly tableName: string;
  readonly writeCapacity: number;
  readonly readCapacity: number;
  readonly partitionKeyName: string;
  readonly tags?: {
    [key: string]: string;
  };
}

/**
 * Creating DynamoDB table
 */
export class DynamoDBStack extends core.Stack {
  public readonly table: Table
  constructor(parent: core.App, name: string, props: DynamoDBStackProps) {
    super(parent, name, {
      tags: props.tags,
    });

      /* Creating table with hash key */
      this.table = new Table(this, "table", {
      partitionKey: { name: props.partitionKeyName, type: AttributeType.STRING },
      writeCapacity: props.writeCapacity,
      readCapacity: props.readCapacity,
      tableName: props.tableName,
    });
  }
}
