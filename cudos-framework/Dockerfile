ARG DEBIAN_VERSION=buster
ARG TERRAFORM_VERSION=0.15.4

FROM debian:${DEBIAN_VERSION} as terraform
ARG TERRAFORM_VERSION
RUN apt-get update  \
  && apt-get install --no-install-recommends -y curl \
  ca-certificates \
  unzip \
  gnupg
RUN curl -Os https://releases.hashicorp.com/terraform/${TERRAFORM_VERSION}/terraform_${TERRAFORM_VERSION}_linux_amd64.zip \
  && unzip -j terraform_${TERRAFORM_VERSION}_linux_amd64.zip

FROM debian:${DEBIAN_VERSION} as aws-cli
RUN apt-get update  \
  && apt-get install --no-install-recommends -y curl \
  ca-certificates \
  unzip \
  gnupg
RUN curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip" \
  && unzip awscliv2.zip \
  && ./aws/install

FROM debian:${DEBIAN_VERSION}
RUN apt-get update \
  && apt-get install -y --no-install-recommends \
    ca-certificates \
    git \
    jq \
  && apt-get clean \
  && rm -rf /var/lib/apt/lists/*

COPY --from=terraform /terraform /usr/local/bin/terraform
COPY --from=aws-cli /usr/local/aws-cli /usr/local/aws-cli
RUN ln -s /usr/local/aws-cli/v2/current/bin/aws /usr/local/bin/aws

WORKDIR /workspace
RUN groupadd --gid 1001 cudos \
  # user needs a home folder to store aws credentials
  && useradd --gid cudos --create-home --uid 1001 cudos \
  && chown cudos:cudos /workspace
USER cudos

RUN echo "PS1='\[\e[0;38;5;190m\]\u\[\e[0m\]:\[\e[0;38;5;226m\]\w\[\e[0m\]# \[\e[0m\]'" >> /home/cudos/.bashrc

CMD ["bash"]
