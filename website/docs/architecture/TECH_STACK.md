# Axolop CRM - Technology Stack

## Architecture Overview

### Core Technologies
- **Frontend**: React 18.2 with Vite 5 build tool
- **Backend**: Node.js 20+ with Express.js framework
- **Database**: Supabase PostgreSQL (cloud) as primary database
- **Authentication**: Supabase Auth with integration of Auth0 as OAuth provider
- **Infrastructure**: Multi-container Docker setup (frontend, backend, Redis)

### Supporting Services
- **Caching**: Redis (Docker container) via ioredis client
- **AI/Vector Storage**: ChromaDB (local Docker container) for semantic search
- **Real-time**: Supabase Realtime subscriptions
- **File Storage**: Supabase Storage

---

## Detailed Tech Stack

### Frontend Technologies
| Technology | Version | Purpose |
|------------|---------|---------|
| React | 18.2 | Component-based UI framework |
| Vite | 5.x | Build tool and development server |
| TypeScript | 5.x | Type safety for JavaScript |
| TailwindCSS | 3.3 | Utility-first CSS framework |
| shadcn/ui | latest | Pre-built accessible UI components |
| React Router | 7.9.3 | Client-side routing |
| Zustand | 4.5.2 | State management |
| TanStack Query | 5.28.4 | Server state management |
| TanStack Table | 8.13.2 | Data table components |
| TanStack Virtual | 3.1.3 | Virtual scrolling |
| React Hook Form | 7.51.0 | Form management and validation |
| Zod | 3.22.4 | Schema validation |
| Tiptap | 2.2.4 | Rich text editor |
| @dnd-kit | 6.1.0 | Drag and drop functionality |
| Framer Motion | 12.23.24 | Animation library |
| Recharts | 2.12.2 | Chart and visualization library |
| Lucide React | 0.553.0 | Icon library |
| @radix-ui/react-* | various | Accessible UI primitives |

### Backend Technologies
| Technology | Version | Purpose |
|------------|---------|---------|
| Node.js | 20+ | Runtime environment |
| Express | 4.18.2 | Web application framework |
| Supabase.js | 2.81.1 | Database client for PostgreSQL |
| @supabase/supabase-js | 2.81.1 | Supabase client library |
| ioredis | 5.8.2 | Redis client for caching |
| Bull | 4.16.5 | Queue management system |
| helmet | 7.1.0 | Security HTTP headers |
| cors | 2.8.5 | Cross-Origin Resource Sharing |
| express-rate-limit | 7.2.0 | Rate limiting middleware |
| compression | 1.7.4 | Response compression |
| jsonwebtoken | 9.0.2 | JWT token handling |
| bcrypt | 6.0.0 | Password hashing |
| nodemailer | 6.9.16 | Email sending |
| openai | 6.8.1 | OpenAI API client |
| groq-sdk | 0.7.0 | Groq API client |
| @xenova/transformers | 2.17.2 | ML models for browser |
| chromadb | 3.1.1 | Vector database client |
| node-cron | 4.2.1 | Scheduled tasks |

### Database & Storage
| Technology | Version | Purpose |
|------------|---------|---------|
| PostgreSQL | 15+ (via Supabase) | Primary relational database |
| Supabase Auth | latest | Authentication and user management |
| Row Level Security | - | Fine-grained data access control |
| Supabase Storage | - | File and asset storage |
| Redis | 7+ (Docker container) | In-memory caching and queues |
| ChromaDB | latest (local) | Vector database for AI embeddings |

### Infrastructure & DevOps
| Technology | Version | Purpose |
|------------|---------|---------|
| Docker | latest | Containerization of services |
| Docker Compose | 3.8 | Orchestration of multi-container applications |
| dumb-init | - | Proper signal handling in containers |
| Vercel | - | Potential deployment platform (though using local) |

---

## Authentication & Security

### Authentication Flow
1. **Primary**: Supabase Auth for user management
2. **OAuth Provider**: Auth0 configured as external provider
3. **Token Validation**: JWT verification in backend middleware
4. **Session Management**: Supabase session handling

### Security Measures
- **JWT Tokens**: Secure session tokens with proper expiration
- **Row Level Security**: Database-level access control
- **CORS Policy**: Configured for secure cross-origin requests
- **Rate Limiting**: Protection against API abuse
- **Input Validation**: Zod schema validation on both frontend and backend
- **Helmet**: Security headers for Express app

---

## AI & Machine Learning Stack

### AI Services Integration
- **OpenAI**: GPT models for text generation and analysis
- **Groq**: Fast inference for language models
- **Xenova Transformers**: On-device ML models
- **ChromaDB**: Vector storage for semantic search
- **Embeddings**: Text similarity and semantic search

### AI Use Cases
- Lead scoring and qualification
- Email content generation
- Semantic search across CRM data
- Automated responses and suggestions
- Content analysis and categorization

---

## Development Tools & Utilities

