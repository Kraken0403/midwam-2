# Midwam - Frontend

## Environments

| Name           | URL                                                               |
| -------------- | ----------------------------------------------------------------- |
| **Staging**    | [vps804905.ovh.net/midwam/en](http://vps804905.ovh.net/midwam/en) |
| **Production** | [www.midwam.com](https://www.midwam.com/)                         |

## Local Setup

```bash
# install dependencies
$ npm install

# serve with hot reload at localhost:8000
$ npm run dev
```

## Deploy Guide

[Shipit](https://github.com/shipitjs/shipit) is used the automate the deploy process. To speed up the process please add your public [SSH key to the server](https://www.digitalocean.com/community/tutorials/how-to-configure-ssh-key-based-authentication-on-a-linux-server#how-to-copy-a-public-key-to-your-server). The server login details can be found in the PASS file.

Create a release with [git-flow](https://danielkummer.github.io/git-flow-cheatsheet/)

```bash
# start & finish release with the next version number
$ git flow release start *.*.*
$ git flow release finish *.*.*

# push updated master branch with the new tag
$ git push --tags origin master
```

Deploy to server

```bash
# staging
$ npx shipit staging deploy

# production
$ npx shipit production deploy
```
