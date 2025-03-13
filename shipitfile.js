module.exports = (shipit) => {
    require('shipit-deploy')(shipit);

    shipit.initConfig({
        default: {
            repositoryUrl: 'git@github.com:immersive-garden/midwam-front.git',
        },
        staging: {
            servers: 'ig@51.75.203.255',
        },
        production: {
            servers: 'root@68.183.12.28',
        },
    });

    const configs = {
        staging: {
            projectPath: '~/midwam-front/',
        },
        production: {
            projectPath: '/var/www/midwam.com/',
        },
    };

    shipit.blTask('git-pull', async () => {
        const config = configs[shipit.environment];
        await shipit.remote(`cd ${config.projectPath} && git checkout master && git pull origin master`);
    });

    shipit.blTask('install-packages', async () => {
        const config = configs[shipit.environment];
        await shipit.remote(`cd ${config.projectPath} && npm i`);
    });

    shipit.blTask('env-file', async () => {
        const config = configs[shipit.environment];
        await shipit.remote(`cd ${config.projectPath} && cp .env.${shipit.environment} .env`);
    });

    shipit.blTask('nuxt-build', async () => {
        const config = configs[shipit.environment];
        await shipit.remote(`cd ${config.projectPath} && npm run build:${shipit.environment}`);
    });

    shipit.blTask('pm2-restart', async () => {
        await shipit.remote(`pm2 restart nuxt-server`);
    });

    shipit.blTask('deploy', () => {
        return shipit.start('git-pull', 'install-packages', 'env-file', 'nuxt-build', 'pm2-restart');
    });
};
