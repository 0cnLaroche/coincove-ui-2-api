# Certbot is providing TLS certificate and installing an autorenewal service
echo "Installing Certbot repository"
sudo apt-get update
sudo apt-get install software-properties-common
sudo add-apt-repository universe
sudo add-apt-repository ppa:certbot/certbot
sudo apt-get update
echo "Installing Certbot"
sudo apt-get install certbot