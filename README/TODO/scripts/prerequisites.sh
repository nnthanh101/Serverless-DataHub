#!/bin/bash
set -euo pipefail

RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

function _logger() {
    echo -e "$(date) ${YELLOW}[*] $@ ${NC}"
}

#########################################################
#########################################################
#########################################################

function prerequisites_with_brew() {
    echo "[BEGIN][MacOS] prerequisites_with_brew() ..."
    
    brew install jq git wget unzip bash-completion gettext moreutils

    curl "https://awscli.amazonaws.com/AWSCLIV2.pkg" -o "AWSCLIV2.pkg"
    sudo installer -pkg AWSCLIV2.pkg -target /
    rm ./AWSCLIV2.pkg

    brew install node@12
    sudo npm install -g aws-cdk

    ### TODO Installing Python3 & Pip3

    # _logger "[+] Upgrade python 3.9"
    # brew install python@3.8
    # echo 'export PATH="/usr/local/opt/python@3.8/bin:$PATH"'      >> ~/.bash_profile
    # echo 'export PATH="/usr/local/opt/python@3.8/bin/pip3:$PATH"' >> ~/.bash_profile
    # echo 'alias python="python3.8"'                               >> ~/.bash_profile
    # echo 'alias python3="python3.8"'                              >> ~/.bash_profile
    # echo 'alias pip="pip3"'                                       >> ~/.bash_profile
    # source ~/.bash_profile
    ## echo 'export PATH="/usr/local/opt/python@3.8/bin:$PATH"' >> ~/.zshrc
    ## echo 'export PATH="/usr/local/opt/python@3.8/bin/pip3:$PATH"' >> ~/.zshrc
    ## echo 'alias python="python3.8"' >> ~/.zshrc
    ## echo 'alias python3="python3.8"' >> ~/.zshrc
    ## echo 'alias pip="pip3"' >> ~/.zshrc
    ## source ~/.zshrc
    ## _logger "[+] Upgrading Python pip and setuptools"
    ## python3 -m pip install --upgrade pip setuptools --user

    ### TODO Installing EKS tools
    # brew install kubectl
    # brew tap weaveworks/tap
    # brew install weaveworks/tap/eksctl
    ## brew upgrade eksctl && brew link --overwrite eksctl

    # curl -sSL https://raw.githubusercontent.com/helm/helm/master/scripts/get-helm-3 | bash
    # brew install fluxctl
    ## brew link --overwrite fluxctl

    ## Install k9s
    # brew install k9s

    ## Install Maven
    brew install maven
    
    echo "[END][MacOS] prerequisites_with_brew() !!!"
}

function prerequisites_with_apt() {
    echo "[BEGIN][Ubuntu] prerequisites_with_apt() ..."
    
    sudo apt update && sudo apt upgrade
    sudo apt install -y jq git wget unzip bash-completion gettext moreutils

    curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
    unzip awscliv2.zip
    sudo ./aws/install
    rm ./awscliv2.zip

    sudo apt install python3.8
    echo 'alias python="python3.8"' >> ~/.bash_profile
    echo 'alias python3="python3.8"' >> ~/.bash_profile
    echo 'alias pip="pip3.8"' >> ~/.bash_profile
    echo 'alias pip3="pip3.8"' >> ~/.bash_profile
    source ~/.bash_profile
    _logger "[+] Upgrading Python pip and setuptools"
    python3 -m pip install --upgrade pip setuptools --user    

    curl -sL https://deb.nodesource.com/setup_12.x | sudo -E bash -
    sudo apt install -y nodejs --force
    npm i -g aws-cdk --force

    sudo curl --silent --location -o /usr/local/bin/kubectl \
         https://amazon-eks.s3.us-west-2.amazonaws.com/1.17.7/2020-07-08/bin/linux/amd64/kubectl
    sudo chmod +x /usr/local/bin/kubectl

    curl --silent --location "https://github.com/weaveworks/eksctl/releases/latest/download/eksctl_$(uname -s)_amd64.tar.gz" | tar xz -C /tmp
    sudo mv -v /tmp/eksctl /usr/local/bin
    
    curl -sSL https://raw.githubusercontent.com/helm/helm/master/scripts/get-helm-3 | bash

    sudo curl --silent --location -o /usr/local/bin/fluxctl "https://github.com/fluxcd/flux/releases/download/1.20.2/fluxctl_linux_amd64"
    sudo chmod +x /usr/local/bin/fluxctl

    ## Install k9s
    installing_k9s

    # upgrade_ebs_storage_Ubuntu
    
    echo "[END][Ubuntu] prerequisites_with_apt() !!!"
}

