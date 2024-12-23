# Install build tools
RUN apk add --no-cache build-base libc6-compat

COPY package.json package-lock.json ./

RUN npm install

COPY . .

# Build the app
RUN npm run build

# Install `serve` to serve the built files
#RUN npm i -g serve

# Expose the port
EXPOSE 5173

# Fix the CMD instruction to run multiple commands npm run build && 
CMD sh -c "npm run preview -- --host --port 5173"