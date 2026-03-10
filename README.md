# Production Chat Backend 🚀

This is a production-grade backend for a high-scale chat application, built with Spring Boot, PostgreSQL (Neon), and Redis.

## 🛠️ Requirements
- **Java 17+**
- **Maven 3.6+** (or use the included `./mvnw`)
- **Docker** (optional, for local Redis)
- **Neon Account** (for cloud PostgreSQL)

## 💻 Running in IntelliJ IDEA

### 1. Import Project
1. Open IntelliJ IDEA.
2. Select **File > Open** and navigate to the `e:\chatapp` directory.
3. Select `pom.xml` and click **Open as Project**.
4. Wait for Maven to download all dependencies.

### 2. Configure Environment Variables
The application uses environment variables for sensitive configuration. You can set these in IntelliJ:
1. Go to **Run > Edit Configurations**.
2. Select the `ChatAppApplication` configuration (or create a new **Spring Boot** or **Application** configuration pointing to `org.example.demo.ChatAppApplication`).
3. In the **Environment Variables** field, add the following (replace with your actual values):
   - `DATABASE_URL`: `jdbc:postgresql://your-neon-host/chat_db?sslmode=require`
   - `DATABASE_USER`: `your_user`
   - `DATABASE_PASSWORD`: `your_password`
   - `JWT_SECRET`: `your_very_complex_random_secret_key`
   - `REDIS_HOST`: `localhost` (or your cloud Redis host)
   - `REDIS_PORT`: `6379`

### 3. Database Initialization
The application will automatically create the necessary tables on first start (`spring.jpa.hibernate.ddl-auto=update`).
It also includes a `DataInitializer` that populates default roles (`ROLE_USER`, `ROLE_ADMIN`).

### 4. Run the Application
- Click the **Green Play Button** next to `ChatAppApplication`.
- The server will start on [http://localhost:8080](http://localhost:8080).

## 📖 API Documentation
Once the app is running, you can access the Swagger UI:
[http://localhost:8080/swagger-ui/index.html](http://localhost:8080/swagger-ui/index.html)

## 🧪 Testing with Swagger
1. Use the `/api/auth/signup` endpoint to create a user.
2. Use the `/api/auth/signin` endpoint to login and get a **JWT Token**.
3. Use the token to authorize further requests (Authorize button in Swagger).

## 📡 WebSockets
- **Endpoint**: `/ws-chat`
- **Topic for public messages**: `/topic/public/{conversationId}`
- **Queue for private messages**: `/user/queue/messages`
