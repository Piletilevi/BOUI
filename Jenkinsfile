pipeline {
    agent any
    environment {
        project = "${env.JOB_NAME}"
        ciServer = "${env.CI_SERVER}"
        ciUser = 'ci'
        ciSshKey = 'ci-ssh-key'
        zipRegistry = "10.1.16.43:8080/repository/grey-bo"
        zipRegistryUrl = "http://${zipRegistry}"
        registryCredential = 'nexus-credentials'
        applicationPath = 'plevi/piletilevi-bo/'
        build = "${env.BUILD_NUMBER}"
        packageName = "boui.zip"
    }
    stages {
        stage('Building packaged') {
            steps {
                echo "Zipping files together..."
                zip zipFile: 'boui.zip', archive: false, dir:".", glob:"app/**/*,api/**/*,views/**/*,css/**/*,js/**/*,img/**/*,fonts/**/*,"
            }
        }
        stage('Archive') {
            steps {
                script {
                    withCredentials([usernameColonPassword(credentialsId: registryCredential, variable: 'regCredential')]) {
                        echo "Pushing deploy package to Nexus"
                        sh 'curl --fail -v --user $regCredential --upload-file "$PWD"/target/${packageName} ${zipRegistryUrl}/${project}/${build}/${packageName}'
                    }
                }
            }
        }


    }
    post {
        always {
            notifyBuild(currentBuild.currentResult)
        }
    }
}

def notifyBuild(String buildStatus) {
    def colorCode = '#FF0000'
    def subject = "${buildStatus}: Job '${env.JOB_NAME} [${env.BUILD_NUMBER}]'"
    if (buildStatus == 'UNSTABLE') {
        colorCode = '#FFFF00'
        subject = "Uh-oh, the build ${env.JOB_NAME} [${env.BUILD_NUMBER}] is unstable!"
    } else if (buildStatus == 'SUCCESS') {
        colorCode = '#00FF00'
        subject = "Well done, the build ${env.JOB_NAME} [${env.BUILD_NUMBER}] is ready!"
    } else {
        colorCode = '#FF0000'
        subject = "Good god, the build ${env.JOB_NAME} [${env.BUILD_NUMBER}] did not finish!"
    }
    echo "Notifying slack ${subject}"
    slackSend(color: colorCode, message: subject)
}
