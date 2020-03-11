FROM node:lts AS base

WORKDIR /atelier

# ----- Build -----
FROM base AS build

# Fix for Webpack running out of memory
ENV NODE_OPTIONS="--max-old-space-size=4096"

# Install build tools
RUN npm install -g typescript webpack

# Install dependencies separately, so they can be cached
COPY package.json ./
RUN npm install
RUN rm package.json

# Workaround for https://github.com/authenio/samlify-node-xmllint/pull/1
RUN echo "export declare const validate: (xml: string) => Promise<unknown>;" > node_modules/@authenio/samlify-node-xmllint/build/index.d.ts

# Copy in the full application
COPY . .

# Build the application
RUN npm run compile
RUN npm run prod-build

# ----- Release -----
FROM base AS release

# Install dependencies
COPY package.json ./
RUN npm install --production

# Copy the build artifacts from the build stage
COPY --from=build /atelier/build .

# Expose folders that should be kept across deployments
# Configuration files
VOLUME /atelier/config
# Folder where uploaded projects are stored
VOLUME /atelier/uploads
# Folder with the keys for JWT
VOLUME /atelier/api/keys

# Set environment variables
ARG NODE_ENV=production
ENV NODE_ENV ${NODE_ENV}
ARG EXPOSED_PORT=5000
ENV EXPOSED_PORT ${EXPOSED_PORT}

# Expose the port the application runs on
EXPOSE ${EXPOSED_PORT}

# Start the server
ENTRYPOINT [ "node", "api/src/app.js" ]