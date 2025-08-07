#!/bin/bash

# H1B Explorer Frontend Build Script
# This script prepares the frontend for deployment

echo "🚀 Building H1B Explorer Frontend..."

# Create dist directory if it doesn't exist
mkdir -p dist

# Copy HTML file to dist
echo "📄 Copying index.html..."
cp index.html dist/

# Create a simple build info file
echo "📝 Creating build info..."
cat > dist/build-info.txt << EOF
H1B Explorer Frontend Build
Build Date: $(date)
Git Commit: $(git rev-parse HEAD 2>/dev/null || echo "unknown")
Version: 1.0.0
EOF

echo "✅ Frontend build complete!"
echo "📁 Build output: dist/"
echo "📋 Files:"
ls -la dist/
