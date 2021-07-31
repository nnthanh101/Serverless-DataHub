echo "#########################################################"
_logger "[+] 3.1. Installing k9s"
echo "#########################################################"
version=$(curl https://api.github.com/repos/derailed/k9s/releases/latest --silent | jq ".tag_name" -r)
K9S_VERSION=$(echo $version | sed 's/v//g') # get rid of 'v' from version number
K9S_TAR_FILENAME=k9s_$(uname -s)_$(uname -m).tar.gz
curl -o /tmp/$K9S_TAR_FILENAME -L -k https://github.com/derailed/k9s/releases/download/v${K9S_VERSION}/$K9S_TAR_FILENAME
tar -xvf /tmp/$K9S_TAR_FILENAME -C /tmp/
sudo mv /tmp/k9s /usr/local/bin/k9s
sudo chmod +x /usr/local/bin/k9s

echo "#########################################################"
_logger "[+] 3.2. Installing kubectl & eksctl"
echo "#########################################################"
curl -LO "https://storage.googleapis.com/kubernetes-release/release/$(curl -s https://storage.googleapis.com/kubernetes-release/release/stable.txt)/bin/${KERNEL_TYPE}/amd64/kubectl"
sudo mv kubectl /usr/local/bin/kubectl
sudo chmod +x /usr/local/bin/kubectl
# kubectl version --client

curl --silent --location "https://github.com/weaveworks/eksctl/releases/latest/download/eksctl_$(uname -s)_amd64.tar.gz" | tar xz -C /tmp
sudo mv -v /tmp/eksctl /usr/local/bin

_logger "[+] 3.3. Install helm-3"
curl -fsSL -o get_helm.sh https://raw.githubusercontent.com/helm/helm/master/scripts/get-helm-3
chmod 700 get_helm.sh
./get_helm.sh
rm get_helm.sh

echo "#########################################################"
_logger "[+] 3.4. Installing [terraform 0.14.10](https://github.com/hashicorp/terraform)"
echo "#########################################################"
cd ~
version=0.14.10
# version=$(curl https://api.github.com/repos/hashicorp/terraform/releases/latest --silent | jq ".tag_name" -r)
# version=$(echo $version | sed 's/v//g') # get rid of 'v' from version number
echo "Installing Terraform $version."
url="https://releases.hashicorp.com/terraform/$version/terraform_$(echo $version)_linux_amd64.zip"
curl -L -o terraform_amd64.zip $url
unzip "terraform_amd64.zip"
## MacOS
# url="https://releases.hashicorp.com/terraform/0.14.10/terraform_0.14.10_darwin_amd64.zip"
# curl -L -o "terraform_0.14.10_darwin_amd64.zip" $url
# unzip "terraform_0.14.10_darwin_amd64.zip"
# rm "terraform_0.14.10_darwin_amd64.zip"

chmod +x terraform
sudo mv terraform /usr/local/bin/
echo "Terraform $version installed."
rm "terraform_amd64.zip"
echo "Install terraform*.zip file cleaned up."

# echo "kubectx"
# sudo git clone https://github.com/ahmetb/kubectx /opt/kubectx
# sudo ln -s /opt/kubectx/kubectx /usr/local/bin/kubectx
# sudo ln -s /opt/kubectx/kubens /usr/local/bin/kubens

echo "git-remote-codecommit"
sudo pip install git-remote-codecommit

## FIXME5
## [K8sLens](https://k8slens.dev/)
## [TFSec](https://github.com/tfsec/tfsec)
## [Checkov](https://pypi.org/project/checkov/)

## [Terrascan](https://github.com/accurics/terrascan) detects security vulnerabilities and compliance violations across your Infrastructure as Code. 
sudo pip install terrascan

echo "ssh key"
mkdir -p ~/.ssh
ssh-keygen -b 2048 -t rsa -f ~/.ssh/id_rsa -q -N ""
chmod 600 ~/.ssh/id*
aws ec2 delete-key-pair --key-name "terraform-eks"
aws ec2 import-key-pair --key-name "terraform-eks" --public-key-material fileb://~/.ssh/id_rsa.pub

## SSM add on
curl "https://s3.amazonaws.com/session-manager-downloads/plugin/latest/linux_64bit/session-manager-plugin.rpm" -o "session-manager-plugin.rpm"
sudo yum install -y session-manager-plugin.rpm
session-manager-plugin
rm session-manager-plugin.rpm

echo "#########################################################"
_logger "[+] 4. Java 11 Amazon-Corretto & Maven"
echo "#########################################################"
sudo wget http://repos.fedorapeople.org/repos/dchen/apache-maven/epel-apache-maven.repo -O /etc/yum.repos.d/epel-apache-maven.repo
sudo sed -i s/\$releasever/6/g /etc/yum.repos.d/epel-apache-maven.repo
sudo yum install -y apache-maven

sudo yum install java-11-amazon-corretto
sudo alternatives --config java  #enter the number for corretto 11
sudo alternatives --config javac #enter the number for corretto 11

# echo "Enable kubectl bash_completion"
# kubectl completion bash >>  ~/.bash_completion
# . /etc/profile.d/bash_completion.sh
# . ~/.bash_completion

echo "Stable Helm Chart Repository"
helm repo add stable https://charts.helm.sh/stable
helm search repo stable

# helm completion bash >> ~/.bash_completion
# . /etc/profile.d/bash_completion.sh
# . ~/.bash_completion
# source <(helm completion bash)

# instance_id=`curl -s -H "X-aws-ec2-metadata-token: $TOKEN" http://169.254.169.254/latest/meta-data/instance-id`
# # echo $instance_id
# ip=`aws ec2 describe-iam-instance-profile-associations --filters "Name=instance-id,Values=$instance_id" | jq .IamInstanceProfileAssociations[0].IamInstanceProfile.Arn | cut -f2 -d'/' | tr -d '"'`
# # echo $ip
# if [ "$ip" != "admin-role" ] ; then
# echo "ERROR: Could not find Instance profile admin-role! - DO NOT PROCEED exiting"
# exit
# else
# echo "PASSED: Found Instance profile admin-role - proceed with the workshop"
# fi
# aws sts get-caller-identity --query Arn | grep admin-role -q && echo "PASSED: IAM role valid - admin-role" || echo "ERROR: IAM role not valid - DO NOT PROCEED"
# iname=$(aws ec2 describe-tags --filters "Name=resource-type,Values=instance" "Name=resource-id,Values=$instance_id" | jq -r '.Tags[] | select(.Key=="Name").Value')
# echo $iname| grep eks-terraform -q && echo "PASSED: Cloud9 IDE name is valid - contains eks-terraform" || echo "ERROR: Cloud9 IDE name invalid! - DO NOT PROCEED"
# key_name=`aws ec2 describe-key-pairs --query "KeyPairs[?KeyName=='terraform-eks'].KeyName" | grep net | tr -d ' ' | tr -d '"'`
# if [ $key_name != "terraform-eks" ]; then
# echo "Could not find terraform-eks key pair - create before proceeding"
# exit
# fi

## FIXME
# if [[ "$OSTYPE" == "linux-gnu"* ]]; then
#     echo "Linux OS"
#     DISTRO_ID=$(lsb_release -si)
#     if [[ "$DISTRO_ID" == "Ubuntu" ]]; then
#         echo "Install with apt"
#         sudo apt-get install -y apache2-utils jq gettext bash-completion
#     elif [[ "$DISTRO_ID" == "AmazonLinux"* ]]; then
#         echo "Install with yum"
#         sudo yum install -y jq gettext bash-completion
#     else
#         echo "error can't install package"
#         exit 1;
#     fi
# elif [[ "$OSTYPE" == "darwin"* ]]; then
#     brew install jq wget
#     KERNEL_TYPE=darwin
# else
#     echo "Unsupport platform: $OSTYPE"
#     exit 1
# fi