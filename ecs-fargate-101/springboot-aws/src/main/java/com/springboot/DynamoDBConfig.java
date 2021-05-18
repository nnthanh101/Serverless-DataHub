package com.springboot;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import com.amazonaws.auth.AWSStaticCredentialsProvider;
import com.amazonaws.auth.BasicSessionCredentials;
import com.amazonaws.client.builder.AwsClientBuilder;
import com.amazonaws.services.dynamodbv2.AmazonDynamoDB;
import com.amazonaws.services.dynamodbv2.AmazonDynamoDBClientBuilder;
import com.amazonaws.services.dynamodbv2.datamodeling.DynamoDBMapper;

@Configuration
public class DynamoDBConfig {
	

	@Value("${amazon.accesskey}")
	private String awsAccessKey;

	@Value("${amazon.secretkey}")
	private String awsSecretKey;

	@Value("${amazon.region}")
	private String awsRegion;
	
	@Value("${amazon.awssessiontoken}")
	private String awsToken;

	@Value("${amazon.dynamodb.endpoint}")
	private String awsDynamoDBEndPoint;

	@Bean
	public DynamoDBMapper mapper() {
		return new DynamoDBMapper(amazonDynamoDBConfig());
	}

	public AmazonDynamoDB amazonDynamoDBConfig() {
		return AmazonDynamoDBClientBuilder.standard()
				.withEndpointConfiguration(new AwsClientBuilder.EndpointConfiguration(awsDynamoDBEndPoint, awsRegion))
				.withCredentials(new AWSStaticCredentialsProvider(new BasicSessionCredentials(awsAccessKey, awsSecretKey, awsToken)))
				.build();
	}
}
