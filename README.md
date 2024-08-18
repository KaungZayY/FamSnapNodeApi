# FamSnap API

FamSnap is a Node.js API for managing photo albums and images, including image uploads to Cloudinary. 
This API provides endpoints for managing albums and images using MySQL as the database and Cloudinary for image storage.

## Table of Contents
1. [ Tech Stack](#-tech-stack)
2. [API Endpoints V1](#-api-endpoints-v1)
3. [Test Locally](#-test-locally)
4. [Conclusion](#-conclusion)

##  Tech Stack

- **Backend**: Node.js
- **Database**: MySQL
- **Image Storage**: Cloudinary

## API Endpoints V1

The API exposes several endpoints for managing photo albums and images.

Base URL: https://fam-snap-node-api.vercel.app/

**Albums**

- GET `/api/v1/albums`: Retrieve all albums.
- POST `/api/v1/albums`: Create a new album. (name, description required)
- GET `/api/v1/albums/:id`: Retrieve a specific album by ID.
- PUT `/api/v1/albums/:id`: Update an album by ID.
- PATCH `/api/v1/albums/:id`: Partially update an album by ID.
- DELETE `/api/v1/albums/:id`: Delete an album by ID.
 
**Images**

- GET `/api/v1/images`: Retrieve all images.
- POST `/api/v1/images/upload`: Upload an image to Cloudinary. (form-data:image required)
- POST `/api/v1/images`: Create a new image. (title, image, album_id required)
- GET `/api/v1/images/:id`: Retrieve a specific image by ID.
- PUT `/api/v1/images/:id`: Update an image by ID.
- PATCH `/api/v1/images/:id`: Partially update an image by ID.
- DELETE `/api/v1/images/:id`: Delete an image by ID.

## Test Locally

### Prerequisites
Before you begin, ensure you have the following installed on your machine:

- **Node.js** (version 18.x or higher)
- **npm**
- **MySQL**
- **Docker:** installed on your system
- **Docker Compose:** installed on your system

### Step 1: Clone the Repository

Clone the repository on your local machine.
```bash
git clone git@github.com:KaungZayY/FamSnapNodeApi.git
```
`cd` into cloned repository.
```bash
cd FamSnapNodeApi
```

### Step 2: Environmental Variable Setup
Copy the `.env.example` file as `.env`
```bash
cp .env.example .env
```
Setup the env variables in `.env`.

### Step 3: NPM install
```bash
npm install
```

### Step 4: Git Check to `DockerizedVersion` branch
```bash
git checkout DockerizedVersion
```
### Step 5: Add Nacessary Repositories

At the root of your project directory, create a new folder named public.

```bash
mkdir public
```

Inside the `public` folder, create `images` sub-folder to store images.

```bash
cd images
```
```bash
mkdir images
```

Your project directory structure should now look like this:

```
FamSnapNodeApi/
├── database/
├── node_modules/
├── public/
│   ├── images/
├── v1/
└── (other project files and folders)
```

### Step 6: Build the Docker Image

Build the docker image by using the following bash command.

```bash
docker-compose build --no-cache
```

### Step 7: Run the Docker Container

Run the Docker container in the detach mode.

```bash
docker-compose up -d
```

### Step 8: Import the database

Go to `http://localhost:8081/` to access phpmyadmin pannel and import the database `/database/fam_snap.sql`.

### Step 9: Change MySQL Auth Mode (If necessary)
```bash
docker-compose exec db mysql -u root -p
```
```bash
ALTER USER 'root'@'%' IDENTIFIED WITH mysql_native_password BY '123';
FLUSH PRIVILEGES;
```

Restart docker-compose
```bash
docker-compose restart
```

### Step 10: Test the Api Locally
Base URL: `http://localhost:3000`

**Albums**

- GET : `/api/v1/albums`
- POST : `/api/v1/albums` @params : name, description required
- GET : `/api/v1/albums/:id`
- PUT : `/api/v1/albums/:id`
- PATCH : `/api/v1/albums/:id`
- DELETE : `/api/v1/albums/:id`

**Images**

- GET : `/api/v1/images`
- POST : `/api/v1/images/upload` @params : form-data:image
- POST : `/api/v1/images`: @params : title, image, album_id
- GET : `/api/v1/images/:id`
- PUT : `/api/v1/images/:id`
- PATCH : `/api/v1/images/:id`
- DELETE : `/api/v1/images/:id`

## 📋 Conclusion
FamSnap API offers a robust solution for managing photo albums and image uploads, utilizing Node.js for the backend, MySQL for the database, and Cloudinary for image storage. With clear and well-structured API endpoints, users can create, retrieve, update, and delete albums and images efficiently. The Dockerized setup ensures smooth local development, and the use of environment variables allows flexibility in configuration for different environments.

Whether you are testing locally or deploying to production, this API provides a solid foundation for managing your photo albums and image assets in a scalable way.

For further improvements or contributions, feel free to fork the repository, create a feature branch, and submit a pull request. Enjoy building with FamSnap!