🛡️ Secure Data Ingestion System
A robust, three-tier web application built with Node.js, Express, and MySQL. This system provides a secure gateway for both manual data entry and bulk CSV processing, featuring multi-layered defense against common web vulnerabilities.

🚀 Key Features
Two-Way Ingestion: Supports manual form submission and high-speed bulk CSV uploads.

Security First: * XSS Protection: Input sanitization via HTML entity encoding.

SQL Injection Defense: Comprehensive use of Prepared Statements.

Server-Side Validation: Strict Regex-based data integrity checks.

Memory Efficient: Uses Node.js streams to parse large CSV files without overloading server RAM.

Modern UI: A sleek, non-centralized dashboard design with real-time AJAX feedback.

📂 Project StructureFileResponsibilityserver.jsMain entry point; handles routing and Multer configuration.processor.jsBusiness logic layer; performs Regex validation and XSS cleaning.db-client.jsDatabase layer; manages connection pooling and schema initialization.public/gateway.jsFrontend controller; manages AJAX fetches and dynamic UI updates.public/index.htmlThe dashboard interface.

[![Review Assignment Due Date](https://classroom.github.com/assets/deadline-readme-button-22041afd0340ce965d47ae6ef1cefeee28c7c493a6346c4f15d667ab976d596c.svg)](https://classroom.github.com/a/gCxlkD7T)
