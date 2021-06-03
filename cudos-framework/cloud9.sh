source "./script/lib/common.sh"

_logger "[+] Verify Prerequisites ..."
printf "[x] Verify AWS CLI: %s\n" "$(echo $(aws --version 2>&1))"
printf "[x] Verify Terraform: %s\n" "$(terraform --version | head -1)"
printf "[x] Verify jq: %s \n" "$(jq --version)"