function prerequisites_with_yum() {
    echo "[BEGIN][CenOS/RedHat/AmazonLinux] prerequisites_with_yum() ..."
    
    sudo yum -y update
	sudo yum install -y jq git wget unzip bash-completion gettext moreutils
	sudo yum groupinstall "Development Tools" -y
    sudo yum install openssl-devel bzip2-devel libffi-devel -y

	# AWS CLI
	CHECKER_AWS=$(aws --version)
	if [[ $CHECKER_AWS != *"aws-cli/2"* ]]; 
		then
			curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
			unzip -d /opt/ -o awscliv2.zip
			cd /opt && sudo ./aws/install
		else _logger "[+] Aws CLI installed"
	fi

    curl -sL https://deb.nodesource.com/setup_12.x | sudo -E bash -
    sudo yum install -y nodejs@12
    npm i -g aws-cdk
    
    sudo curl --silent --location -o /usr/local/bin/kubectl \
         https://amazon-eks.s3.us-west-2.amazonaws.com/1.17.7/2020-07-08/bin/linux/amd64/kubectl
    sudo chmod +x /usr/local/bin/kubectl

    curl --silent --location "https://github.com/weaveworks/eksctl/releases/latest/download/eksctl_$(uname -s)_amd64.tar.gz" | tar xz -C /tmp
    sudo mv -v /tmp/eksctl /usr/local/bin

    sudo curl --silent --location -o /usr/local/bin/fluxctl "https://github.com/fluxcd/flux/releases/download/1.20.2/fluxctl_linux_amd64"
    sudo chmod +x /usr/local/bin/fluxctl

    curl -sSL https://raw.githubusercontent.com/helm/helm/master/scripts/get-helm-3 | bash

    ## Install k9s
    installing_k9s

    # upgrade_ebs_storage_AmazonLinux
    
    sudo wget http://repos.fedorapeople.org/repos/dchen/apache-maven/epel-apache-maven.repo -O /etc/yum.repos.d/epel-apache-maven.repo
    sudo sed -i s/\$releasever/6/g /etc/yum.repos.d/epel-apache-maven.repo
    sudo yum install -y apache-maven
    
    sudo yum install java-11-amazon-corretto
    sudo alternatives --config java #enter the number for corretto 11
    sudo alternatives --config javac #enter the number for corretto 11
    
    echo "[END][CenOS/RedHat/AmazonLinux] prerequisites_with_yum() ..."
}

function prerequisites_with_windows() {
    echo "[BEGIN] prerequisites_with_windows() ..."
    
    ## TODO Installing Windows
    
    echo "[END] prerequisites_with_windows() !!!"
}

function upgrade_ebs_storage_AmazonLinux() {
    _logger "[+] AMZ-Linux2/CenOS EBS Extending a Partition on a T2/T3 Instance"
    sudo file -s /dev/nvme?n*
    sudo growpart /dev/nvme0n1 1
    lsblk
    echo "Extend an ext2/ext3/ext4 file system"
    sudo yum install xfsprogs
    sudo resize2fs /dev/nvme0n1p1
    df -h
}

function upgrade_ebs_storage_Ubuntu() {
    _logger "[+] Ubuntu EBS Extending a Partition on an EC2 Instance"
    sudo growpart /dev/xvda 1
    lsblk
    echo "Extend an EBS Volumne size"
    sudo resize2fs /dev/xvda1
    df -hT
}

function installing_k9s() {
    ## Install k9s
    K9S_VERSION=0.23.1
    K9S_TAR_FILENAME=k9s_$(uname -s)_$(uname -m).tar.gz
    curl -o /tmp/$K9S_TAR_FILENAME -L -k https://github.com/derailed/k9s/releases/download/v${K9S_VERSION}/$K9S_TAR_FILENAME
    tar -xvf /tmp/$K9S_TAR_FILENAME -C /tmp/
    sudo mv /tmp/k9s /usr/local/bin/k9s
    sudo chmod +x /usr/local/bin/k9s    
}

