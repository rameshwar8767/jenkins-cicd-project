pipeline {
    agent any

    environment {
        DOCKER_HUB_USER = 'rameshwarrm'
        IMAGE_NAME = 'jenkins-cicd-app'
        IMAGE_TAG = "v${BUILD_NUMBER}"
        CONTAINER_NAME = 'cicd-app-container'
        APP_PORT = '3000'
    }

    stages {

        stage('📥 Clone Repository') {
            steps {
                echo '=== Cloning code from GitHub ==='
                checkout scm
                sh 'ls -la'
            }
        }

        stage('📦 Install Dependencies') {
            steps {
                echo '=== Installing Node.js dependencies ==='
                sh 'npm install'
            }
        }

        stage('🧪 Run Tests') {
            steps {
                echo '=== Running Tests ==='
                sh 'npm test'
            }
        }

        stage('🐳 Docker Build') {
            steps {
                sh """
                    docker build \
                        --memory=400m \
                        --memory-swap=800m \
                        -t ${DOCKER_HUB_USER}/${IMAGE_NAME}:${IMAGE_TAG} .
                    docker tag ${DOCKER_HUB_USER}/${IMAGE_NAME}:${IMAGE_TAG} \
                            ${DOCKER_HUB_USER}/${IMAGE_NAME}:latest
                """
            }
        }

        stage('🔐 Docker Hub Login & Push') {
            steps {
                echo '=== Pushing image to Docker Hub ==='
                // 'dockerhub-credentials' is the ID you set in Jenkins Credentials
                withCredentials([usernamePassword(
                    credentialsId: 'dockerhub-credentials',
                    usernameVariable: 'DOCKER_USER',
                    passwordVariable: 'DOCKER_PASS'
                )]) {
                    sh """
                        echo $DOCKER_PASS | docker login -u $DOCKER_USER --password-stdin
                        docker push ${DOCKER_HUB_USER}/${IMAGE_NAME}:${IMAGE_TAG}
                        docker push ${DOCKER_HUB_USER}/${IMAGE_NAME}:latest
                    """
                }
            }
        }

        stage('🚀 Deploy Container') {
            steps {
                echo '=== Deploying new container ==='
                sh """
                    # Stop & remove old container if running
                    docker stop ${CONTAINER_NAME} || true
                    docker rm ${CONTAINER_NAME} || true

                    # Run new container
                    docker run -d \
                        --name ${CONTAINER_NAME} \
                        -p ${APP_PORT}:3000 \
                        --restart unless-stopped \
                        ${DOCKER_HUB_USER}/${IMAGE_NAME}:latest

                    echo 'Container deployed successfully!'
                    docker ps | grep ${CONTAINER_NAME}
                """
            }
        }

    }

    post {
        success {
            echo """
            ✅ Pipeline SUCCESS!
            Image: ${DOCKER_HUB_USER}/${IMAGE_NAME}:${IMAGE_TAG}
            App URL: http://YOUR_SERVER_IP:${APP_PORT}
            """
        }
        failure {
            echo '❌ Pipeline FAILED! Check logs above.'
        }
        always {
            // Clean up dangling Docker images to save disk space
            sh 'docker image prune -f || true'
        }
    }
}