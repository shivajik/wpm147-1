#!/bin/bash

# Fix all remaining map function vulnerabilities in React components

# First, backup and show current map functions
echo "Finding all remaining unprotected .map() calls..."

# Fix dashboard.tsx - replace all unprotected websites.map calls
sed -i 's/{websites\.map(/{Array.isArray(websites) \&\& websites.map(/g' client/src/pages/dashboard.tsx

# Fix other critical files
sed -i 's/\.map((/Array.isArray(\&) \&\& \&.map((/g' client/src/pages/tasks.tsx
sed -i 's/filteredThemes\.map(/Array.isArray(filteredThemes) \&\& filteredThemes.map(/g' client/src/pages/website-themes.tsx
sed -i 's/filteredUsers\.map(/Array.isArray(filteredUsers) \&\& filteredUsers.map(/g' client/src/pages/website-users.tsx
sed -i 's/filteredPlugins\.map(/Array.isArray(filteredPlugins) \&\& filteredPlugins.map(/g' client/src/pages/website-plugins.tsx

echo "Applied systematic fixes to map function vulnerabilities"