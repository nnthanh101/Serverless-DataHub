# AWS AppRunner example with Terraform

There are 3 examples inside the `src` folder:

* `github`: deploy an AppRunner service using code directly from a GitHub repository
* `public-ecr`: deploy an AppRunner service using a container image from a public ECR registry.
* `private-ecr`: deploy an AppRunner service using a container image from a private ECR registry.

![private ECR diagam](images/private-ecr-diagram.svg)

To run a example, `cd` into that folder and run `./run.sh` to see help message.

Run `cp some.env.example some.env` to generate an initial configurations for scripts.

## Prerequisite

* AWS CLI
* Terraform

## Scan

```shell
docker run --rm -v $(pwd):/iac -w /iac accurics/terrascan scan .
```