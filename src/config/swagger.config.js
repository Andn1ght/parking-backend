const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "Parking Finder API",
            version: "1.0.0",
            description: "API documentation for the Parking Finder system",
        },
        servers: [{ url: "http://localhost:5000" }]
    },
    apis: ["./src/api/*.js"]
};

const swaggerSpec = swaggerJsdoc(options);

const setupSwagger = (app) => {
    app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
    console.log("📄 Swagger documentation available at http://localhost:5000/api-docs");
};

module.exports = setupSwagger;