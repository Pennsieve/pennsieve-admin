#!groovy

if (env.BRANCH_NAME == "master") {
    buildEnv = "production"
    executorEnv = "prd"
} else {
    buildEnv = "dev"
    executorEnv = "dev"
}

node('executor') {
    ws("/tmp/pennsieve-admin-app") {
        checkout scm
        def authorName = sh(returnStdout: true, script: 'git --no-pager show --format="%an" --no-patch').trim()

        try {
            stage("Build") {
                sh """#!/bin/bash -ex
                    node -v
                    yarn run clean
                    yarn
                    yarn run build-${buildEnv}"""
            
                stash includes: "dist/**", name: 'dist'
            }

            stage("Test") {
                sh """#!/bin/bash
                    xvfb-run --auto-servernum --server-args='-screen 0, 1024x768x16' yarn run test"""
            }

            if (["DEVELOPMENT", "master"].contains(env.BRANCH_NAME)) {
                stage('Deploy') {
                    node("${executorEnv}-executor") {
                        def bucketName = "pennsieve-${executorEnv}-admin-use1"

                        unstash 'dist'

                        sh "aws s3 --region us-east-1 rm --recursive s3://$bucketName"
                        sh "aws s3 --region us-east-1 cp --recursive dist s3://$bucketName"
                        
                        def distributionId = sh(
                            script: "aws cloudfront list-distributions --query \"DistributionList.Items[?contains(Origins.Items[0].DomainName, '${bucketName}.s3.amazonaws.com')].Id\" --output text",
                            returnStdout: true
                        ).trim()
                        def response = sh(returnStdout: true, script: "aws cloudfront create-invalidation --distribution-id ${distributionId} --paths '/*'").trim()
                        println "$response"
                        def responseMap = new groovy.json.JsonSlurperClassic().parseText(response)
                        def invalidation = responseMap.Invalidation
                        sh "aws cloudfront wait invalidation-completed --distribution-id ${distributionId} --id ${invalidation.Id}"
                    }
                }
            }
        } catch (e) {
            slackSend(color: '#b20000', message: "FAILED: Job '${env.JOB_NAME} [${env.BUILD_NUMBER}]' (${env.BUILD_URL}) by ${authorName}")
            throw e
        }

        slackSend(color: '#006600', message: "SUCCESSFUL: Job '${env.JOB_NAME} [${env.BUILD_NUMBER}]' (${env.BUILD_URL}) by ${authorName}")
    }
}
