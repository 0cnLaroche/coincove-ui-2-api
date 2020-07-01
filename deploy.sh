API_REPOSITORY=
WEBAPP_REPOSITORY=https://github.com/0cnLaroche/coincove-ui-2.git

installNode() 
{
    local VERSION=12.x
    local DISTRO=linux-x64
    echo "Installing Node, Npm and Npx"
    curl -sL https://deb.nodesource.com/setup_$VERSION | sudo -E bash -
    sudo apt-get install nodejs
    echo "Testing installations"
    if ! command -v git &> /dev/null
    then
    fi
}

echo "********** DEPLOYING *************"
echo "Looking for dependencies"
if ! command -v git &> /dev/null
then
    echo "git could not be found. Installing git ..."
    sudo apt install git-all
else 
    echo "git found"
fi
if ! command -v node &> /dev/null
then
    echo "node could not be found. Installing node js ..."
    installNode
else 
    echo "node found"
fi
