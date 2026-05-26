pipeline {
    agent any

    environment {
        DOCKER_HUB_USER  = 'rameshwarrm'
        IMAGE_NAME       = 'jenkins-cicd-app'
        IMAGE_TAG        = "v${BUILD_NUMBER}"
        CONTAINER_NAME   = 'cicd-app-container'
        APP_PORT         = '3000'
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
                sh 'npm install --no-audit --no-fund'
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
                echo "=== Building Docker Image ==="
                sh """
                    docker build -t ${DOCKER_HUB_USER}/${IMAGE_NAME}:${IMAGE_TAG} .
                    docker tag ${DOCKER_HUB_USER}/${IMAGE_NAME}:${IMAGE_TAG} \
                               ${DOCKER_HUB_USER}/${IMAGE_NAME}:latest
                """
            }
        }

        stage('🔐 Docker Hub Login & Push') {
            steps {
                echo '=== Pushing image to Docker Hub ==='
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
                    docker stop ${CONTAINER_NAME} || true
                    docker rm   ${CONTAINER_NAME} || true

                    docker run -d \
                        --name ${CONTAINER_NAME} \
                        -p ${APP_PORT}:3000 \
                        --restart unless-stopped \
                        ${DOCKER_HUB_USER}/${IMAGE_NAME}:latest

                    echo '✅ Container deployed!'
                    docker ps | grep ${CONTAINER_NAME}
                """
            }
        }
    }

    post {
        success {
            echo "✅ SUCCESS! Image: ${DOCKER_HUB_USER}/${IMAGE_NAME}:${IMAGE_TAG}"
        }
        failure {
            echo '❌ FAILED! Check logs above.'
        }
        always {
            script {
                sh 'docker image prune -f || true'
            }
        }
    }
}