function prerequisites() {
    ## DEBUG purpose
    # processor=$(uname -m)
    # if [ "$processor" == "x86_64" ]; then
    #     arch="amd64"
    # else
    #     arch="386"
    # fi
    # case "$(uname -s)" in
    #     Darwin*)
    #         os="darwin_${arch}"
    #         ;;
    #     MINGW64*)
    #         os="windows_${arch}"
    #         ;;
    #     MSYS_NT*)
    #         os="windows_${arch}"
    #         ;;
    #     *)
    #         os="linux_${arch}"
    #         ;;
    # esac
    # echo "os=$os"
    # echo -e "\n====================================================\n"

    ## FIXME: Prerequisites >> Windows

    echo "OSTYPE=$OSTYPE"
    KERNEL_TYPE=linux
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        echo "Linux OS"
        
        ## TODO: https://github.com/saltstack/salt-bootstrap/blob/develop/bootstrap-salt.sh
        # # Let's test if the lsb_release binary is available
        # rv=$(lsb_release >/dev/null 2>&1)

        # # shellcheck disable=SC2181
        # if [ $? -eq 0 ]; then
            DISTRO_ID=$(lsb_release -si)
            echo "DISTRO_ID=$DISTRO_ID"
            if [[ "$DISTRO_ID" == "Ubuntu" ]]; then
                _logger "[+] Install with apt"
                prerequisites_with_apt
                # sudo apt-get install -y apache2-utils jq gettext bash-completion
            elif [ "$DISTRO_ID" = "AmazonAMI" ] || [ "$DISTRO_ID" = "Amazon" ]; then
                ## FIXME CenOS / RedHat
                _logger "[+] Install with yum"
                prerequisites_with_yum
                # sudo yum install -y jq gettext bash-completion
            else
                echo -e "${RED} ERROR: can't install package"
                exit 1;
            fi
        #     rv=$(lsb_release -sr)
        #     [ "${rv}" != "" ] && DISTRO_VERSION=$(__parse_version_string "$rv")
        # elif [ -f /etc/lsb-release ]; then
        #     # We don't have the lsb_release binary, though, we do have the file it parses
        #     DISTRO_NAME=$(grep DISTRIB_ID /etc/lsb-release | sed -e 's/.*=//')
        #     rv=$(grep DISTRIB_RELEASE /etc/lsb-release | sed -e 's/.*=//')
        #     [ "${rv}" != "" ] && DISTRO_VERSION=$(__parse_version_string "$rv")
        # fi    
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        KERNEL_TYPE=darwin
        _logger "[+] Install with brew"
        prerequisites_with_brew
        # brew install jq wget
    else
        echo -e "${RED}Unsupport platform: $OSTYPE"
        exit 1
    fi
    # echo "kernel=$KERNEL_TYPE"
}

function prerequisites_docker() {
    echo "[BEGIN][Docker] prerequisites_with_docker ..."
    
    ## TODO
    
    echo "[END][Docker] prerequisites_with_docker !!!"    
}

function verify_prerequisites() {
    echo "[BEGIN] verify_prerequisites() ..."
    
    echo "[x] Verify Git client": $(git --version)
    echo "[x] Verify AWS CLI version 2": $(aws --version)
    echo "[x] Verify Node.js": $(node --version)
    echo "[x] Verify CDK": $(cdk --version)
    # echo "[x] Verify Python": $(python -V)
    # echo "[x] Verify Python3": $(python3 -V)
    # echo "[x] Verify Pip": $(pip -V)
    # echo "[x] Verify Pip3": $(pip3 -V)
    # echo "[x] Verify kubectl": $(kubectl version --client)
    # echo "[x] Verify eksctl": $(eksctl version)
    # echo "[x] Verify helm3": $(helm version --short)
    # echo "[x] Verify k9s": $(k9s version --short)
    # echo "[x] Verify fluxctl": $(fluxctl version)
    echo "[END] verify_prerequisites() !!!"
}


function main() {
    started_time=$(date '+%d/%m/%Y %H:%M:%S')
    echo
    echo "#########################################################"
    echo "[START] Environment Prerequisites - starting at ${started_time}"
    echo "#########################################################"
    echo

    # _logger "[+] Prerequisites & Getting Started"
    prerequisites

    # _logger "[+] Prerequisites >> Docker"
    # prerequisites_docker

    _logger "[+] Verify Prerequisites"
    ### Installing AWS CDK tools: https://docs.aws.amazon.com/cdk/latest/guide/tools.html 
    verify_prerequisites

    # upgrade_ebs_storage_AmazonLinux

    ## FIXME
    # aws eks update-kubeconfig --name eks-cluster

    ended_time=$(date '+%d/%m/%Y %H:%M:%S')
    echo
    echo "#########################################################"
    echo -e "${RED} [FINISH] Environment Prerequisites - finished at ${ended_time} - ${started_time} ${NC}"
    echo "#########################################################"
    echo
}

main
