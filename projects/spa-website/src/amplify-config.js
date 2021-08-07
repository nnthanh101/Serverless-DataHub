// This file is used for manual configuration of the Amplify library.
// When Amplify is used in conjunction with the Amplify CLI toolchain or AWS Mobile Hub to manage backend resources,
// an aws-exports.js file is auto-generated and can be used instead of the below to automatically configure the Amplify library.
// In this workshop, we are using the Amplify client libraries without the CLI toolchain so you should edit this file manually.

const awsConfig = {
    Auth: {
        region:              'ap-southeast-1',                                      // example: 'ap-southeast-1'
        userPoolWebClientId: '5mq3vfn91bfc98te76616mc2s4',                          // example: ' 768l5okg32p4rtsl29lv7ck1uh'
        identityPoolId:      'ap-southeast-1:b5bbaddc-c140-43de-938f-ca1b3cc226ab', // example: 'ap-southeast-1:e87499b0-f1ec-405b-8ad2-20d530cc97cc'
        userPoolId:          'ap-southeast-1_qM4JKIICf'                             // example: 'ap-southeast-1_FpmviHBJe'
    },
    API: {
        endpoints: [
            {
                name: 'WildRydesAPI',
                endpoint: '', // example: 'https://u8swuvl00f.execute-api.ap-southeast-1.amazonaws.com/prod'
                region:   ''  // example: 'ap-southeast-1'
            }
        ]
    },
    Storage: {
        bucket: '',              //example: 'wildrydesbackend-profilepicturesbucket-1wgssc97ekdph'
        region: 'ap-southeast-1' // example: 'ap-southeast-1'
    }
}

export default awsConfig;