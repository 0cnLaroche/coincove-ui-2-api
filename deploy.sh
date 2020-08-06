API_APP_NAME=coincove-ui-2-api
WEB_APP_NAME=coincove-ui-2
API_APP_REPOSITORY=https://github.com/0cnLaroche/coincove-ui-2-api.git
WEB_APP_REPOSITORY=https://github.com/0cnLaroche/coincove-ui-2.git

installNode() 
{
    local VERSION=12.x
    local DISTRO=linux-x64
    echo "Installing Node, Npm and Npx"
    curl -sL https://deb.nodesource.com/setup_$VERSION | sudo -E bash -
    sudo apt-get install nodejs
    sudo install -g forever
    # echo "Testing installations"
    # Do some testing here for node npm npx
}

installMongoDb()
{
    echo "Installing mongoDb"
    wget -qO - https://www.mongodb.org/static/pgp/server-4.4.asc | sudo apt-key add -
    echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu bionic/mongodb-org/4.4 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-4.4.list
    sudo apt-get update
    echo "MongoDB installation completed. Lunching mongo process"
    sudo systemctl start mongod
    sudo systemctl enable mongod
    sudo systemctl status mongod

}

updateApiApp()
{
    if [ ! -d "/server/$API_APP_NAME"]; then
            echo "Server app not found, cloning into server directory"
        mkdir server
        (cd server && git clone $API_APP_REPOSITORY)
    fi
    echo "Updating server app source code"
    (cd server/$API_APP_REPOSITORY && git pull && npm run-script build)
}

updateWebApp()
{
    if [ ! -d "/webapp/$WEB_APP_NAME"]; then
        echo "Web app not found, cloning into webapp directory"
        mkdir webapp
        (cd webapp && git clone $WEB_APP_REPOSITORY)
    fi
    echo "Updating web app source code"
    (cd server/$WEB_APP_REPOSITORY && git pull && npm install)
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
if ! command -v mongo &> /dev/null
then
    echo "mongo could not be found. Installing mongoDb ..."
    installMongoDb
else 
    echo "mongoDb found"
fi
echo "Dependencies : OK"

#updateApiApp
#updateWebApp

