# WeP0c

Fast API application for pentesters to share their POCs with their clients in a secure way.

## Overview

WeP0c is a FastAPI-based application designed for penetration testers to securely share their proof-of-concept (POC) exploits with their clients. The application ensures secure and efficient communication between pentesters and clients, providing a streamlined workflow for sharing and reviewing POCs.

## Features

- Secure sharing of POCs
- Authentication and authorization
- Real-time updates and notifications
- Detailed logging and audit trails
- RESTful API for integration with other tools

## Architecture

The application architecture consists of the following components:

- **FastAPI Server**: The core backend service handling API requests and business logic.
- **PostgreSQL Database**: Stores application data, user information, and logs.
- **Docker**: Containerization of the application for consistent deployment.
- **React Frontend (Future Work)**: A React-based frontend for user interaction.
- **Azure AD Authentication (Future Work)**: Integration with Azure Active Directory for authentication.
- **GitHub Actions (Future Work)**: CI/CD workflows for automated testing and deployment.

## Getting Started

### Prerequisites

- Docker
- Docker Compose

### Installation

1. Clone the repository:
    ```sh
    git clone https://github.com/zwxxb/WeP0c.git
    cd WeP0c
    ```

2. Create a `.env` file with the following content:
    ```env
    DATABASE_URL=postgresql://postgres:postgres@db:5432/postgres
    ```

3. Build and start the services:
    ```sh
    docker-compose up --build
    ```

4. Access the application at [http://localhost:8001](http://localhost:8001).

## Usage

### API Endpoints

- `GET /api/users`: Retrieve a list of users.
- `POST /api/users`: Create a new user.
- `GET /api/projects`: Retrieve a list of projects.
- `POST /api/projects`: Create a new project.
- `GET /api/vulnerabilities`: Retrieve a list of vulnerabilities.
- `POST /api/vulnerabilities`: Create a new vulnerability.

## Contributing

We welcome contributions from the community! Here's how you can help:

1. Fork the repository.
2. Create a new branch for your feature or bugfix.
3. Commit your changes and push your branch to GitHub.
4. Create a pull request with a detailed description of your changes.

## Open Issues and Improvements

- Replace ID from int to UUIDs in models: Improve the security and uniqueness of model identifiers.
- Make `requirements.txt` a parameter of the function and a user input parameter: Enhance the flexibility of dependency management.
- Create a Dockerfile: Standardize the application environment.
- Add a timeout and execution of JavaScript/HTML/Bash codes: Enhance the application's capabilities.
- Create a frontend (React): Develop a user-friendly interface for the application.
- Create unit tests: Ensure the reliability and correctness of the application.
- Make GitHub workflow: Automate testing and deployment processes.
- Add Azure AD authentication: Integrate with Azure Active Directory for user authentication.

## License

This project is licensed under the MIT License.