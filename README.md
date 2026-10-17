# Rated

Rated is a social platform where users can share posts, rate other users' posts, and interact through likes and comments. It combines a casual social-media experience with user profiles, a ranked feed, and notification status updates.

## Live Demo

- **Application:** [Try Rated](https://itsrated.vercel.app/)
- **Test account:** `testuser1@gmail.com`
- **Password:** `password123`

Use the test account to explore the application's features without creating a new account.

## Repositories

- **Frontend:** [Frontend Repository](https://github.com/SHREERAJ10/rated-web)
- **Backend:** [Backend Repository](https://github.com/SHREERAJ10/rated-server)

## Features

- **Authentication** — User authentication with Firebase.
- **Posts** — Create posts with captions and images.
- **Post ratings** — Rate posts shared by other users.
- **Likes and comments** — Interact with posts and engage with other users.
- **User profiles** — View user information and their posts.
- **Ranked feed** — A deterministic ranking algorithm determines the order of posts in the feed.
- **Infinite scrolling** — Load additional posts as you scroll through the feed.
- **User search** — Search for users by username or display name, including partial matches.
- **Notification status** — Receive notification-status updates every 30 seconds, with a highlighted badge indicating new notifications.
- **Responsive interface** — A responsive UI for navigating and interacting with the application.

## Tech Stack

**Frontend**
- React
- TypeScript
- React Router
- TanStack Query
- Tailwind CSS
- shadcn/ui

**Backend**
- Node.js
- Express
- TypeScript
- Prisma ORM
- PostgreSQL (Neon)

**Services and Libraries**
- Firebase Authentication
- Cloudinary for image storage
- `@microsoft/fetch-event-source` for Server-Sent Events (SSE)

## Engineering Highlights

- **Server-state management:** Used TanStack Query for caching, infinite queries, and optimistic updates to keep the interface responsive while synchronizing changes with the server.
- **Feed ranking:** Implemented a deterministic ranking algorithm to determine the order of posts in the feed.
- **Secure image uploads:** Used signed Cloudinary uploads to authorize uploads without exposing the signing secret to the client.
- **Failure handling:** Clean up uploaded Cloudinary media when the corresponding database operation fails, preventing orphaned uploads.
- **Partial-match search:** Used PostgreSQL's `pg_trgm` extension with GIN indexes to support efficient searches across usernames and display names.
- **Notification updates:** Used Server-Sent Events with `@microsoft/fetch-event-source` to periodically send notification status to connected clients.

## Running Locally

The frontend and backend are maintained in separate repositories. Clone and configure each repository independently.

### Prerequisites

- Node.js
- pnpm
- A PostgreSQL database
- A Firebase project with Authentication configured
- A Cloudinary account

### 1. Clone the repositories

```bash
git clone https://github.com/SHREERAJ10/rated-web
git clone https://github.com/SHREERAJ10/rated-server
```

### 2. Install dependencies

Run the following commands in each repository's directory:

```bash
pnpm install
```

### 3. Configure environment variables

Set up the required environment variables in each repository.

- **Frontend:** Firebase configuration and backend API URL.
- **Backend:** Database connection, Firebase authentication verification, and Cloudinary credentials.

Refer to each repository's configuration and scripts for the exact variable names.

### 4. Set up the backend

In the backend repository, run the required database migrations and generate the Prisma client using the configured scripts.

Start the backend using its development script.

### 5. Start the frontend

In the frontend repository, start the application using its development script.

Make sure the backend is running and accessible at the API URL configured in the frontend.

**Note:** Keep secret keys and database credentials in environment variables. Never commit them to either repository.

## Status

Completed and deployed.