### Build & Development
| Technology | Version | Purpose |
|------------|---------|---------|
| Vite | 5.x | Fast development server and bundler |
| ESLint | 9.x+ | Code linting |
| Prettier | 3.2+ | Code formatting |
| nodemon | 3.0+ | Development file watcher |
| concurrently | 8.2.2 | Running multiple processes |

### Testing & Quality
| Technology | Version | Purpose |
|------------|---------|---------|
| Jest | Latest | Unit testing framework |
| React Testing Library | Latest | Component testing |
| Supertest | Latest | API testing |

---

## API & Integration Stack

### External APIs
- **Gmail API**: Email integration and automation
- **SendGrid API**: Transactional email delivery
- **Google OAuth**: Third-party authentication
- **Stripe API**: Payment processing
- **PostHog API**: Product analytics
- **Sentry**: Error tracking and monitoring

### Internal APIs
- **RESTful API**: Express.js backend endpoints
- **Supabase Realtime**: Real-time data synchronization
- **Event System**: In-app event handling for workflows

---

## Deployment Architecture

### Docker Compose Services
```
┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│    frontend     │       │     backend     │       │      redis      │
│    (Nginx)      │       │    (Node.js)    │       │    (Redis)      │
│  Port: 3000     │       │   Port: 3002    │       │   Port: 6379    │
└─────────┬───────┘       └─────────┬───────┘       └─────────┬───────┘
          │                         │                         │
          └───────────┬─────────────┼─────────────────────────┘
                      │             │
            ┌─────────▼─────────────▼─────────┐
            │         Docker Network          │
            └─────────────────────────────────┘
```

### External Services
- **Supabase Cloud**: PostgreSQL Database, Authentication, Storage
- **ChromaDB**: Vector Database (can be run locally via Docker or externally)

---

## Monitoring & Analytics

### Application Monitoring
- **Health Checks**: Built-in health endpoints
- **Logging**: Structured logging in Express app
- **Autoheal**: Container health monitoring
- **Watchtower**: Automatic container updates

### Analytics & Tracking
- **PostHog**: Product analytics and user behavior tracking
- **Sentry**: Error tracking and performance monitoring
- **Custom Events**: Business metrics tracking

---

## File Structure Impact

The tech stack is organized in the following project structure:

```
crm/                          # Root project
├── backend/                  # Express.js server
│   ├── config/              # Database and auth configs
│   ├── controllers/         # Business logic handlers
│   ├── middleware/          # Auth and validation
│   ├── routes/             # API route definitions
│   ├── services/           # Business logic modules
│   └── utils/              # Helper functions
├── frontend/                # React application
│   ├── components/         # Reusable UI components
│   ├── context/            # React context providers
│   ├── hooks/              # Custom React hooks
│   ├── pages/              # Route-based components
│   ├── lib/                # API clients and utilities
│   └── styles/             # CSS and styling
├── docker/                  # Docker configurations
│   ├── frontend/           # Frontend Dockerfile and Nginx config
│   ├── backend/            # Backend Dockerfile
│   └── README.md           # Docker setup documentation
├── public/                  # Static assets
├── config/                  # Build configurations
└── scripts/                 # Utility scripts
```

---

## Performance & Optimization

### Frontend Optimization
- **Code Splitting**: Dynamic imports for route-based splitting
- **Bundle Analysis**: Vite-based bundle optimization
- **Image Optimization**: Modern formats and lazy loading
- **Caching**: Browser and service worker caching

### Backend Optimization
- **Database Queries**: Optimized Supabase queries with proper indexing
- **Caching Strategy**: Redis for frequently accessed data
- **Connection Pooling**: Managed connections to Supabase
- **Asynchronous Operations**: Non-blocking I/O operations

### AI Performance
- **Caching**: Frequently generated AI responses
- **Batch Processing**: Efficient vector operations
- **Model Selection**: Performance vs quality balancing

---

## Third-Party Service Dependencies

| Service | Purpose | Criticality |
|---------|---------|-------------|
| Supabase | Database, Auth, Storage | Critical |
| Auth0 | OAuth provider | High |
| Redis (local) | Caching | Medium |
| ChromaDB (local) | AI/Vector operations | Medium |
| OpenAI | AI features | Medium |
| Groq | AI inference | Medium |
| SendGrid/Gmail | Email | Medium |
| PostHog | Analytics | Low |

---

## Version Strategy

### Core Dependencies
- **React**: Maintained at stable version with periodic updates
- **Node.js**: LTS version with security patches
- **Supabase**: Follow latest stable releases
- **Vite**: Regular updates for performance improvements

### Security Considerations
- Regular dependency updates for security patches
- Audit of third-party packages
- Proper secrets management
- Environment-specific configurations

---

## Future Scalability Considerations

### Horizontal Scaling
- **Load Balancer**: Potential integration with cloud providers
- **Database**: Supabase's built-in scaling
- **Caching**: Redis cluster readiness
- **Application**: Container orchestration ready

### Feature Expansion
- **Microservices**: Potential separation of concerns
- **Event-driven**: Built-in event system for scalability
- **API Gateway**: Potential for complex routing
- **CDN**: Frontend asset delivery optimization