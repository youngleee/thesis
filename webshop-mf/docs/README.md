# WebShop Micro-Frontend Architecture Documentation

## Introduction

This documentation provides a comprehensive overview of the WebShop micro-frontend application, with a special focus on real-time communication using WebSockets and SQLite for data persistence. This project demonstrates how to structure a scalable, maintainable e-commerce application using micro-frontend architecture principles while ensuring seamless real-time updates across independently deployable frontend components.

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [WebSocket Implementation](#websocket-implementation)
3. [SQLite Integration](#sqlite-integration)
4. [Micro-Frontend Components](#micro-frontend-components)
5. [Backend Services](#backend-services)
6. [Communication Patterns](#communication-patterns)
7. [Setup and Running](#setup-and-running)
8. [Deployment Strategy](#deployment-strategy)
9. [Performance Considerations](#performance-considerations)
10. [Troubleshooting](#troubleshooting)
11. [Future Enhancements](#future-enhancements)

## Architecture Overview

The WebShop application is built using a micro-frontend architecture, which decomposes the frontend into smaller, independently deployable applications. Each micro-frontend focuses on a specific business domain:

- **Shell Application**: Acts as a container and orchestrator for the micro-frontends
- **Product Listing**: Displays available products and allows filtering/searching
- **Product Details**: Shows detailed information for a selected product
- **Shopping Cart**: Manages the user's cart with add/remove/update functionality

The architecture employs Webpack 5 Module Federation to dynamically load these micro-frontends at runtime, facilitating independent development and deployment cycles.

## WebSocket Implementation

A key feature of this application is its real-time communication capability implemented using WebSockets. This enables instant updates across all micro-frontends when state changes occur.

Detailed documentation:
- [WebSocket Integration](./WebSocketIntegration.md): In-depth analysis of the WebSocket implementation
- [WebSocket Communication Flow](./WebSocketFlow.md): Visual diagrams explaining data flow and communication patterns

### Key Benefits of WebSocket Integration:

1. **Real-Time Synchronization**: Changes made in one micro-frontend immediately reflect in others
2. **Reduced Network Overhead**: 99.7% reduction in requests compared to polling
3. **Enhanced User Experience**: Instantaneous updates create a seamless shopping experience
4. **Resilient Design**: Fallback mechanisms ensure functionality even when WebSockets are unavailable

## SQLite Integration

The backend service utilizes SQLite for data persistence, providing a lightweight yet powerful database solution:

- **Self-contained database**: The entire database exists as a single file
- **Zero configuration**: No separate server process to install or manage
- **ACID compliant**: Ensures data integrity
- **Schema-based**: Well-defined tables for products and cart items
- **Perfect for thesis demonstration**: Easy to showcase data persistence without complex setup

The SQLite database automatically creates the necessary tables and stores product and cart information persistently.

## Micro-Frontend Components

Each micro-frontend is a self-contained Vue.js application that:
- Can be developed and deployed independently
- Has its own repository, build process, and deployment pipeline
- Exposes a public API for integration with the shell
- Maintains encapsulation of its internal implementation details

### Shell Application

The shell application serves as the container for all micro-frontends and is responsible for:
- Routing between different views
- Loading and orchestrating micro-frontends
- Managing global state and authentication
- Providing a consistent UI framework

### Product Listing Micro-Frontend

The Product Listing micro-frontend handles:
- Displaying a grid of available products
- Implementing search and filter functionality
- Providing "Add to Cart" functionality
- Navigating to product details

### Product Details Micro-Frontend

The Product Details micro-frontend is responsible for:
- Displaying comprehensive product information
- Showing product images and specifications
- Handling quantity selection
- Providing "Add to Cart" functionality
- Displaying related products

### Shopping Cart Micro-Frontend

The Shopping Cart micro-frontend manages:
- Displaying cart items with quantities and prices
- Updating item quantities
- Removing items from the cart
- Calculating order totals
- Proceeding to checkout

## Backend Services

The backend provides RESTful APIs and WebSocket services for the micro-frontends:

- **RESTful API**: Supports standard CRUD operations for products and cart
- **WebSocket Server**: Enables real-time updates across micro-frontends
- **SQLite Database**: Provides persistent storage for products and cart items
- **Publisher-Subscriber Model**: Broadcasts cart updates to all connected clients

## Communication Patterns

### Cross-Micro-Frontend Communication

The application employs several communication patterns:

1. **Props/Events from Shell**: Basic data passing for simple scenarios
2. **Custom Browser Events**: For indirect communication between micro-frontends
3. **WebSockets**: For real-time updates and synchronization
4. **URL Parameters**: For sharing state that should be bookmarkable
5. **Global Function Exposure**: Direct function access for critical navigation operations

For a comprehensive overview of all communication patterns, see:
- [Micro-Frontend Communication Patterns](./MicrofrontendCommunicationPatterns.md): Detailed analysis of all communication approaches

### Hybrid Approach Benefits

The combination of RESTful API and WebSocket communication provides:
- Structured, well-defined endpoints for core operations
- Real-time updates for enhanced user experience
- Fallback mechanisms for resilience
- Loose coupling between micro-frontends

### Cross-Micro-Frontend Navigation

Navigation between micro-frontends presented specific challenges that were addressed with a multi-layered approach:

- **Global Navigation Functions**: Exposed on the window object for direct access
- **Custom Events**: Used for indirect communication
- **URL Parameter Handling**: For bookmarkable navigation states
- **Fallback Mechanisms**: Multiple approaches to ensure navigation reliability

For detailed information on navigation implementation and troubleshooting, see:
- [Cart Navigation Fixes](./CartNavigationFixes.md): Comprehensive analysis of cross-micro-frontend navigation challenges and solutions

## Setup and Running

Detailed instructions for setting up and running the WebShop application:

- [Running the Application](./RunningTheApplication.md): Comprehensive guide for installation, running different components, and troubleshooting common issues

This guide covers:
- Prerequisites and installation steps
- Different ways to run the application (batch file, PowerShell scripts, npm commands)
- Troubleshooting common issues
- Development tips for working with SQLite and WebSockets

## Troubleshooting

The WebShop application includes documentation for troubleshooting common issues:

- [Cart Navigation Fixes](./CartNavigationFixes.md): Solutions for navigation issues between micro-frontends
- [Running the Application](./RunningTheApplication.md): Common setup and initialization issues

These guides provide practical solutions for the most commonly encountered problems during development and testing.

## Deployment Strategy

The application is configured for flexible deployment options:

- **Development**: Each micro-frontend runs on its own port for local development
- **Production**: Can be deployed as:
  - Separate applications behind a reverse proxy
  - Static assets served from a CDN
  - Container-based deployment (Docker)

## Performance Considerations

The application implements several performance optimizations:

- **Webpack Code Splitting**: Only load what's needed when it's needed
- **Shared Dependencies**: Common libraries are shared to reduce bundle size
- **Lazy Loading**: Components are loaded on-demand
- **WebSocket Efficiency**: Reduces network overhead compared to polling
- **Optimistic UI Updates**: Enhances perceived performance

## Future Enhancements

Potential areas for future development:

1. **Authentication/Authorization**: User management and secured API endpoints
2. **Advanced Database Features**: 
   - Migrations for schema evolution
   - Transactions for complex operations
   - Data backup and recovery mechanisms
3. **Advanced WebSocket Features**: 
   - Topic-based channels for targeted updates
   - Connection pooling for scalability
   - Secure WebSocket (WSS) implementation
4. **Advanced UI Features**:
   - Offline support with service workers
   - Progressive Web App capabilities
   - Advanced product filtering and search

## Conclusion

This micro-frontend architecture with WebSocket integration and SQLite persistence demonstrates a modern approach to building complex, scalable web applications. By combining independent, domain-focused micro-frontends with real-time communication capabilities and proper data persistence, the application achieves architectural flexibility, enhanced user experience, and reliable data management. 