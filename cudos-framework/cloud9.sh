source "./script/lib/common.sh"
_logger "[+] Install required packages ..."
sudo yum install jq -y

_logger "[+] Verify Prerequisites ..."
echo "[x] Verify AWS CLI:" "$(aws --version 2>&1)"
echo "[x] Verify Terraform:" "$(terraform --version | head -1)"
echo "[x] Verify jq:" "$(jq --version)"
